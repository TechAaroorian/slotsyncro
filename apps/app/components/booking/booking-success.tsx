// apps/app/components/booking/booking-success.tsx
import {
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  MailCheck,
  MailWarning,
  Paperclip,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { EmailDeliveryResult } from "@/app/actions/booking";

interface BookingSuccessProps {
  eventTitle: string;
  hostName: string;
  startTime: Date;
  duration: number;
  timeZone: string;
  emailDelivery: EmailDeliveryResult;
  onBookAnother?: () => void;
}

export function BookingSuccess({
  eventTitle,
  hostName,
  startTime,
  duration,
  timeZone,
  emailDelivery,
  onBookAnother,
}: BookingSuccessProps) {
  return (
    <div className="text-center py-8 px-4 space-y-6 max-w-md mx-auto">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in-50 duration-300" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          You&apos;re Scheduled!
        </h2>
        <p className="text-sm text-muted-foreground">
          Your meeting has been successfully booked.
        </p>
      </div>

      <div
        className={`rounded-lg border p-4 text-left ${
          emailDelivery.status === "SENT"
            ? "border-green-200 bg-green-50/70 dark:border-green-900 dark:bg-green-950/30"
            : "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          {emailDelivery.status === "SENT" ? (
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          )}
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">
              {emailDelivery.status === "SENT"
                ? "Confirmation email sent"
                : "Confirmation email could not be sent"}
            </p>
            <p className="break-all text-sm text-muted-foreground">
              {emailDelivery.status === "SENT"
                ? `Sent to ${emailDelivery.recipient}`
                : `Your booking is confirmed, but delivery to ${emailDelivery.recipient} failed.`}
            </p>
            {emailDelivery.status === "SENT" && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                Calendar invitation attached
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border text-left space-y-3">
        <div className="font-semibold text-foreground text-base border-b pb-2">
          {eventTitle} with {hostName}
        </div>
        <div className="flex items-center text-sm text-muted-foreground space-x-2">
          <Calendar className="h-4 w-4 text-foreground shrink-0" />
          <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground space-x-2">
          <Clock className="h-4 w-4 text-foreground shrink-0" />
          <span>
            {format(startTime, "h:mm a")} ({duration} min)
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground space-x-2">
          <Globe className="h-4 w-4 text-foreground shrink-0" />
          <span>{timeZone}</span>
        </div>
      </div>

      {onBookAnother && (
        <Button variant="outline" onClick={onBookAnother} className="w-full">
          Schedule Another Meeting
        </Button>
      )}
    </div>
  );
}
