import test from "node:test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import {PrismaClient} from "@prisma/client";
import {createFixture,cleanFixture,testAccounts,testPassword,ensureIsolatedTestDb} from "./fixtures.mjs";
test("compiled NestJS + MySQL login, sponsor, registration, cookie/RBAC and session lifecycle",async t=>{
 ensureIsolatedTestDb();
 await cleanFixture();
 await createFixture();
 const db=new PrismaClient();
 const base="http://127.0.0.1:"+(process.env.API_PORT??"4000");
 let logs="";
 const app=spawn(process.execPath,["dist/main.js"],{cwd:process.cwd(),env:process.env,stdio:["ignore","pipe","pipe"]});
 for(const stream of [app.stdout,app.stderr])stream.on("data",chunk=>logs+=String(chunk));
 const request=async(path,options={})=>fetch(base+path,options);
 const post=(path,body,cookie,origin)=>
  request(path,{method:"POST",headers:{"Content-Type":"application/json",...(cookie?{Cookie:cookie}:{}),
   ...(origin?{Origin:origin}:{})},body:JSON.stringify(body)});
 const cookiePairs=response=>response.headers.getSetCookie().map(line=>line.split(";")[0]).join("; ");
 try{
  let ready=false;
  for(let count=0;count<60;count++){
   if(app.exitCode!==null)throw new Error("Backend exited: "+logs);
   try{const response=await request("/health/ready");if(response.ok){ready=true;break;}}catch(error){
    if(app.exitCode!==null)throw error;
   }
   await delay(250);
  }
  assert.ok(ready,"Compiled backend did not become ready: "+logs);
  await t.test("liveness and database readiness",async()=>{
   assert.equal((await request("/health/live")).status,200);
   assert.equal((await request("/health/ready")).status,200);
  });
  await t.test("guest cannot see user, even by supplying arbitrary role",async()=>{
   assert.equal((await request("/api/auth/me?role=admin")).status,401);
   const x=await post("/api/auth/register",{
    fullName:"Attacker",email:"admin-request@mlmforum.invalid",mobileNo:"9876543299",
    sponsorId:testAccounts.sponsor.memberCode,requestedAccountType:"admin",
    interest:"Leadership",consent:true
   });
   assert.equal(x.status,400);
  });
  await t.test("only active verified sponsor is discoverable",async()=>{
   const sponsor=await request("/api/sponsors/"+testAccounts.sponsor.memberCode);
   assert.equal(sponsor.status,200);
   assert.deepEqual(await sponsor.json(),{name:testAccounts.sponsor.name});
   assert.equal((await request("/api/sponsors/UNKNOWN-123")).status,404);
   assert.equal((await request("/api/sponsors/__proto__")).status,400);
   assert.equal((await request("/api/sponsors/"+testAccounts.blocked.memberCode)).status,404);
  });
  await t.test("registration creates pending request, not an active account or password",async()=>{
   const payload={fullName:"Intake Person",email:"test-intake@mlmforum.invalid",mobileNo:"9876543213",
    sponsorId:testAccounts.sponsor.memberCode,requestedAccountType:"business",
    interest:"Products & Services",consent:true};
   const response=await post("/api/auth/register",payload);
   assert.equal(response.status,202);
   assert.equal((await response.json()).status,"pending_verification");
   const pending=await db.registrationRequest.findUnique({where:{email:payload.email}});
   assert.equal(pending?.status,"PENDING_VERIFICATION");
   assert.equal(pending?.requestedRole,"BUSINESS");
   assert.equal(pending?.consentVersion,process.env.CONSENT_POLICY_VERSION);
   assert.ok(pending?.consentRecordedAt);
   assert.equal(await db.user.count({where:{email:payload.email}}),0);
   assert.equal((await post("/api/auth/register",payload)).status,409);
   assert.equal((await post("/api/auth/register",{...payload,consent:false,
     email:"invalid-consent@mlmforum.invalid"})).status,400);
  });
  await t.test("member overview is identity-scoped and denies non-member roles",async()=>{
   assert.equal((await request("/api/member/overview")).status,401);
   assert.equal((await request("/api/member/overview?userId=anything")).status,401);
   const memberLogin=await post("/api/auth/login",{email:testAccounts.member.email,password:testPassword});
   assert.equal(memberLogin.status,200);
   const memberCookies=cookiePairs(memberLogin);
   const own=await request("/api/member/overview?userId=other",{
    headers:{Cookie:memberCookies}
   });
   assert.equal(own.status,200);
   const data=await own.json();
   assert.equal(data.account.memberCode,testAccounts.member.memberCode);
   assert.equal(data.account.name,testAccounts.member.name);
   assert.equal(data.account.status,"ACTIVE");
   assert.equal(data.account.emailVerified,true);
   assert.equal(data.account.mobileVerified,true);
   assert.ok(Array.isArray(data.recentSignIns));
   assert.ok(data.recentSignIns.length>=1);
   assert.ok(!JSON.stringify(data).includes(testAccounts.sponsor.mobile));
   assert.ok(!JSON.stringify(data).includes("passwordHash"));
   const sponsorLogin=await post("/api/auth/login",{email:testAccounts.sponsor.email,password:testPassword});
   assert.equal(sponsorLogin.status,200);
   assert.equal((await request("/api/member/overview",{
    headers:{Cookie:cookiePairs(sponsorLogin)}
   })).status,403);
   const blocked=await post("/api/auth/login",{email:testAccounts.blocked.email,password:testPassword});
   assert.equal(blocked.status,401);
   assert.equal((await post("/api/auth/logout",{},memberCookies)).status,204);
   assert.equal((await request("/api/member/overview",{
    headers:{Cookie:memberCookies}
   })).status,401);
  });
  await t.test("read-only non-binary genealogy is scoped, depth-bounded and resists cycles",async()=>{
   assert.equal((await request("/api/member/genealogy")).status,401);
   const memberLogin=await post("/api/auth/login",{
    email:testAccounts.member.email,password:testPassword
   });
   assert.equal(memberLogin.status,200);
   const memberCookies=cookiePairs(memberLogin);
   const treeResponse=await request("/api/member/genealogy?memberId=arbitrary&role=admin",{
    headers:{Cookie:memberCookies}
   });
   assert.equal(treeResponse.status,200);
   const tree=await treeResponse.json();
   assert.equal(tree.root.memberCode,testAccounts.member.memberCode);
   assert.equal(tree.levels[0].level,1);
   assert.deepEqual(tree.levels[0].members.map(x=>x.memberCode),
    [testAccounts.childA.memberCode,testAccounts.childB.memberCode]);
   assert.equal(tree.levels[1].members[0].memberCode,testAccounts.grandchild.memberCode);
   assert.equal(tree.levels[1].members[0].sponsorCode,testAccounts.childA.memberCode);
   assert.equal(tree.levels[2].displayed,0);
   assert.ok(tree.viewMaxLevel<=3);
   assert.ok(!JSON.stringify(tree).includes(testAccounts.sponsor.email));
   assert.ok(!JSON.stringify(tree).includes("passwordHash"));
   assert.ok(!JSON.stringify(tree).includes(testAccounts.blocked.memberCode));
   assert.equal("rank" in tree,false);
   assert.equal("commission" in tree,false);
   const outsider=await post("/api/auth/login",{
    email:testAccounts.sponsor.email,password:testPassword
   });
   assert.equal(outsider.status,200);
   assert.equal((await request("/api/member/genealogy",{
    headers:{Cookie:cookiePairs(outsider)}
   })).status,403);
   const nestedLogin=await post("/api/auth/login",{
    email:testAccounts.childA.email,password:testPassword
   });
   assert.equal(nestedLogin.status,200);
   const nestedTree=await (await request("/api/member/genealogy",{
    headers:{Cookie:cookiePairs(nestedLogin)}
   })).json();
   assert.deepEqual(nestedTree.levels[0].members.map(x=>x.memberCode),
    [testAccounts.grandchild.memberCode]);
   assert.ok(!JSON.stringify(nestedTree).includes(testAccounts.childB.memberCode));

   const member=await db.user.findUniqueOrThrow({
    where:{email:testAccounts.member.email},select:{id:true}
   });
   const grandchild=await db.user.findUniqueOrThrow({
    where:{email:testAccounts.grandchild.email},select:{id:true}
   });
   // Corrupt historical cycle: reader must never echo the root as descendant.
   await db.memberSponsorLink.create({
    data:{memberId:member.id,sponsorId:grandchild.id}
   });
   const cyclic=await (await request("/api/member/genealogy",{
    headers:{Cookie:memberCookies}
   })).json();
   assert.equal(cyclic.levels[2].displayed,0);
   assert.ok(!cyclic.levels.flatMap(x=>x.members).some(x=>x.memberCode===testAccounts.member.memberCode));
   await db.memberSponsorLink.delete({where:{memberId:member.id}});
   assert.equal((await post("/api/auth/logout",{},memberCookies)).status,204);
   assert.equal((await request("/api/member/genealogy",{
    headers:{Cookie:memberCookies}
   })).status,401);
  });
  await t.test("unauthorized and suspended login fails",async()=>{
   assert.equal((await post("/api/auth/login",{email:testAccounts.member.email,password:"wrong"})).status,401);
   assert.equal((await post("/api/auth/login",{email:testAccounts.blocked.email,password:testPassword})).status,401);
   assert.equal((await post("/api/auth/login",{},undefined,"https://untrusted.example")).status,403);
  });
  await t.test("real login sets HttpOnly cookies, role from DB, refresh rotation and logout revocation",async()=>{
   const login=await post("/api/auth/login",{email:testAccounts.member.email,password:testPassword});
   assert.equal(login.status,200);
   const setCookies=login.headers.getSetCookie();
   assert.ok(setCookies.some(x=>x.startsWith("mlmf_access=")&&x.includes("HttpOnly")));
   assert.ok(setCookies.some(x=>x.startsWith("mlmf_refresh=")&&x.includes("HttpOnly")));
   const oldCookies=cookiePairs(login);
   const identity=await request("/api/auth/me",{headers:{Cookie:oldCookies}});
   assert.equal(identity.status,200);
   const user=await identity.json();
   assert.equal(user.name,testAccounts.member.name);
   assert.deepEqual(user.roles,["MEMBER"]);
   assert.ok(!JSON.stringify(user).includes("passwordHash"));
   const rotated=await post("/api/auth/refresh",{},oldCookies);
   assert.equal(rotated.status,200);
   const freshCookies=cookiePairs(rotated);
   assert.equal((await request("/api/auth/me",{headers:{Cookie:oldCookies}})).status,401);
   assert.equal((await post("/api/auth/refresh",{},oldCookies)).status,401);
   assert.equal((await request("/api/auth/me",{headers:{Cookie:freshCookies}})).status,200);
   assert.equal((await post("/api/auth/logout",{},freshCookies)).status,204);
   assert.equal((await request("/api/auth/me",{headers:{Cookie:freshCookies}})).status,401);
   assert.equal((await post("/api/auth/logout",{},freshCookies)).status,204);
  });
 }finally{
  app.kill("SIGTERM");
  await delay(400);
  if(app.exitCode===null)app.kill("SIGKILL");
  await db.$disconnect();
  await cleanFixture();
 }
});
