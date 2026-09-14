import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SlotSyncro — Scheduling that finds common ground",
  description:
    "An open scheduling project for direct bookings, group polls, and timezone-aware decisions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
