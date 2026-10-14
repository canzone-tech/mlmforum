"use client";
import Image from "next/image";
import Link from "next/link";
import {FormEvent, useEffect, useState} from "react";
import {Brand} from "./Brand";
import {apiBasePath, interests, normalizeSponsorId, registrationTypes, validIndianMobile, validSponsorFormat} from "../config/auth";

type Tab = "login" | "register";
type SponsorState = {status: "idle" | "checking" | "valid" | "invalid" | "unavailable"; name: string};
const emptySponsor: SponsorState = {status:"idle",name:""};
const unavailable = "Service is not available yet. Please try again later.";

export function LoginClient({initialTab}:{initialTab:Tab}) {
  const [tab,setTab] = useState<Tab>(initialTab);
  const [loginMessage,setLoginMessage] = useState("");
  const [registrationMessage,setRegistrationMessage] = useState("");
  const [loginPending,setLoginPending] = useState(false);
  const [registrationPending,setRegistrationPending] = useState(false);
  const [sponsorId,setSponsorId] = useState("");
  const [sponsor,setSponsor] = useState<SponsorState>(emptySponsor);

  useEffect(() => {
    const normalized = normalizeSponsorId(sponsorId);
    if (!normalized) {setSponsor(emptySponsor); return;}
    if (!validSponsorFormat(normalized)) {setSponsor({status:"invalid",name:""}); return;}
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSponsor({status:"checking",name:""});
      try {
        const response = await fetch(`${apiBasePath}/sponsors/${encodeURIComponent(normalized)}`, {
          method:"GET",signal:controller.signal,credentials:"same-origin",cache:"no-store"
        });
        if (response.status === 404 && response.headers.get("content-type")?.includes("application/json")) {
          setSponsor({status:"invalid",name:""});
          return;
        }
        if (!response.ok) throw new Error("Sponsor service unavailable");
        const data: unknown = await response.json();
        if (typeof data !== "object" || data === null || !("name" in data) ||
          typeof data.name !== "string" || !data.name.trim()) {
          throw new Error("Invalid sponsor response");
        }
        setSponsor({status:"valid",name:data.name.trim()});
      } catch {
        if (!controller.signal.aborted) setSponsor({status:"unavailable",name:""});
      }
    },300);
    return () => {clearTimeout(timer); controller.abort();};
  },[sponsorId]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginPending) return;
    setLoginPending(true); setLoginMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${apiBasePath}/auth/login`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        credentials:"include",cache:"no-store",
        body:JSON.stringify({email:String(form.get("email")??"").trim(),password:String(form.get("password")??"")})
      });
      if (!response.ok) {
        setLoginMessage(response.status === 401 ? "Incorrect email or password." : unavailable);
        return;
      }
      // Only the real authentication API may issue a session; roles come from the server.
      window.location.assign("/dashboard");
    } catch {
      setLoginMessage(unavailable);
    } finally {
      setLoginPending(false);
    }
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (registrationPending) return;
    setRegistrationMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const mobile = String(form.get("mobileNo") ?? "");
    if (!validIndianMobile(mobile)) {
      setRegistrationMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (sponsor.status !== "valid") {
      setRegistrationMessage("Sponsor ID must be verified before registration.");
      return;
    }
    setRegistrationPending(true);
    try {
      const response = await fetch(`${apiBasePath}/auth/register`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        credentials:"include",cache:"no-store",
        body:JSON.stringify({
          fullName:String(form.get("fullName")??"").trim(),
          email:String(form.get("newEmail")??"").trim(),
          mobileNo:mobile.trim(),sponsorId:normalizeSponsorId(sponsorId),
          requestedAccountType:String(form.get("newRole")??"member"),
          interest:String(form.get("interest")??""),
          consent:form.get("consent")==="on"
        })
      });
      if (!response.ok) {
        setRegistrationMessage(response.status === 409
          ? "Registration details need review. Please contact support." : unavailable);
        return;
      }
      setRegistrationMessage("Registration request received. Account activation requires verification.");
      formElement.reset();
      setSponsorId("");
    } catch {
      setRegistrationMessage(unavailable);
    } finally {
      setRegistrationPending(false);
    }
  }

  return <div className="auth-page">
    <header className="site-header"><Brand/><Link className="btn btn-outline" href="/">← Portal Home</Link></header>
    <main className="auth-layout">
      <section className="auth-art" aria-label="Welcome to the community">
        <p className="eyebrow">CONNECT • COLLABORATE • GROW</p>
        <h1>Your next opportunity starts with community.</h1>
        <p>Join discussions, learn from experts, discover events and connect with business leaders.</p>
        <Image src="/teamwork.jpg" alt="Professionals working together" width={900} height={500} priority unoptimized/>
      </section>
      <section className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Account forms">
          <button id="tab-login" type="button" role="tab" aria-controls="panel-login"
            aria-selected={tab==="login"} className={tab==="login"?"tab active":"tab"}
            onClick={()=>setTab("login")}>Login</button>
          <button id="tab-register" type="button" role="tab" aria-controls="panel-register"
            aria-selected={tab==="register"} className={tab==="register"?"tab active":"tab"}
            onClick={()=>setTab("register")}>Create Account</button>
        </div>
        <div id="panel-login" role="tabpanel" aria-labelledby="tab-login" hidden={tab!=="login"}>
          <form id="loginForm" onSubmit={submitLogin}>
            <h2>Welcome back</h2>
            <p className="muted">Sign in to your MLM Community Forum account.</p>
            <label htmlFor="email">Email address
              <input type="email" id="email" name="email" autoComplete="email" required placeholder="you@example.com"/>
            </label>
            <label htmlFor="password">Password
              <input type="password" id="password" name="password" autoComplete="current-password"
                required placeholder="Enter your password"/>
            </label>
            <button className="btn btn-primary btn-block" type="submit" disabled={loginPending}>
              {loginPending?"Signing in…":"Login →"}
            </button>
            <p id="loginMsg" className="form-msg" role="status" aria-live="polite">{loginMessage}</p>
          </form>
        </div>
        <div id="panel-register" role="tabpanel" aria-labelledby="tab-register" hidden={tab!=="register"}>
          <form id="registerForm" onSubmit={submitRegistration}>
            <h2>Create your community account</h2>
            <label htmlFor="fullName">Full name
              <input id="fullName" name="fullName" autoComplete="name" maxLength={100} required placeholder="Your full name"/>
            </label>
            <label htmlFor="newEmail">Email address
              <input id="newEmail" name="newEmail" type="email" autoComplete="email" maxLength={160} required placeholder="you@example.com"/>
            </label>
            <label htmlFor="mobileNo">Mobile number
              <input type="tel" name="mobileNo" id="mobileNo" autoComplete="tel" inputMode="numeric"
                pattern="[6-9][0-9]{9}" maxLength={10} required placeholder="10-digit mobile number" aria-describedby="mobileHelp"/>
              <small id="mobileHelp" className="muted">Enter a valid 10-digit Indian mobile number.</small>
            </label>
            <label htmlFor="sponsorId">Sponsor ID
              <input id="sponsorId" name="sponsorId" maxLength={30} required autoComplete="off"
                placeholder="Sponsor member ID" aria-describedby="sponsorHelp"
                value={sponsorId} onChange={e=>{setSponsorId(e.target.value.toUpperCase()); setRegistrationMessage("");}}/>
            </label>
            <label htmlFor="sponsorName">Sponsor name
              <input id="sponsorName" name="sponsorName" readOnly value={sponsor.name}
                placeholder="Verified sponsor name" aria-live="polite"/>
            </label>
            <small id="sponsorHelp" className={sponsor.status==="valid"?"sponsor-success":sponsor.status==="idle"?"muted":"sponsor-error"} role="status">
              {sponsor.status==="idle"?"Sponsor lookup is verified by the server.":
                sponsor.status==="checking"?"Checking sponsor…":
                sponsor.status==="valid"?"Sponsor verified.":
                sponsor.status==="invalid"?"Sponsor ID not found or invalid.":"Sponsor verification service is unavailable."}
            </small>
            <label htmlFor="newRole">Account type
              <select id="newRole" name="newRole">
                {registrationTypes.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </label>
            <label htmlFor="interest">Primary interest
              <select id="interest" name="interest">{interests.map(value=><option key={value}>{value}</option>)}</select>
            </label>
            <label className="consent-label"><input type="checkbox" required name="consent"/>
              I agree to the community guidelines and privacy notice.
            </label>
            <button className="btn btn-primary btn-block" type="submit" disabled={registrationPending}>
              {registrationPending?"Submitting…":"Create Account"}
            </button>
            <p id="registerMsg" className="form-msg" role="status" aria-live="polite">{registrationMessage}</p>
          </form>
        </div>
      </section>
    </main>
  </div>;
}
