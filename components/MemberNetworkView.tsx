"use client";
import {FormEvent,useEffect,useState} from "react";

type Filters={joinedFrom:string;joinedTo:string;searchTerm:string};
type Member={name:string;memberCode:string;memberStatus:string;joinedAt:string};
type Result={members:Member[];page:number;pageSize:number;total:number;hasMore:boolean};
type Draft=Filters & {savedAt:string};
const empty:Filters={joinedFrom:"",joinedTo:"",searchTerm:""};
function query(filters:Filters,page:number):string{
 const params=new URLSearchParams();
 if(filters.joinedFrom)params.set("joinedFrom",filters.joinedFrom);
 if(filters.joinedTo)params.set("joinedTo",filters.joinedTo);
 if(filters.searchTerm)params.set("searchTerm",filters.searchTerm);
 params.set("page",String(page));
 return params.toString();
}
function validDateRange(filters:Filters){
 return !filters.joinedFrom||!filters.joinedTo||filters.joinedFrom<=filters.joinedTo;
}
export function MemberNetworkView(){
 const [draft,setDraft]=useState<Filters>(empty);
 const [applied,setApplied]=useState<Filters>(empty);
 const [results,setResults]=useState<Result|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 useEffect(()=>{
  const controller=new AbortController();
  async function initial(){
   try{
    const saved=await fetch("/api/member/network/filters",{
     credentials:"same-origin",cache:"no-store",signal:controller.signal
    });
    if(!saved.ok)throw new Error("Could not load saved filters");
    const data:Draft=await saved.json();
    const filters:Filters={
     joinedFrom:data.joinedFrom??"",
     joinedTo:data.joinedTo??"",
     searchTerm:data.searchTerm??""
    };
    const response=await fetch("/api/member/network?"+query(filters,1),{
     credentials:"same-origin",cache:"no-store",signal:controller.signal
    });
    if(!response.ok)throw new Error("Could not load network");
    const network:Result=await response.json();
    if(!controller.signal.aborted){
     setDraft(filters);setApplied(filters);setResults(network);
    }
   }catch{
    if(!controller.signal.aborted)setError("Network service is unavailable. Try again later.");
   }finally{
    if(!controller.signal.aborted)setLoading(false);
   }
  }
  void initial();
  return()=>controller.abort();
 },[]);
 async function load(filters:Filters,page:number){
  setLoading(true);setError("");setNotice("");
  try{
   const response=await fetch("/api/member/network?"+query(filters,page),{
    credentials:"same-origin",cache:"no-store"
   });
   if(!response.ok)throw new Error("Network request failed");
   const network:Result=await response.json();
   setResults(network);setApplied(filters);
  }catch{setError("Could not apply filters. Please try again.");}
  finally{setLoading(false);}
 }
 function apply(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!validDateRange(draft)){setError("Joined from must not be after Joined to.");return;}
  void load(draft,1);
 }
 async function save(){
  if(saving)return;
  if(!validDateRange(draft)){setError("Joined from must not be after Joined to.");return;}
  setSaving(true);setNotice("");setError("");
  try{
   const response=await fetch("/api/member/network/filters",{
    method:"PUT",headers:{"Content-Type":"application/json"},
    credentials:"same-origin",body:JSON.stringify(draft)
   });
   if(!response.ok)throw new Error("Save failed");
   setNotice("Your filter draft was saved to your account.");
  }catch{setError("Could not save filters. Please try again.");}
  finally{setSaving(false);}
 }
 const page=results?.page??1;
 return <>
  <div className="breadcrumb">Workspace / <span>My Network</span></div>
  <div className="dash-title-row">
   <div><h1>My Network</h1><p>Review personally referred members, team status and follow-up needs.</p></div>
   <span className="tag">Member</span>
  </div>
  <p className="notice"><b>Page-specific design rule:</b> Only your confirmed direct referrals
   with active, verified accounts are shown. Follow-up records and inactive/pending status visibility
   need an approved workflow; no contact or financial details are displayed.</p>
  <div className="dash-columns network-columns">
   <section className="dash-panel" aria-labelledby="network-controls-title">
    <h2 id="network-controls-title">Page-specific controls</h2>
    <p className="network-helper">Filter your personally referred members. Fields with an asterisk are required.</p>
    <form className="network-form" onSubmit={apply}>
     <div className="network-field-grid">
      <label>Member status *
       <select disabled defaultValue="ACTIVE" aria-label="Member status">
        <option value="ACTIVE">Active (verified)</option>
        <option disabled value="PENDING">Pending verification — awaiting approval</option>
        <option disabled value="INACTIVE">Inactive — awaiting approval</option>
        <option disabled value="SUSPENDED">Suspended — awaiting approval</option>
       </select>
       <small>Only active verified confirmed relationships are visible</small>
      </label>
      <label>Joined from
       <input aria-label="Joined from" type="date" value={draft.joinedFrom}
        onChange={e=>setDraft(current=>({...current,joinedFrom:e.target.value}))}/>
       <small>Optional · Start date</small>
      </label>
      <label>Joined to
       <input aria-label="Joined to" type="date" value={draft.joinedTo}
        onChange={e=>setDraft(current=>({...current,joinedTo:e.target.value}))}/>
       <small>Optional · End date</small>
      </label>
      <label>Follow-up status
       <select aria-label="Follow-up status" disabled value="unavailable">
        <option value="unavailable">Not recorded</option>
       </select>
       <small>Unavailable until follow-up permissions and policy are approved</small>
      </label>
      <label>Member ID / name
       <input aria-label="Member ID / name" type="search" maxLength={100}
        value={draft.searchTerm} placeholder="Search only your confirmed direct referrals"
        onChange={e=>setDraft(current=>({...current,searchTerm:e.target.value}))}/>
       <small>Optional · Search within permitted network scope</small>
      </label>
     </div>
     <div className="network-actions">
      <button type="button" className="btn btn-primary" disabled={saving} onClick={()=>void save()}>
       {saving?"Saving…":"Save Draft"}
      </button>
      <button type="submit" className="btn btn-outline" disabled={loading}>
       {loading?"Loading…":"Apply Filters"}
      </button>
     </div>
     {error&&<p role="alert" className="network-error">{error}</p>}
     <p role="status" aria-live="polite" className="network-success">{notice}</p>
    </form>
   </section>
   <section className="dash-panel" aria-labelledby="network-records-title">
    <h2 id="network-records-title">Relevant records for this page</h2>
    {loading?<p role="status">Loading network records…</p>:
     !results?<p role="alert">No network data is currently available.</p>:
     <>
      <p className="network-helper" role="status">
       {results.total} matching confirmed direct {results.total===1?"member":"members"}
       {results.total>0?" · Page "+results.page:""}
      </p>
      {results.members.length===0?<div className="empty-state">No members match these filters.</div>:
       <div className="table-scroll">
        <table className="data-table">
         <thead><tr><th>Member</th><th>Joined</th><th>Status</th></tr></thead>
         <tbody>{results.members.map(member=><tr key={member.memberCode}>
          <td><b>{member.name}</b><small className="network-member-code">{member.memberCode}</small></td>
          <td>{new Date(member.joinedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"})}</td>
          <td><span className="status">{member.memberStatus==="ACTIVE"?"Active":member.memberStatus}</span></td>
         </tr>)}</tbody>
        </table>
       </div>}
      <div className="network-pagination">
       <button type="button" className="btn btn-outline" disabled={loading||page<=1}
        onClick={()=>void load(applied,page-1)}>Previous</button>
       <span>Page {page}</span>
       <button type="button" className="btn btn-outline" disabled={loading||!results.hasMore}
        onClick={()=>void load(applied,page+1)}>Next</button>
      </div>
     </>}
    <h2 className="network-restriction-title">Excluded / restricted on this page</h2>
    <p className="network-helper">Private email, phone, passwords, payments, authentication secrets,
     sponsor-change actions and unapproved follow-up statuses are excluded.</p>
   </section>
  </div>
  <footer className="dash-footer">MLM Community Forum • My Network • Confirmed direct referrals only</footer>
 </>;
}
