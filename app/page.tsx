import Link from "next/link";
import { Brand } from "../components/Brand";
export default function PortalPlaceholder() {
  return <><header className="site-header"><Brand /><Link href="/login" className="btn btn-outline">Login / Register</Link></header>
    <main className="portal-placeholder"><h1>MLM Community Forum</h1>
      <p>The client&apos;s public portal is the next planned module. The Login / Register preview is available now.</p>
      <Link href="/login" className="btn btn-primary">Open Login / Register →</Link>
    </main></>;
}
