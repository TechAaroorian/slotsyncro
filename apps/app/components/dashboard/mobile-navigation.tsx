"use client";

import { useTranslations } from "next-intl";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function MobileNavigation() {
  const t = useTranslations("Navigation");
  const { openMobile } = useSidebar();

  return (
    <div className="mb-4 flex items-center gap-2 md:hidden">
      <SidebarTrigger
        aria-label={t("toggleMenu")}
        aria-expanded={openMobile}
        className="size-11"
      />
      <span className="text-sm font-medium">{t("menu")}</span>
    </div>
  );
}
