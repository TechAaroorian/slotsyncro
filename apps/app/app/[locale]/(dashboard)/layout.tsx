import Link from "next/link";
import { ReactNode } from "react";
import {
  CalendarClock,
  CalendarRange,
  BookOpen,
  BarChart2,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Event Types",
    href: "/event-types",
    icon: CalendarRange,
  },
  {
    label: "Availability",
    href: "/availability",
    icon: CalendarClock,
  },
  {
    label: "Bookings",
    href: "/bookings",
    icon: BookOpen,
  },
  {
    label: "Polls",
    href: "/polls",
    icon: BarChart2,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#090909] text-foreground">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border/40 bg-[#111111] p-4 shrink-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-base tracking-tight">
            SlotSyncro
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#1F1F1F] transition-colors"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-border/40 pt-4 px-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>SlotSyncro App</span>
          <span className="bg-muted/30 px-2 py-0.5 rounded font-mono text-[10px]">
            v1.0
          </span>
        </div>
      </aside>

      {/* Main Page Workspace */}
      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
