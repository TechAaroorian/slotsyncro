import { addMinutes, isBefore, isAfter } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export interface TimeSlot {
  utcStart: Date;
  utcEnd: Date;
  formattedLocal: string;
}

export interface ExistingBooking {
  startTime: Date;
  endTime: Date;
}

export interface DayWindow {
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "17:00"
}

export interface GenerateSlotsParams {
  date: string; // "YYYY-MM-DD"
  hostTimeZone: string; // e.g. "America/New_York"
  guestTimeZone: string; // e.g. "Asia/Kolkata"
  duration: number; // Minutes
  bufferBefore: number; // Minutes
  bufferAfter: number; // Minutes
  dayWindows: DayWindow[];
  existingBookings: ExistingBooking[];
}

export function generateAvailableSlots({
  date,
  hostTimeZone,
  guestTimeZone,
  duration,
  bufferBefore,
  bufferAfter,
  dayWindows,
  existingBookings,
}: GenerateSlotsParams): TimeSlot[] {
  const availableSlots: TimeSlot[] = [];

  for (const window of dayWindows) {
    const hostStartStr = `${date}T${window.startTime}:00`;
    const hostEndStr = `${date}T${window.endTime}:00`;

    const hostWindowStart = fromZonedTime(hostStartStr, hostTimeZone);
    const hostWindowEnd = fromZonedTime(hostEndStr, hostTimeZone);

    let currentSlotStart = hostWindowStart;

    while (true) {
      const currentSlotEnd = addMinutes(currentSlotStart, duration);
      const bufferedStart = addMinutes(currentSlotStart, -bufferBefore);
      const bufferedEnd = addMinutes(currentSlotEnd, bufferAfter);

      if (isAfter(bufferedEnd, hostWindowEnd)) {
        break;
      }

      const hasConflict = existingBookings.some((booking) => {
        return (
          isBefore(bufferedStart, booking.endTime) &&
          isAfter(bufferedEnd, booking.startTime)
        );
      });

      if (!hasConflict) {
        const formattedLocal = formatInTimeZone(
          currentSlotStart,
          guestTimeZone,
          "hh:mm a",
        );

        availableSlots.push({
          utcStart: currentSlotStart,
          utcEnd: currentSlotEnd,
          formattedLocal,
        });
      }

      currentSlotStart = addMinutes(currentSlotEnd, bufferAfter);
    }
  }

  return availableSlots;
}
