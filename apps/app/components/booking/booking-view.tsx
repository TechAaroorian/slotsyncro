"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Globe } from "lucide-react";

interface HostUser {
  name: string | null;
  username: string;
  timeZone: string | null;
}

interface EventTypeItem {
  title: string;
  description: string | null;
  duration: number;
}

interface BookingViewProps {
  host: HostUser;
  eventType: EventTypeItem;
}

export function BookingView({ host, eventType }: BookingViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const selectedTimeZone = host.timeZone || "UTC";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Event Metadata Overview */}
      <Card className="md:col-span-1 shadow-sm border">
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">
            {host.name || host.username}
          </p>
          <CardTitle className="text-xl">{eventType.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 pt-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{eventType.duration} mins</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventType.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {eventType.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            <span>Timezone: {selectedTimeZone}</span>
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Interactive Calendar & Dynamic Slots */}
      <Card className="md:col-span-2 shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg">Select a Date & Time</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate: Date | undefined) => setDate(newDate)}
              className="rounded-md border shadow-sm"
              disabled={(d: Date) =>
                d < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </div>
          <div className="flex-1 border-l pl-0 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0">
            <h3 className="text-sm font-medium mb-3">
              Available Slots for {date?.toLocaleDateString()}
            </h3>
            <div className="space-y-2 max-h-75 overflow-y-auto pr-2">
              <div className="p-3 text-sm border rounded-md text-center text-muted-foreground bg-muted/20">
                Select a date to view available time slots.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
