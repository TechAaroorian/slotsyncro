import { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileNavigation } from "@/components/dashboard/mobile-navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {/* Client-side Sidebar Component */}
      <AppSidebar />

      {/* Main Page Workspace */}
      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full">
          <MobileNavigation />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
