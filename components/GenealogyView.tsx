"use client";
import {useEffect,useMemo,useState} from "react";

type Node={memberCode:string;name:string;sponsorCode:string};
type Level={level:number;members:Node[];displayed:number;truncated:boolean};
type Network={
 root:{memberCode:string;name:string};
 levels:Level[];viewMaxLevel:number;viewLimitPerLevel:number;complete:boolean;
};
type Status="loading"|"ready"|"unauthorized"|"error";

export function GenealogyView(){
 const [network,setNetwork]=useState<Network|null>(null);
 const [status,setStatus]=useState<Status>("loading");
 const [level,setLevel]=useState("all");
 const [query,setQuery]=useState("");
 const [search,setSearch]=useState("");
 const [selected,setSelected]=useState("");

 useEffect(()=>{
  const controller=new AbortController();
  async function load(){
   try{
    const response=await fetch("/api/member/genealogy",{
     credentials:"same-origin",cache:"no-store",signal:controller.signal
    });
    if(controller.signal.aborted)return;
    if(response.status===401){setStatus("unauthorized");return;}
    if(!response.ok){setStatus("error");return;}
    const data:Network=await response.json();
    if(!data?.root?.memberCode||!Array.isArray(data.levels)){
     setStatus("error");return;
    }
    setNetwork(data);
    setStatus("ready");
   }catch{
    if(!controller.signal.aborted)setStatus("error");
   }
  }
  void load();
  return()=>controller.abort();
 },[]);

 const visible=useMemo(()=>{
  const term=search.trim().toLowerCase();
  return (network?.levels??[])
   .filter(item=>level==="all"||item.level===Number(level))
   .map(item=>({...item,members:term?
    item.members.filter(member=>
     member.memberCode.toLowerCase().includes(term)||
     member.name.toLowerCase().includes(term)
    ):item.members}));
 },[network,level,search]);
 const count=network?.levels.reduce((sum,item)=>sum+item.displayed,0)??0;
 const matches=visible.reduce((sum,item)=>sum+item.members.length,0);
 function reset(){setLevel("all");setQuery("");setSearch("");setSelected("");}

 return <>
  <div className="breadcrumb">Workspace / <span>MLM Genealogy Tree</span></div>
  <div className="dash-title-row">
   <div><h1>MLM Genealogy — Level Plan 1:10</h1>
    <p>Level-based sponsor network. This is not a binary left/right tree.</p></div>
   <span className="tag">READ-ONLY</span>
  </div>
  <p className="notice"><b>Plan reference:</b> one sponsor with up to 10 direct members at Level 1.
   Only confirmed, active and verified member links are displayed.
   These visible counts are not rank-eligibility, commission or payout calculations.</p>
  <form className="genealogy-toolbar" role="search"
   onSubmit={event=>{event.preventDefault();setSearch(query);}}>
   <label className="sr-only" htmlFor="tree-search">Search displayed member ID or name</label>
   <input id="tree-search" aria-label="Search displayed member ID or name"
    value={query} onChange={event=>setQuery(event.target.value)}
    placeholder="Search member ID or name" maxLength={100}/>
   <label className="sr-only" htmlFor="tree-level">Choose genealogy level</label>
   <select id="tree-level" aria-label="Choose genealogy level" value={level}
    onChange={event=>{setLevel(event.target.value);setSelected("");}}>
    <option value="all">All loaded levels</option>
    {Array.from({length:network?.viewMaxLevel??0},(_,index)=>index+1)
     .map(value=><option key={value} value={value}>Level {value}</option>)}
   </select>
   <button className="btn btn-primary" type="submit">Search</button>
   <button className="btn btn-outline" type="button" onClick={reset}>Reset view</button>
  </form>
  {status==="loading"?<p role="status">Loading your sponsor network…</p>:
   status==="unauthorized"?<p role="alert">Sign in again to view your genealogy.</p>:
   status==="error"||!network?<p role="alert">The genealogy service is unavailable. Please try again later.</p>:
   <>
    <section className="tree-stats" aria-label="Current genealogy view statistics">
     <div><b>{network.levels[0]?.displayed??0}</b><small>Level 1 members shown</small></div>
     <div><b>{count}</b><small>Members shown (view cap applies)</small></div>
     <div><b>1:10</b><small>Plan structure, not qualification</small></div>
     <div><b>{network.viewMaxLevel}</b><small>Available level views</small></div>
    </section>
    <section className="genealogy-wrap" aria-label="Your confirmed sponsor network">
     <div className="level-tree">
      <button type="button" className="level-root"
       onClick={()=>setSelected(network.root.memberCode+" · You")}>
       <span className="root-crown">SPONSOR / ROOT</span>
       <b>{network.root.name}</b><small>{network.root.memberCode} · You</small>
      </button>
      {visible.map(item=><div className="genealogy-level" key={item.level}>
       <div className="level-connector" aria-hidden="true"/>
       <h2 className="level-heading">LEVEL {item.level}
        {item.level===1?" — DIRECT MEMBERS":" — EXTENDED NETWORK"}</h2>
       {item.members.length>0?
        <div className="level-grid">
         {item.members.map((member,index)=>
          <button type="button" className="level-member" key={member.memberCode}
           onClick={()=>setSelected(member.memberCode+" · "+member.name)}>
           <span className="level-number">{index+1}</span>
           <b>{member.name}</b><small>{member.memberCode}</small>
           <em>Level {item.level}</em>
           {item.level>1&&<small>Sponsor: {member.sponsorCode}</small>}
          </button>)}
        </div>:
        <p className="empty-tree">{search?"No matching displayed members on this level.":
         "No confirmed member links on this level yet."}</p>}
       {item.truncated&&<p className="notice" role="status">
        This level shows up to {network.viewLimitPerLevel} members.
        More records may exist; this is not an exhaustive network count.
       </p>}
      </div>)}
     </div>
    </section>
    <p className="genealogy-message" role="status" aria-live="polite">
     {selected?"Selected member: "+selected+" (limited network details).":
      search?matches+" matching displayed node(s).":
      "Showing confirmed members within your permitted sponsor network."}
    </p>
    <p className="notice">
     Sponsor placement/change operations and rank calculations are not enabled.
     This view does not establish eligibility or monetary entitlement.
     {network.complete?"":" Some levels are truncated by display limits."}
    </p>
   </>}
 </>;
}
