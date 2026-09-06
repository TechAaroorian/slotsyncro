import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreatePollForm } from "@/components/create-poll-form";
import { getTranslations } from "next-intl/server";
import { localizedPath } from "@/lib/navigation";

export default async function CreatePollPage({
  params,
}: PageProps<"/[locale]/create-poll">) {
  const { locale } = await params;
  const t = await getTranslations("CreatePoll");
  const session = await auth();

  if (!session?.user) {
    redirect(localizedPath(locale, "/"));
  }

  return (
    <section className="space-y-8 py-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]">
        <CreatePollForm locale={locale} />

        <aside className="rounded-2xl border bg-muted/30 p-6 lg:sticky lg:top-6">
          <h2 className="text-xl font-semibold">{t("howItWorks.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("howItWorks.description")}
          </p>
          <ol className="mt-6 space-y-5">
            {["choose", "share", "respond", "review"].map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-medium">{t(`howItWorks.steps.${step}.title`)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`howItWorks.steps.${step}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
            {t("howItWorks.accountNote")}
          </p>
        </aside>
      </div>
    </section>
  );
}
