"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath || `/${nextLocale}`);
  };

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={handleLanguageChange}
        className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer uppercase"
        aria-label="Switch Language"
      >
        <option value="en">🌐 EN</option>
        <option value="es">🌐 ES</option>
        <option value="de">🌐 DE</option>
      </select>
    </div>
  );
}
