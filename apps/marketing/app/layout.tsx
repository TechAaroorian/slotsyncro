export const metadata = {
  title: "SlotSyncro - Smart Scheduling",
  description: "Welcome to SlotSyncro Marketing Site",
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
