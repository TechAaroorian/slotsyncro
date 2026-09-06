import { routing } from "@/i18n/routing";

export function localizedPath(locale: string, path: string) {
  const supportedLocale = (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;
  const normalizedPath = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `/${supportedLocale}${normalizedPath}`;
}

export function isNavigationPathActive(pathname: string, path: string) {
  const normalizedPath = `/${path.replace(/^\/+|\/+$/g, "")}`;

  if (normalizedPath === "/dashboard") {
    return pathname.endsWith(normalizedPath);
  }

  return pathname.includes(normalizedPath);
}
