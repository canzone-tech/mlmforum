import Link from "next/link";
import { Brand } from "../../components/Brand";
import { demoUsers, isDemoRole } from "../../config/demo";
export default async function DemoPage({searchParams}:{searchParams:Promise<{role?:string}>}) {
  const {role} = await searchParams;
  const validRole = role && isDemoRole(role) ? role : "member";
  return <div className="auth-page"><header className="site-header"><Brand/><Link href="/login" className="btn btn-outline">← Switch Role</Link></header>
    <main className="portal-placeholder"><p className="eyebrow">DEMO MODE — NO AUTHENTICATION</p>
      <h1>{demoUsers[validRole].label} workspace</h1>
      <p>The selected demo credentials matched the client prototype. The role-specific dashboard will be converted as its own module.</p>
      <p>No real session, member account, permission, payout or financial action was created.</p>
      <Link href="/login" className="btn btn-primary">Back to Login</Link>
    </main>
  </div>;
}
