import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // CRITICAL: Exclude /api, _next, _vercel, and static files so next-intl ignores API routes
  matcher: ["/", "/(en|es|de)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
