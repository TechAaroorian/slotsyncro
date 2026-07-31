import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { SignIn, SignOut } from "@/components/auth-components";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "./logo";

export async function Header() {
  const session = await auth();

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-2 group">
          <Logo className="w-7 h-7 group-hover:scale-105 transition-transform" />
          <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            SlotSyncro 🗓️
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            v1.0
          </span>
        </Link>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

          {session?.user ? (
            <div className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-800 pl-3">
              <div className="flex items-center space-x-2">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User Avatar"}
                    width={32}
                    height={32}
                    className="rounded-full border border-gray-300 dark:border-gray-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs font-bold">
                    {session.user.name?.[0] || "U"}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                  {session.user.name}
                </span>
              </div>

              <SignOut />
            </div>
          ) : (
            <SignIn />
          )}
        </div>
      </div>
    </header>
  );
}
