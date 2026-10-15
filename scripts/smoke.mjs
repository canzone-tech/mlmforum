import {spawn} from "node:child_process";
import {setTimeout as pause} from "node:timers/promises";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
const entry=".next/standalone/server.js";
assert.ok(existsSync(entry),"Missing Next standalone compiled entrypoint");
const port=32123;
const base="http://127.0.0.1:"+port;
const child=spawn(process.execPath,[entry],{
 env:{...process.env,PORT:String(port),HOSTNAME:"127.0.0.1",NODE_ENV:"production"},
 stdio:["ignore","pipe","pipe"]
});
let output="";
for(const stream of [child.stdout,child.stderr])stream.on("data",chunk=>{output+=String(chunk);});
try{
 let ready=false;
 for(let i=0;i<60;i++){
  if(child.exitCode!==null)throw new Error("Next runtime exited: "+output);
  try{
   const response=await fetch(base+"/login");
   if(response.ok){ready=true;break;}
  }catch(error){if(child.exitCode!==null)throw error;}
  await pause(300);
 }
 assert.ok(ready,"Compiled Next server readiness timeout: "+output);
 for(const path of ["/","/login","/login?tab=register","/dashboard"]){
  const response=await fetch(base+path);
  assert.equal(response.status,200,"Next route "+path);
  assert.match(await response.text(),/MLM COMMUNITY FORUM/);
 }
 assert.equal((await fetch(base+"/demo")).status,404,"Legacy bypass route must stay absent");
 const readyApi=await fetch("http://127.0.0.1:"+(process.env.API_PORT??"4000")+"/health/ready");
 assert.equal(readyApi.status,200,"Compiled NestJS DB readiness");
 const unauth=await fetch(base+"/api/auth/me");
 assert.equal(unauth.status,401,"Same-origin Next API rewrite must preserve unauthenticated 401");
 const restricted=await fetch(base+"/api/member/overview");
 assert.equal(restricted.status,401,"Member overview must deny guest access");
 const login=await(await fetch(base+"/login")).text();
 assert.doesNotMatch(login,/Demo@123|member@mlmforum\.demo|Open Demo Dashboard/);
 const assets=[...login.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map(m=>m[1]);
 assert.ok(assets.some(x=>x.endsWith(".css")),"Missing CSS link");
 assert.ok(assets.some(x=>x.endsWith(".js")),"Missing JS link");
 for(const asset of [assets.find(x=>x.endsWith(".css")),assets.find(x=>x.endsWith(".js"))])
  assert.equal((await fetch(base+asset)).status,200,"Compiled asset "+asset);
 console.log("Compiled Next/NestJS startup, DB readiness, 401, routes and static assets PASS");
}finally{
 child.kill("SIGTERM");
 await pause(400);
 if(child.exitCode===null)child.kill("SIGKILL");
}
