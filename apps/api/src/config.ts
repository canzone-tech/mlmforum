import {z} from "zod";
const settings=z.object({
 DATABASE_URL:z.string().min(1),
 JWT_ACCESS_SECRET:z.string().min(32),
 JWT_REFRESH_SECRET:z.string().min(32),
 APP_ORIGIN:z.string().url(),
 APP_ENV:z.enum(["local","production"]).default("local"),
 REGISTRATION_INTAKE_ENABLED:z.enum(["true","false"]).default("false").transform(x=>x==="true"),
 CONSENT_POLICY_VERSION:z.string().min(1).max(60),
 API_HOST:z.string().default("127.0.0.1"),
 AUTH_LOGIN_RATE_LIMIT:z.coerce.number().int().min(1).max(100).default(5),
 GENEALOGY_VIEW_MAX_LEVEL:z.coerce.number().int().min(1).max(3).default(3),
 GENEALOGY_VIEW_MAX_NODES_PER_LEVEL:z.coerce.number().int().min(10).max(500).default(100),
 NETWORK_PAGE_SIZE:z.coerce.number().int().min(1).max(100).default(20),
 API_PORT:z.coerce.number().int().min(1).max(65535).default(4000)
}).parse(process.env);
if(settings.JWT_ACCESS_SECRET===settings.JWT_REFRESH_SECRET)throw new Error("Access and refresh secrets must differ");
if(settings.APP_ENV==="production"){
 if(!settings.APP_ORIGIN.startsWith("https://"))throw new Error("HTTPS origin required in production");
 if(settings.REGISTRATION_INTAKE_ENABLED&&settings.CONSENT_POLICY_VERSION.startsWith("REQUIRES_"))
  throw new Error("Approved privacy/consent version required for intake");
}
export const config=settings;
export const secureCookie=settings.APP_ENV==="production";
