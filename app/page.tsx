import Link from "next/link";
import {Brand} from "../components/Brand";
export default function Home() {
 return <><header className="site-header"><Brand/><Link className="btn btn-outline" href="/login">Login / Register</Link></header>
   <main className="portal-placeholder"><h1>MLM Community Forum</h1>
     <p>The public portal is under development using the client-approved HTML design. Account activation is not available until the authentication backend and verification are connected.</p>
     <Link href="/login" className="btn btn-primary">Login / Register →</Link>
   </main></>;
}
