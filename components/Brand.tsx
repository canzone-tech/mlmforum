import Link from "next/link";
export function Brand() {
  return <Link className="brand" href="/" aria-label="MLM Community Forum portal home">
    <span className="brand-mark">MLM</span>
    <span><b>MLM COMMUNITY FORUM</b><small>Connect • Collaborate • Grow Together</small></span>
  </Link>;
}
