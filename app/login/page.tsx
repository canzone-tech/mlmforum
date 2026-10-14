import { LoginClient } from "../../components/LoginClient";
import { isDemoRole } from "../../config/demo";
export default async function LoginPage({
  searchParams
}: { searchParams: Promise<{ tab?: string; role?: string }> }) {
  const params = await searchParams;
  return <LoginClient initialTab={params.tab === "register" ? "register" : "login"}
    initialRole={params.role && isDemoRole(params.role) ? params.role : "member"}/>;
}
