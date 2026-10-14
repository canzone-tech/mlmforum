"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Brand } from "./Brand";
import {
  demoPassword, demoUsers, demoRegistrationRoles, interests,
  getSponsorName, isDemoRole, matchesDemoCredentials, validIndianMobile,
  type DemoRole
} from "../config/demo";

export function LoginClient({
  initialTab, initialRole
}: { initialTab: "login" | "register"; initialRole: DemoRole }) {
  const [tab, setTab] = useState(initialTab);
  const [role, setRole] = useState<DemoRole>(initialRole);
  const [email, setEmail] = useState<string>(demoUsers[initialRole].email);
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [sponsorId, setSponsorId] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const sponsorName = getSponsorName(sponsorId);
  const sponsorHint = !sponsorId.trim() ? "Demo sponsor IDs: MLM-1001 through MLM-1010."
    : sponsorName ? "Sponsor found in demo data."
    : "Sponsor ID not found in demo data. Try MLM-1001 through MLM-1010.";

  function chooseDemo(nextRole: DemoRole) {
    setTab("login");
    setRole(nextRole);
    setEmail(demoUsers[nextRole].email);
    setPassword(demoPassword);
    setLoginMessage("");
  }

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matchesDemoCredentials(role, email, password)) {
      setLoginMessage("For this prototype, select the matching role demo account and use Demo@123.");
      return;
    }
    // Non-authenticated client preview: do not set tokens, cookies or impersonation sessions.
    window.location.assign("/demo?role=" + encodeURIComponent(role));
  }

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const mobile = (form.elements.namedItem("mobileNo") as HTMLInputElement).value;
    if (!validIndianMobile(mobile)) {
      setRegisterMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!sponsorName) {
      setRegisterMessage("Enter a valid demo Sponsor ID.");
      return;
    }
    setRegisterMessage(`Demo registration validated. Sponsor: ${sponsorName} (${sponsorId.trim().toUpperCase()}). No account or mobile verification was created on a server.`);
  }

  return <div className="auth-page">
    <header className="site-header">
      <Brand />
      <Link className="btn btn-outline" href="/">← Portal Home</Link>
    </header>
    <main className="auth-layout">
      <section className="auth-art" aria-label="Welcome to the community">
        <p className="eyebrow">CONNECT • COLLABORATE • GROW</p>
        <h1>Your next opportunity starts with community.</h1>
        <p>Join discussions, learn from experts, discover events and connect with business leaders.</p>
        <Image src="/teamwork.jpg" alt="Professionals working together" width={900} height={500} priority unoptimized />
      </section>
      <section className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Account forms">
          <button id="tab-login" type="button" className={tab === "login" ? "tab active" : "tab"}
            role="tab" aria-controls="panel-login" aria-selected={tab === "login"} onClick={() => setTab("login")}>Login</button>
          <button id="tab-register" type="button" className={tab === "register" ? "tab active" : "tab"}
            role="tab" aria-controls="panel-register" aria-selected={tab === "register"} onClick={() => setTab("register")}>Create Account</button>
        </div>
        <div id="panel-login" role="tabpanel" aria-labelledby="tab-login" hidden={tab !== "login"}>
          <form id="loginForm" onSubmit={submitLogin}>
            <h2>Welcome back</h2>
            <p className="muted">Use a demo account below to explore role-specific dashboards.</p>
            <label htmlFor="email">Email address
              <input type="email" id="email" name="email" autoComplete="email" required
                placeholder={demoUsers.member.email} value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label htmlFor="password">Password
              <input type="password" id="password" name="password" autoComplete="off" required
                placeholder="Enter demo password" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <label htmlFor="role">Preview role
              <select id="role" value={role} onChange={e => {
                if (isDemoRole(e.target.value)) { setRole(e.target.value); setLoginMessage(""); }
              }}>
                {Object.entries(demoUsers).map(([key, user]) =>
                  <option key={key} value={key}>{user.label}</option>)}
              </select>
            </label>
            <button className="btn btn-primary btn-block" type="submit">Open Demo Dashboard →</button>
            <p id="loginMsg" className="form-msg" role="status" aria-live="polite">{loginMessage}</p>
          </form>
        </div>
        <div id="panel-register" role="tabpanel" aria-labelledby="tab-register" hidden={tab !== "register"}>
          <form id="registerForm" onSubmit={submitRegistration}>
            <h2>Create your community account</h2>
            <label htmlFor="fullName">Full name
              <input id="fullName" name="fullName" autoComplete="name" maxLength={100} required placeholder="Your full name" />
            </label>
            <label htmlFor="newEmail">Email address
              <input id="newEmail" name="newEmail" type="email" autoComplete="email" maxLength={160} required placeholder="you@example.com" />
            </label>
            <label htmlFor="mobileNo">Mobile number
              <input type="tel" name="mobileNo" id="mobileNo" autoComplete="tel" inputMode="numeric"
                pattern="[6-9][0-9]{9}" maxLength={10} required placeholder="10-digit mobile number" aria-describedby="mobileHelp" />
              <small id="mobileHelp" className="muted">Enter a valid 10-digit Indian mobile number.</small>
            </label>
            <label htmlFor="sponsorId">Sponsor ID
              <input id="sponsorId" name="sponsorId" maxLength={30} required autoComplete="off"
                placeholder="e.g. MLM-1001" aria-describedby="sponsorHelp"
                value={sponsorId} onChange={e => { setSponsorId(e.target.value.toUpperCase()); setRegisterMessage(""); }} />
            </label>
            <label htmlFor="sponsorName">Sponsor name
              <input id="sponsorName" name="sponsorName" readOnly
                value={sponsorName ?? ""} placeholder="Sponsor name appears after a valid Sponsor ID"
                aria-live="polite"/>
            </label>
            <small id="sponsorHelp" className={sponsorId.trim() ? sponsorName ? "sponsor-success" : "sponsor-error" : "muted"}>{sponsorHint}</small>
            <label htmlFor="newRole">Account type
              <select id="newRole" name="newRole">{demoRegistrationRoles.map(r =>
                <option key={r} value={demoUsers[r].label}>{demoUsers[r].label}</option>)}</select>
            </label>
            <label htmlFor="interest">Primary interest
              <select id="interest" name="interest">{interests.map(i => <option key={i}>{i}</option>)}</select>
            </label>
            <label className="consent-label"><input type="checkbox" required name="consent" />
              I agree to the community guidelines and privacy notice.
            </label>
            <button className="btn btn-primary btn-block" type="submit">Create Demo Account</button>
            <p id="registerMsg" className="form-msg" role="status" aria-live="polite">{registerMessage}</p>
          </form>
        </div>
        <section className="demo-accounts" aria-label="Demo credentials">
          <h3>Demo credentials</h3>
          <p><b>Password for all:</b> <code>{demoPassword}</code></p>
          <div className="credential-grid">
            {Object.entries(demoUsers).map(([key, user]) =>
              <button type="button" key={key} onClick={() => chooseDemo(key as DemoRole)}>
                {user.label}<br/><small>{user.email}</small>
              </button>)}
          </div>
          <small>Prototype only: these accounts are client-side demo identities, not secure authentication.</small>
        </section>
      </section>
    </main>
  </div>;
}
