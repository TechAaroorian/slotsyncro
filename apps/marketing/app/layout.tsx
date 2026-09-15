import type { Metadata } from "next";

import "./globals.css";

const siteUrl = "https://techaaroorian.github.io/slotsyncro/";
const socialImageUrl =
  "https://techaaroorian.github.io/slotsyncro/opengraph-image.png";
const title = "SlotSyncro — Scheduling that finds common ground";
const description =
  "A publicly developed scheduling portfolio project for direct bookings, group polls, and timezone-aware decisions.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "SlotSyncro",
  authors: [{ name: "Janarthanan Soundhararajan" }],
  creator: "Janarthanan Soundhararajan",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "SlotSyncro",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 627,
        alt: "SlotSyncro scheduling project with a group availability poll preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImageUrl],
  },
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
