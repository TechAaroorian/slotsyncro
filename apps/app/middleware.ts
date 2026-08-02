import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except static files, _next, and api routes
  matcher: ["/", "/(en|es|de)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
