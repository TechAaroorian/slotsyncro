import { formatInTimeZone } from "date-fns-tz";
import { de, enUS, es } from "date-fns/locale";

const dateLocales = { de, en: enUS, es } as const;

type SupportedLocale = keyof typeof dateLocales;

export interface BookingDateTimeDisplay {
  date: string;
  timeRange: string;
  timeZone: string;
}

export function formatBookingDateTime(
  startTime: Date,
  endTime: Date,
  timeZone: string,
  locale: string,
): BookingDateTimeDisplay {
  const dateLocale = dateLocales[locale as SupportedLocale] ?? enUS;
  const formatOptions = { locale: dateLocale };

  return {
    date: formatInTimeZone(startTime, timeZone, "EEEE, MMMM d, yyyy", formatOptions),
    timeRange: `${formatInTimeZone(startTime, timeZone, "p", formatOptions)} – ${formatInTimeZone(endTime, timeZone, "p", formatOptions)}`,
    timeZone,
  };
}
