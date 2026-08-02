"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (nextLocale: string) => {
    if (nextLocale === locale) return;

    // Replace locale prefix in the pathname
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath || `/${nextLocale}`);
  };

  return (
    <DropdownMenu>
      {/* Trigger styled with Shadcn buttonVariants */}
      <DropdownMenuTrigger
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className:
            "h-9 px-2.5 gap-1.5 uppercase font-semibold text-xs cursor-pointer outline-none",
        })}
        aria-label="Switch Language"
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{locale}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGES.map((lang) => {
          const isSelected = locale === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span className={isSelected ? "font-bold" : "font-normal"}>
                  {lang.label}
                </span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
