// TODO(owner: vansh; collaborator: avni)
// - Add shared app shell (header/footer) and metadata refinements.
// - Add global providers here if state/theme/auth wrappers are introduced.
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkedIn Outreach Dashboard",
  description: "Manage your outreach contacts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
