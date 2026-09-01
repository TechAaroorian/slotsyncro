export function localizedPath(locale: string, path: string) {
  const normalizedPath = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `/${locale}${normalizedPath}`;
}

export function isNavigationPathActive(pathname: string, path: string) {
  const normalizedPath = `/${path.replace(/^\/+|\/+$/g, "")}`;

  if (normalizedPath === "/dashboard") {
    return pathname.endsWith(normalizedPath);
  }

  return pathname.includes(normalizedPath);
}
