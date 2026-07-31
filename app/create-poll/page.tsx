// app/create-poll/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreatePollForm } from "@/components/create-poll-form";

export default async function CreatePollPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-[calc(100vh-65px)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Meeting Poll 🗓️
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Set up meeting dates & time slots to gather availability from your
            team.
          </p>
        </div>

        <CreatePollForm />
      </div>
    </main>
  );
}
