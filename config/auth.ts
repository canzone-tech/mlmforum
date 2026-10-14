// UI-only options from the client's approved role/page terminology.
// Login roles are assigned by the server, never selected in the browser.
export const registrationTypes = [
  {value:"member",label:"Member"},
  {value:"business",label:"Business Partner"},
  {value:"expert",label:"Expert / Author"},
  {value:"organizer",label:"Event Organizer"},
  {value:"advertiser",label:"Advertiser"}
] as const;
export const interests = [
  "Network Marketing", "Business Opportunities", "Training & Learning",
  "Products & Services", "Leadership"
] as const;
export const apiBasePath = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "/api";
export function validIndianMobile(value: string): boolean {
  return /^[6-9][0-9]{9}$/.test(value.trim());
}
export function normalizeSponsorId(value: string): string {
  return value.trim().toUpperCase();
}
export function validSponsorFormat(value: string): boolean {
  return /^[A-Z0-9-]{3,30}$/.test(normalizeSponsorId(value));
}
