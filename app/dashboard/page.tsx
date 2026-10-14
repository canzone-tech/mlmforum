"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Brand} from "../../components/Brand";
type User={id:string;name:string;roles:string[]};
export default function DashboardEntry(){
 const [user,setUser]=useState<User|null>(null);
 const [state,setState]=useState<"loading"|"ready"|"unauthorized"|"unavailable">("loading");
 useEffect(()=>{
  let active=true;
  fetch("/api/auth/me",{credentials:"same-origin",cache:"no-store"}).then(async response=>{
   if(!active)return;
   if(response.status===401){setState("unauthorized");return;}
   if(!response.ok){setState("unavailable");return;}
   const data:User=await response.json();
   if(active){setUser(data);setState("ready");}
  }).catch(()=>{if(active)setState("unavailable");});
  return()=>{active=false;};
 },[]);
 async function logout(){
  try{await fetch("/api/auth/logout",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:"{}"});}
  finally{window.location.assign("/login");}
 }
 return <div className="auth-page"><header className="site-header"><Brand/><Link href="/" className="btn btn-outline">Portal Home</Link></header>
  <main className="portal-placeholder" aria-live="polite">
   {state==="loading"?<p>Checking your account…</p>:
    state==="unauthorized"?<><h1>Login required</h1><Link className="btn btn-primary" href="/login">Login</Link></>:
    state==="unavailable"?<><h1>Account service unavailable</h1><p>Please try again later.</p></>:
    <><h1>Welcome, {user?.name}</h1><p>Signed in. Your authorized role{user?.roles.length===1?"":"s"}: {user?.roles.join(", ")}</p><p>Role-specific workspace screens will be added module by module from the approved client design.</p><button type="button" className="btn btn-primary" onClick={logout}>Logout</button></>}
  </main></div>;
}
