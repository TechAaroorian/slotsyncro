// apps/app/components/booking/booking-success.tsx
import { CheckCircle2, Calendar, Clock, Globe } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface BookingSuccessProps {
  eventTitle: string;
  hostName: string;
  startTime: Date;
  duration: number;
  timeZone: string;
  onBookAnother?: () => void;
}

export function BookingSuccess({
  eventTitle,
  hostName,
  startTime,
  duration,
  timeZone,
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
          A calendar invitation and confirmation details have been sent to your
          email.
        </p>
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
