import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Login / Register — MLM Community Forum",
  description: "Client-design-aligned, non-production role login and registration preview."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
