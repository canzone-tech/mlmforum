import { LoginClient } from "../../components/LoginClient";
export default async function LoginPage({
  searchParams
}: {searchParams: Promise<{tab?:string}>}) {
  const params = await searchParams;
  return <LoginClient initialTab={params.tab === "register" ? "register" : "login"}/>;
}
