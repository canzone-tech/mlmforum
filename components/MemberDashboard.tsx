"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Brand} from "./Brand";
import {memberNavigation} from "../config/member-navigation";
import {GenealogyView} from "./GenealogyView";
import {MemberNetworkView} from "./MemberNetworkView";

type Identity={id:string;name:string;roles:string[]};
type MemberOverview={
 account:{name:string;memberCode:string;status:string;joinedAt:string;
  emailVerified:boolean;mobileVerified:boolean};
 recentSignIns:{at:string;status:string}[];
};
type View="loading"|"unauthorized"|"unavailable"|"ready";

export function MemberDashboard({section}:{section:"overview"|"genealogy"|"my-network"}){
 const [identity,setIdentity]=useState<Identity|null>(null);
 const [overview,setOverview]=useState<MemberOverview|null>(null);
 const [view,setView]=useState<View>("loading");
 const [menuOpen,setMenuOpen]=useState(false);

 useEffect(()=>{
  const controller=new AbortController();
  async function load(){
   try{
    const response=await fetch("/api/auth/me",{
     credentials:"same-origin",cache:"no-store",signal:controller.signal
    });
    if(controller.signal.aborted)return;
    if(response.status===401){setView("unauthorized");return;}
    if(!response.ok){setView("unavailable");return;}
    const user:Identity=await response.json();
    if(!user||!Array.isArray(user.roles)){setView("unavailable");return;}
    if(user.roles.includes("MEMBER")){
     const result=await fetch("/api/member/overview",{
      credentials:"same-origin",cache:"no-store",signal:controller.signal
     });
     if(controller.signal.aborted)return;
     if(result.status===401){setView("unauthorized");return;}
     if(!result.ok){setView("unavailable");return;}
     const data:MemberOverview=await result.json();
     if(!data?.account?.memberCode){setView("unavailable");return;}
     setOverview(data);
    }
    setIdentity(user);
    setView("ready");
   }catch{
    if(!controller.signal.aborted)setView("unavailable");
   }
  }
  void load();
  return()=>controller.abort();
 },[]);

 async function logout(){
  try{
   await fetch("/api/auth/logout",{
    method:"POST",headers:{"Content-Type":"application/json"},
    credentials:"same-origin",body:"{}"
   });
  }finally{window.location.assign("/login");}
 }

 if(view!=="ready"||!identity)
  return <div className="auth-page">
   <header className="site-header"><Brand/><Link href="/" className="btn btn-outline">Portal Home</Link></header>
   <main className="portal-placeholder" aria-live="polite">
    {view==="loading"?<p>Checking your account…</p>:
     view==="unauthorized"?<><h1>Login required</h1><Link className="btn btn-primary" href="/login">Login</Link></>:
     <><h1>Account service unavailable</h1><p>Please try again later.</p></>}
   </main>
  </div>;

 // Other roles keep the existing minimal signed-in entry point: their
 // dashboard modules and permission-scoped APIs have not been built yet.
 if(!identity.roles.includes("MEMBER")||!overview)
  return <div className="auth-page">
   <header className="site-header"><Brand/><Link href="/" className="btn btn-outline">Portal Home</Link></header>
   <main className="portal-placeholder">
    <h1>Welcome, {identity.name}</h1>
    <p>Signed in. Your authorized role{identity.roles.length===1?"":"s"}: {identity.roles.join(", ")}</p>
    <p>The role-specific dashboard will be added when that module is implemented and verified.</p>
    <button className="btn btn-primary" type="button" onClick={logout}>Logout</button>
   </main>
  </div>;

 const member=overview.account;
 const firstName=member.name.split(" ")[0];
 const cards=[
  {label:"Member ID",value:member.memberCode,note:"Your registered member reference"},
  {label:"Account status",value:member.status,note:"From your account record"},
  {label:"Email verification",value:member.emailVerified?"Verified":"Pending",note:"Account verification status"},
  {label:"Mobile verification",value:member.mobileVerified?"Verified":"Pending",note:"Account verification status"}
 ];
 const joined=new Date(member.joinedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
 return <div className="workspace">
  <header className="site-header dash-header">
   <Brand/>
   <div className="dash-user">
    <span className="member-avatar" aria-hidden="true">{member.name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}</span>
    <span className="dash-identity"><b>{member.name}</b><small>Member</small></span>
    <button type="button" className="btn btn-outline" onClick={logout}>Logout</button>
    <button type="button" className="dashboard-menu-toggle" aria-label="Toggle workspace menu"
     aria-controls="member-sidebar" aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)}>☰</button>
   </div>
  </header>
  <div className="dash-layout">
   <aside className={menuOpen?"sidebar open":"sidebar"} id="member-sidebar" aria-label="Member workspace navigation">
    <div className="sidebar-label">WORKSPACE</div>
    <nav aria-label="Member modules">
     {memberNavigation.map(item=>"href" in item?
      <Link key={item.id} href={item.href}
       aria-current={section===item.id?"page":undefined} className={section===item.id?"active":""}
       onClick={()=>setMenuOpen(false)}>{item.label}<span aria-hidden="true">›</span></Link>:
      <span key={item.id} className="sidebar-disabled" aria-disabled="true"
       title="Module not yet available">{item.label}<span aria-hidden="true">›</span></span>)}
    </nav>
    <Link className="sidebar-home" href="/">← Public portal</Link>
   </aside>
   {menuOpen&&<button type="button" aria-label="Close workspace menu"
    className="menu-backdrop" onClick={()=>setMenuOpen(false)}/>}
   <main className="dash-main">{section==="overview"?<>
    <div className="breadcrumb">Workspace / <span>Dashboard Overview</span></div>
    <div className="dash-title-row">
     <div><h1>Good day, {firstName} 👋</h1>
      <p>Member workspace — a tailored view of your responsibilities and next actions.</p></div>
     <span className="tag">Member</span>
    </div>
    <p className="notice">Your account details below are current records. Discussions, event registrations, saved resources and income statistics will appear only after their modules are implemented and verified.</p>
    <section className="dash-grid" aria-label="Your member account summary">
     {cards.map(card=><article className="metric-card" key={card.label}>
      <span>{card.label}</span><b>{card.value}</b><small>{card.note}</small>
     </article>)}
    </section>
    <div className="dash-columns">
     <section className="dash-panel" aria-labelledby="activity-title">
      <h2 id="activity-title">Your recent account activity</h2>
      {overview.recentSignIns.length===0?
       <div className="empty-state">No account sign-ins recorded.</div>:
       <div className="table-scroll"><table className="data-table">
        <thead><tr><th>Item</th><th>Time</th><th>Status</th></tr></thead>
        <tbody>{overview.recentSignIns.map((entry,index)=><tr key={entry.at+"-"+index}>
         <td>Account sign-in</td>
         <td>{new Date(entry.at).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}</td>
         <td><span className={entry.status==="Active"?"status":"status pending"}>{entry.status}</span></td>
        </tr>)}</tbody>
       </table></div>}
     </section>
     <section className="dash-panel" aria-labelledby="next-title">
      <h2 id="next-title">Recommended next actions</h2>
      <div className="feed-row"><span className="member-avatar">1</span>
       <div><b>Review account details</b><small>Check your membership and verification details</small></div>
       <a href="#account-details" className="mini-btn">Open</a></div>
      <div className="feed-row"><span className="member-avatar">2</span>
       <div><b>Visit the public portal</b><small>Explore available public information</small></div>
       <Link href="/" className="mini-btn">Open</Link></div>
     </section>
    </div>
    <section className="dash-panel account-details" id="account-details" aria-labelledby="details-title">
     <h2 id="details-title">Account details</h2>
     <dl className="account-fields">
      <div><dt>Name</dt><dd>{member.name}</dd></div>
      <div><dt>Member ID</dt><dd>{member.memberCode}</dd></div>
      <div><dt>Member since</dt><dd>{joined}</dd></div>
      <div><dt>Account status</dt><dd>{member.status}</dd></div>
     </dl>
    </section>
    <footer className="dash-footer">MLM Community Forum • Member workspace • No financial operations</footer>
</>:section==="genealogy"?<GenealogyView/>:<MemberNetworkView/>}
   </main>
  </div>
 </div>;
}
