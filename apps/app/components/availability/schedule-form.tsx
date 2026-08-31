"use client";

import { useState, useTransition, useMemo } from "react";
import { DayOfWeek } from "@prisma/client";
import {
  Globe,
  Plus,
  Trash2,
  Save,
  Check,
  CalendarDays,
  ArrowRight,
  Copy,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (EST/EDT)" },
  { value: "America/Chicago", label: "Central Time (CST/CDT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PST/PDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris, Berlin (CET/CEST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AEST)" },
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const WEEKDAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  day: DayOfWeek;
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface ScheduleFormProps {
  initialData: {
    timeZone: string;
    schedule: DaySchedule[];
  };
  onSubmit?: (data: {
    timeZone: string;
    schedule: DaySchedule[];
  }) => Promise<{ success: boolean } | void>;
}

export function ScheduleForm({
  initialData,
  onSubmit,
}: ScheduleFormProps) {
  const [timeZone, setTimeZone] = useState(initialData.timeZone || "UTC");
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialData.schedule);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const markDirty = () => {
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  const toggleDay = (day: DayOfWeek) => {
    markDirty();
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, isAvailable: !item.isAvailable } : item,
      ),
    );
  };

  const addSlot = (day: DayOfWeek) => {
    markDirty();
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        const lastSlot = item.slots[item.slots.length - 1];
        const newStart = lastSlot ? lastSlot.endTime : "13:00";
        const newEnd = "17:00";
        return {
          ...item,
          slots: [...item.slots, { startTime: newStart, endTime: newEnd }],
        };
      }),
    );
  };

  const removeSlot = (day: DayOfWeek, index: number) => {
    markDirty();
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        if (item.slots.length <= 1) return item;
        return {
          ...item,
          slots: item.slots.filter((_, i) => i !== index),
        };
      }),
    );
  };

  const updateSlot = (
    day: DayOfWeek,
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    markDirty();
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        const updatedSlots = item.slots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot,
        );
        return { ...item, slots: updatedSlots };
      }),
    );
  };

  const copyMondayToWeekdays = () => {
    const monday = schedule.find((s) => s.day === "MONDAY");
    if (!monday) return;

    markDirty();
    setSchedule((prev) =>
      prev.map((item) => {
        if (WEEKDAYS.includes(item.day)) {
          return {
            ...item,
            isAvailable: monday.isAvailable,
            slots: JSON.parse(JSON.stringify(monday.slots)),
          };
        }
        return item;
      }),
    );
  };

  const resetForm = () => {
    setTimeZone(initialData.timeZone || "UTC");
    setSchedule(initialData.schedule);
    setHasUnsavedChanges(false);
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    startTransition(async () => {
      if (onSubmit) {
        await onSubmit({ timeZone, schedule });
      }
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    });
  };

  const activeDaysCount = useMemo(
    () => schedule.filter((d) => d.isAvailable).length,
    [schedule],
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Availability
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your recurring weekly availability and timezone settings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyMondayToWeekdays}
            className="text-xs gap-1.5"
            title="Copy Monday's schedule to Tuesday-Friday"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Mon to Weekdays</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-xs overflow-hidden">
          <CardHeader className="pb-5 border-b border-border/40 bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                  <CardTitle className="text-xl font-semibold">
                    Weekly Schedule
                  </CardTitle>
                  <Badge variant="secondary" className="font-normal text-xs">
                    {activeDaysCount} Days Active
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Set recurring working hours for each day of the week.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2.5 bg-background/80 p-1.5 px-3 rounded-lg border border-border/60 shadow-2xs shrink-0">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Timezone:
                </span>
                <Select
                  value={timeZone}
                  onValueChange={(val) => {
                    if (val) {
                      markDirty();
                      setTimeZone(val);
                    }
                  }}
                >
                  <SelectTrigger className="h-7 border-none shadow-none text-xs font-medium focus:ring-0 w-50 p-0">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {TIMEZONES.map((tz) => (
                      <SelectItem
                        key={tz.value}
                        value={tz.value}
                        className="text-xs"
                      >
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 divide-y divide-border/40">
            {schedule.map((dayItem) => {
              const label = DAY_LABELS[dayItem.day];
              return (
                <div
                  key={dayItem.day}
                  className={`py-4 flex flex-col md:flex-row md:items-start gap-4 transition-all duration-150 group hover:bg-background/50 ${
                    !dayItem.isAvailable ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-56 shrink-0 pt-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={dayItem.isAvailable}
                        onCheckedChange={() => toggleDay(dayItem.day)}
                        id={`switch-${dayItem.day}`}
                      />
                      <Label
                        htmlFor={`switch-${dayItem.day}`}
                        className="font-semibold text-base cursor-pointer select-none"
                      >
                        {label}
                      </Label>
                    </div>

                    {dayItem.isAvailable ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal border-emerald-500/30 text-emerald-600 bg-emerald-500/10 flex items-center gap-1.5 px-2 py-0.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal text-muted-foreground bg-muted/30 px-2 py-0.5"
                      >
                        Off
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    {dayItem.isAvailable ? (
                      <div className="space-y-3 flex justify-between">
                        <div className="space-y-2.5">
                          {dayItem.slots.map((slot, index) => (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/60 shadow-2xs hover:border-border transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) =>
                                    updateSlot(
                                      dayItem.day,
                                      index,
                                      "startTime",
                                      e.target.value,
                                    )
                                  }
                                  className="h-9 text-xs font-mono font-medium w-full sm:w-36 bg-background"
                                />

                                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mx-1" />

                                <Input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) =>
                                    updateSlot(
                                      dayItem.day,
                                      index,
                                      "endTime",
                                      e.target.value,
                                    )
                                  }
                                  className="h-9 text-xs font-mono font-medium w-full sm:w-36 bg-background"
                                />
                              </div>

                              <div className="flex items-center justify-end">
                                {dayItem.slots.length > 1 ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeSlot(dayItem.day, index)
                                    }
                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    title="Remove slot"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <div className="w-9" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSlot(dayItem.day)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground border-dashed gap-1.5 px-3 mt-2"
                        >
                          <Plus className="h-3.5 w-3.5 text-primary" />
                          <span>Add Shift</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-1.5 px-3 rounded-lg border border-dashed border-border/50 bg-muted/10 text-muted-foreground">
                        <span className="text-xs italic font-medium">
                          No availability
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDay(dayItem.day)}
                          className="h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 px-2.5 font-medium"
                        >
                          Enable
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border/40 p-4 px-6 bg-muted/20">
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 animate-in fade-in">
                  <Check className="h-3.5 w-3.5" />
                  Schedule saved successfully!
                </span>
              )}
              {hasUnsavedChanges && !saveSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending || (!hasUnsavedChanges && !saveSuccess)}
              className="gap-2 min-w-36 font-medium shadow-2xs"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Schedule
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
