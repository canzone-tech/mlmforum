import type {Metadata} from "next";
import "./globals.css";
export const metadata: Metadata = {
 title:"Login / Register — MLM Community Forum",
 description:"Secure account sign-in and registration interface for MLM Community Forum."
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
 return <html lang="en"><body>{children}</body></html>;
}
