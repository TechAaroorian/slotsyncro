"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Clock, Globe } from "lucide-react";
import {
  generateAvailableSlots,
  type DayWindow,
  type ExistingBooking,
  type TimeSlot,
} from "@/lib/availability/engine";
import { BookingForm } from "./booking-form";
import { BookingSuccess } from "./booking-success";
import type { CreateBookingSuccess } from "@/app/actions/booking";

export type BookingStep = "SELECTING_SLOT" | "ENTERING_DETAILS" | "CONFIRMED";

interface HostUser {
  id: string;
  name: string | null;
  username: string | null;
  timeZone: string | null;
}

interface EventTypeItem {
  id: string;
  title: string;
  description: string | null;
  duration: number;
}

interface UserAvailabilityItem {
  id: string;
  day: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  slots: unknown;
}

// ✨ ADDED: Session User Interface
interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface BookingViewProps {
  host: HostUser;
  eventType: EventTypeItem;
  weeklyAvailability: UserAvailabilityItem[];
  existingBookings: ExistingBooking[];
  locale?: string;
  loggedInUser?: SessionUser | null; // ✨ ADDED: Prop definition
}

export function BookingView({
  host,
  eventType,
  weeklyAvailability,
  existingBookings,
  loggedInUser, // ✨ ADDED: Destructure prop
}: BookingViewProps) {
  const [step, setStep] = useState<BookingStep>("SELECTING_SLOT");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [confirmation, setConfirmation] =
    useState<CreateBookingSuccess | null>(null);

  const guestTimeZone = useMemo(() => {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || host.timeZone || "UTC"
    );
  }, [host.timeZone]);

  // Compute available slots matching engine.ts GenerateSlotsParams schema
  const availableSlots: TimeSlot[] = useMemo(() => {
    if (!selectedDate) return [];

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const dayOfWeek = format(selectedDate, "EEEE").toUpperCase(); // e.g. "MONDAY"

    const hostDaySchedule = weeklyAvailability.find(
      (item) => item.day.toUpperCase() === dayOfWeek && item.isAvailable,
    );

    if (!hostDaySchedule) {
      return [];
    }

    let dayWindows: DayWindow[] = [];

    if (
      Array.isArray(hostDaySchedule.slots) &&
      hostDaySchedule.slots.length > 0
    ) {
      dayWindows = hostDaySchedule.slots as DayWindow[];
    } else if (hostDaySchedule.startTime && hostDaySchedule.endTime) {
      dayWindows = [
        {
          startTime: hostDaySchedule.startTime,
          endTime: hostDaySchedule.endTime,
        },
      ];
    }

    if (dayWindows.length === 0) {
      return [];
    }

    return generateAvailableSlots({
      date: dateKey,
      hostTimeZone: host.timeZone || "UTC",
      guestTimeZone,
      duration: eventType.duration,
      bufferBefore: 0,
      bufferAfter: 0,
      dayWindows,
      existingBookings,
    });
  }, [
    selectedDate,
    weeklyAvailability,
    eventType.duration,
    host.timeZone,
    guestTimeZone,
    existingBookings,
  ]);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot.utcStart);
    setStep("ENTERING_DETAILS");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Host & Event Metadata Overview */}
      <Card className="md:col-span-1 shadow-sm border h-fit">
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">
            {host.name || host.username || "Host"}
          </p>
          <CardTitle className="text-xl">{eventType.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 pt-2">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{eventType.duration} mins</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventType.description && (
            <p className="text-sm text-muted-foreground">
              {eventType.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>Timezone: {guestTimeZone}</span>
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Dynamic Step Container */}
      <Card className="md:col-span-2 shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg">
            {step === "SELECTING_SLOT" && "Select a Date & Time"}
            {step === "ENTERING_DETAILS" && "Confirm Your Booking"}
            {step === "CONFIRMED" && "Meeting Confirmed"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Step 1: Calendar & Slot Grid */}
          {step === "SELECTING_SLOT" && (
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date: Date | undefined) => setSelectedDate(date)}
                  className="rounded-md border shadow-sm"
                  disabled={(d: Date) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </div>

              <div className="flex-1 border-l pl-0 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0">
                <h3 className="text-sm font-medium mb-3">
                  Available Slots for{" "}
                  {selectedDate
                    ? format(selectedDate, "EEE, MMM d")
                    : "Selected Day"}
                </h3>

                {availableSlots.length === 0 ? (
                  <div className="p-4 text-sm border rounded-md text-center text-muted-foreground bg-muted/20">
                    No available time slots on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-75 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.utcStart.toISOString()}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectSlot(slot)}
                        className="w-full text-xs font-medium hover:border-primary hover:text-primary transition-colors"
                      >
                        {slot.formattedLocal}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Guest Details Form */}
          {step === "ENTERING_DETAILS" && selectedSlot && (
            <BookingForm
              eventTypeId={eventType.id}
              hostId={host.id}
              hostName={host.name || host.username || "Host"}
              eventTitle={eventType.title}
              duration={eventType.duration}
              selectedSlot={selectedSlot}
              guestTimeZone={guestTimeZone}
              onBack={() => setStep("SELECTING_SLOT")}
              onSuccess={(result) => {
                setConfirmation(result);
                setStep("CONFIRMED");
              }}
              loggedInUser={loggedInUser}
            />
          )}

          {/* Step 3: Success Confirmation State */}
          {step === "CONFIRMED" && selectedSlot && confirmation && (
            <BookingSuccess
              eventTitle={eventType.title}
              hostName={host.name || host.username || "Host"}
              startTime={selectedSlot}
              duration={eventType.duration}
              timeZone={guestTimeZone}
              emailDelivery={confirmation.emailDelivery}
              onBookAnother={() => {
                setSelectedSlot(null);
                setConfirmation(null);
                setStep("SELECTING_SLOT");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
