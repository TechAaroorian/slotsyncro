// app/page.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { SignIn } from "@/components/auth-components";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center space-y-6 transition-colors">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            SlotSyncro 🗓️
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Universal group scheduling & real-time availability heatmap builder.
          </p>
        </div>

        {session?.user ? (
          <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/60 text-left space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                Welcome back
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {session.user.name} 👋
              </p>
            </div>

            <Link
              href="/create-poll"
              className="block w-full text-center py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
            >
              + Create New Poll
            </Link>
          </div>
        ) : (
          <div className="pt-2">
            <SignIn />
          </div>
        )}
      </div>
    </main>
  );
}
