// app/page.tsx
import Image from "next/image";
import { auth } from "@/auth";
import { SignIn, SignOut } from "@/components/auth-components";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            SlotSyncro 🗓️
          </h1>
          <p className="text-sm text-gray-500">
            Universal group scheduling & real-time heatmap builder.
          </p>
        </div>

        {session?.user ? (
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-4">
            <div className="flex items-center space-x-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User Avatar"}
                  width={48}
                  height={48}
                  className="rounded-full border border-gray-300 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
                  {session.user.name?.[0] || "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
            </div>

            <div className="text-xs font-mono bg-white p-2.5 rounded border border-gray-200 text-gray-600 truncate">
              <span className="text-gray-400">ID:</span> {session.user.id}
            </div>

            <div className="pt-1">
              <SignOut />
            </div>
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
