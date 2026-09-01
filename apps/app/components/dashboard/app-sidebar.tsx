"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Calendar,
  Clock,
  LayoutDashboard,
  Link as LinkIcon,
  Vote,
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
import {
  isNavigationPathActive,
  localizedPath,
} from "@/lib/navigation";

const navItems = [
  { key: "dashboard", path: "/dashboard", icon: LayoutDashboard },
  { key: "eventTypes", path: "/event-types", icon: LinkIcon },
  { key: "availability", path: "/availability", icon: Clock },
  { key: "bookings", path: "/bookings", icon: Calendar },
  { key: "createPoll", path: "/create-poll", icon: Vote },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navigation");

  return (
    <Sidebar className="pt-16 md:pt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={isNavigationPathActive(pathname, item.path)}
                    className="px-3 py-5 text-[15px]"
                    render={<Link href={localizedPath(locale, item.path)} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.key)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 text-xs text-muted-foreground">
        {t("accountActionsHint")}
      </SidebarFooter>
    </Sidebar>
  );
}
