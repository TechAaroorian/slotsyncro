"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Settings,
  LogOut,
  Link as LinkIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Event Types", url: "/event-types", icon: LinkIcon },
  { title: "Availability", url: "/availability", icon: Clock },
  { title: "Bookings", url: "/bookings", icon: Calendar },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="pt-16 md:pt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = pathname.includes(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className="px-3 py-5 text-[15px]" // slightly larger hit target
                    >
                      <Link href={item.url} className="flex items-center">
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link href="/settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="flex items-center"
              onClick={() => console.log("Implement signOut")}
            >
              <LogOut className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
