"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createPoll } from "@/app/actions/poll";
import { PollFormState } from "@/lib/schemas/poll";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: PollFormState = {};

export function CreatePollForm() {
  const t = useTranslations("CreatePoll");
  const [state, formAction, isPending] = useActionState(
    createPoll,
    initialState,
  );

  const defaultHours = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  return (
    <Card className="max-w-xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="space-y-2">
            <Label>{t("slotsLabel")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {defaultHours.map((hour) => (
                <label
                  key={hour}
                  className="flex items-center space-x-2 p-2.5 bg-muted/50 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    name="startHours"
                    value={hour}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-xs font-medium text-foreground">
                    {hour}
                  </span>
                </label>
              ))}
            </div>
            {state.errors?.startHours && (
              <p className="text-xs text-destructive font-medium">
                {state.errors.startHours[0]}
              </p>
            )}
          </div>

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
