import {spawn} from "node:child_process";
import {setTimeout as pause} from "node:timers/promises";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
const entry=".next/standalone/server.js";
assert.ok(existsSync(entry),"Missing Next standalone compiled entrypoint");
const port=32045;
const base="http://127.0.0.1:"+port;
const child=spawn(process.execPath,[entry],{
  env:{...process.env,PORT:String(port),HOSTNAME:"127.0.0.1",NODE_ENV:"production"},
  stdio:["ignore","pipe","pipe"]
});
let output="";
for(const stream of [child.stdout,child.stderr]){
  stream.on("data",chunk=>{output+=String(chunk);});
}
try{
  let ready=false;
  for(let i=0;i<50;i++){
    if(child.exitCode!==null)throw new Error("Compiled server exited early: "+output);
    try{
      const response=await fetch(base+"/login");
      if(response.ok){ready=true;break;}
    }catch(error){
      if(child.exitCode!==null)throw error;
    }
    await pause(300);
  }
  assert.ok(ready,"Compiled server failed readiness within 15 seconds: "+output);
  for(const path of ["/","/login","/login?tab=register"]){
    const response=await fetch(base+path);
    assert.equal(response.status,200,path+" did not return 200");
    assert.match(await response.text(),/MLM COMMUNITY FORUM/);
  }
  for(const path of ["/demo","/dashboard"]){
    const response=await fetch(base+path);
    assert.equal(response.status,404,path+" should not be an unrestricted dashboard");
  }
  const login=await(await fetch(base+"/login")).text();
  assert.match(login,/Welcome back/);
  assert.doesNotMatch(login,/Demo@123|member@mlmforum\.demo|Open Demo Dashboard/);
  const assets=[...login.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map(m=>m[1]);
  assert.ok(assets.some(asset=>asset.endsWith(".css")),"No compiled CSS asset linked");
  assert.ok(assets.some(asset=>asset.endsWith(".js")),"No compiled JS asset linked");
  for(const path of [assets.find(x=>x.endsWith(".css")),assets.find(x=>x.endsWith(".js"))]){
    const response=await fetch(base+path);
    assert.equal(response.status,200,"Compiled asset unavailable: "+path);
  }
  console.log("Production build startup, public auth routes and static assets verified; auth backend not yet connected.");
}finally{
  child.kill("SIGTERM");
  await pause(400);
  if(child.exitCode===null)child.kill("SIGKILL");
}
