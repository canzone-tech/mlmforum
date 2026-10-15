// Single source for the Member menu names/order from client app.js roleMenus.member.
// Only Overview is implemented; other entries stay visibly inactive until
// their own frontend+backend modules are developed and verified.
export const memberNavigation = [
 {label:"Overview",id:"overview"},
 {label:"Genealogy Tree",id:"genealogy"},
 {label:"My Network",id:"my-network"},
 {label:"Income Ledger",id:"income-ledger"},
 {label:"Wallet & Payouts",id:"wallet"},
 {label:"My Profile",id:"profile"},
 {label:"Community Feed",id:"community"},
 {label:"My Discussions",id:"my-discussions"},
 {label:"Saved Resources",id:"resources"},
 {label:"Events & Registrations",id:"events"},
 {label:"Members Directory",id:"members"},
 {label:"Business Opportunities",id:"opportunities"},
 {label:"Marketplace",id:"marketplace"},
 {label:"Learning & Videos",id:"learning"},
 {label:"Notifications",id:"notifications"},
 {label:"Support Tickets",id:"support"}
] as const;
