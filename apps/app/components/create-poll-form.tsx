"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { createPoll } from "@/app/actions/poll";
import { PollFormState } from "@/lib/schemas/poll";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const initialState: PollFormState = {};
const quickTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export function CreatePollForm({ locale }: { locale: string }) {
  const t = useTranslations("CreatePoll");
  const createLocalizedPoll = createPoll.bind(null, locale);
  const [state, formAction, isPending] = useActionState(
    createLocalizedPoll,
    initialState,
  );
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState("");

  function toggleTime(time: string) {
    setSelectedTimes((current) =>
      current.includes(time)
        ? current.filter((value) => value !== time)
        : [...current, time].sort(),
    );
  }

  function addCustomTime() {
    if (!customTime) return;
    setSelectedTimes((current) =>
      current.includes(customTime)
        ? current
        : [...current, customTime].sort(),
    );
    setCustomTime("");
  }

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-5">
          {/* General Form Error */}
          {state.errors?.formError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-medium">
              {state.errors.formError[0]}
            </div>
          )}

          {/* Poll Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              name="title"
              placeholder={t("titlePlaceholder")}
            />
            {state.errors?.title && (
              <p className="text-xs text-destructive font-medium">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("descLabel")}</Label>
            <Input
              id="description"
              name="description"
              placeholder={t("descPlaceholder")}
            />
            {state.errors?.description && (
              <p className="text-xs text-destructive font-medium">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          {/* Meeting Date */}
          <div className="space-y-2">
            <Label htmlFor="slotDate">{t("dateLabel")}</Label>
            <Input
              id="slotDate"
              type="date"
              name="slotDate"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            {state.errors?.slotDate && (
              <p className="text-xs text-destructive font-medium">
                {state.errors.slotDate[0]}
              </p>
            )}
          </div>

          {/* Time Slots Selection */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">{t("slotsLabel")}</legend>
            <p className="text-xs text-muted-foreground">{t("slotsHint")}</p>
            <div className="grid grid-cols-3 gap-2">
              {quickTimes.map((time) => (
                <button
                  type="button"
                  aria-pressed={selectedTimes.includes(time)}
                  onClick={() => toggleTime(time)}
                  key={time}
                  className="rounded-lg border border-border p-2.5 text-xs font-medium transition-colors hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  {time}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="customTime">{t("customTimeLabel")}</Label>
                <Input id="customTime" type="time" value={customTime} onChange={(event) => setCustomTime(event.target.value)} />
              </div>
              <Button type="button" variant="outline" onClick={addCustomTime} disabled={!customTime}>
                {t("addTime")}
              </Button>
            </div>
            {selectedTimes.length > 0 && (
              <div className="flex flex-wrap gap-2" aria-label={t("selectedTimesLabel")}>
                {selectedTimes.map((time) => (
                  <span key={time} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
                    {time}
                    <button type="button" onClick={() => toggleTime(time)} aria-label={t("removeTime", { time })} className="font-bold text-muted-foreground hover:text-foreground">×</button>
                    <input type="hidden" name="startHours" value={time} />
                  </span>
                ))}
              </div>
            )}
            {state.errors?.startHours && (
              <p className="text-xs text-destructive font-medium">
                {state.errors.startHours[0]}
              </p>
            )}
          </fieldset>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full font-bold"
          >
            {isPending ? t("submitting") : t("submitBtn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
