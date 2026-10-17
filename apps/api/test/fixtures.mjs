import {PrismaClient,Role,UserStatus} from "@prisma/client";
import {hash} from "argon2";
const db=new PrismaClient();
const seed={
 sponsor:{email:"test-sponsor@mlmforum.invalid",memberCode:"TEST-SPONSOR-1",mobile:"9876543210",name:"Test Sponsor"},
 member:{email:"test-member@mlmforum.invalid",memberCode:"TEST-MEMBER-1",mobile:"9876543211",name:"Test Member"},
 blocked:{email:"test-blocked@mlmforum.invalid",memberCode:"TEST-BLOCKED-1",mobile:"9876543212",name:"Test Blocked"},
 childA:{email:"test-child-a@mlmforum.invalid",memberCode:"TEST-CHILD-A",mobile:"9876543215",name:"Downline Alpha"},
 childB:{email:"test-child-b@mlmforum.invalid",memberCode:"TEST-CHILD-B",mobile:"9876543216",name:"Downline Beta"},
 grandchild:{email:"test-grandchild@mlmforum.invalid",memberCode:"TEST-GRANDCHILD",mobile:"9876543217",name:"Downline Gamma"}
};
export const testPassword="Integration-Test-Password-Only-123!";
export const testAccounts=seed;
export function ensureIsolatedTestDb(){
 const raw=process.env.DATABASE_URL??"";
 const url=new URL(raw);
 if(process.env.APP_ENV!=="local"||
   !["127.0.0.1","localhost"].includes(url.hostname)||
   url.pathname!=="/mlmforum_test")
  throw new Error("Fixture operation refused outside isolated local mlmforum_test DB");
}
export async function createFixture(){
 ensureIsolatedTestDb();
 const passwordHash=await hash(testPassword);
 for(const [key,data] of Object.entries(seed)){
  const user=await db.user.upsert({
   where:{email:data.email},
   create:{...data,passwordHash,status:key==="blocked"?UserStatus.SUSPENDED:UserStatus.ACTIVE,
    mobileVerifiedAt:new Date(),emailVerifiedAt:new Date()},
   update:{name:data.name,passwordHash,status:key==="blocked"?UserStatus.SUSPENDED:UserStatus.ACTIVE,
    mobileVerifiedAt:new Date(),emailVerifiedAt:new Date()}
  });
  const fixtureRole=key==="sponsor"?Role.BUSINESS:Role.MEMBER;
  // Deterministic when the same isolated test DB is reused.
  await db.userRole.deleteMany({where:{userId:user.id,role:{not:fixtureRole}}});
  await db.userRole.upsert({
   where:{userId_role:{userId:user.id,role:fixtureRole}},
   create:{userId:user.id,role:fixtureRole},update:{}
  });
 }
 // Only test fixtures establish confirmed sponsorship links. Pending registration
 // does not create a link and no production placement workflow is added here.
 const accounts=await db.user.findMany({
  where:{email:{in:Object.values(seed).map(x=>x.email)}},select:{id:true,email:true}
 });
 const ids=Object.fromEntries(accounts.map(user=>[user.email,user.id]));
 for(const [child,parent] of [
  [seed.childA.email,seed.member.email],
  [seed.childB.email,seed.member.email],
  [seed.grandchild.email,seed.childA.email]
 ]){
  await db.memberSponsorLink.upsert({
   where:{memberId:ids[child]},
   create:{memberId:ids[child],sponsorId:ids[parent]},
   update:{sponsorId:ids[parent]}
  });
 }
}
export async function cleanFixture(){
 ensureIsolatedTestDb();
 await db.registrationRequest.deleteMany({where:{OR:[
  {email:"test-intake@mlmforum.invalid"},{email:"test-registration@mlmforum.invalid"}
 ]}});
 const ids=(await db.user.findMany({
  where:{email:{in:Object.values(seed).map(x=>x.email)}},select:{id:true}
 })).map(x=>x.id);
 if(ids.length){
  await db.memberNetworkFilterDraft.deleteMany({where:{memberId:{in:ids}}});
  await db.memberSponsorLink.deleteMany({where:{OR:[{memberId:{in:ids}},{sponsorId:{in:ids}}]}});
  await db.session.deleteMany({where:{userId:{in:ids}}});
  await db.userRole.deleteMany({where:{userId:{in:ids}}});
  await db.user.deleteMany({where:{id:{in:ids}}});
 }
}
const command=process.argv[2];
if(command==="create"||command==="clean"){
 try{
  if(command==="create")await createFixture();else await cleanFixture();
  console.log("Isolated auth fixture "+command+" completed");
 }finally{await db.$disconnect();}
}
