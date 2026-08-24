"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookingSchema, type CreateBookingInput } from "@/lib/schemas";
import {
  createBooking,
  type CreateBookingSuccess,
} from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, InfoIcon } from "lucide-react";
import { format } from "date-fns";

interface BookingFormProps {
  eventTypeId: string;
  hostId: string;
  hostName: string;
  eventTitle: string;
  duration: number;
  selectedSlot: Date;
  guestTimeZone: string;
  loggedInUser?: { id: string; name: string; email: string } | null;
  onBack: () => void;
  onSuccess: (confirmation: CreateBookingSuccess) => void;
}

export function BookingForm({
  eventTypeId,
  hostId,
  hostName,
  eventTitle,
  duration,
  selectedSlot,
  guestTimeZone,
  loggedInUser,
  onBack,
  onSuccess,
}: BookingFormProps) {
  const [isPending, startTransition] = useTransition();

  // Check if the current viewer is the owner of the page
  const isOwnPage = loggedInUser?.id === hostId;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema) as Resolver<CreateBookingInput>,
    defaultValues: {
      eventTypeId,
      hostId,
      guestTimeZone,
      startTime: selectedSlot.toISOString(),
      // Auto-populate inputs if the user is authenticated
      guestName: loggedInUser?.name || "",
      guestEmail: loggedInUser?.email || "",
      guestNotes: "",
    },
  });

  const onSubmit = (data: CreateBookingInput) => {
    startTransition(async () => {
      const response = await createBooking(data);
      if (response.success) {
        onSuccess(response);
      } else {
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              setError(field as keyof CreateBookingInput, {
                message: messages[0],
              });
            }
          });
        } else {
          setError("root", { message: response.error });
        }
      }
    });
  };

  return (
    <div className="w-full  space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isPending}
          className="h-8 px-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mt-1">
          You are booking{" "}
          <span className="font-medium text-foreground">{eventTitle}</span> with{" "}
          <span className="font-medium text-foreground">{hostName}</span> for{" "}
          {duration} mins on{" "}
          <span className="font-medium text-foreground">
            {format(selectedSlot, "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </span>{" "}
          ({guestTimeZone}).
        </p>
      </div>

      {isOwnPage && (
        <Alert className="bg-muted text-foreground border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            You are viewing your own booking page. You can submit a test booking
            below.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive font-medium">
            {errors.root.message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="guestName">Your Name *</Label>
          <Input
            id="guestName"
            placeholder="Jane Doe"
            disabled={isPending}
            {...register("guestName")}
          />
          {errors.guestName && (
            <p className="text-xs text-destructive">
              {errors.guestName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestEmail">Your Email *</Label>
          <Input
            id="guestEmail"
            type="email"
            placeholder="jane@example.com"
            disabled={isPending}
            {...register("guestEmail")}
          />
          {errors.guestEmail && (
            <p className="text-xs text-destructive">
              {errors.guestEmail.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestNotes">Additional Notes (Optional)</Label>
          <Textarea
            id="guestNotes"
            placeholder="Please share anything that will help prepare for our meeting."
            disabled={isPending}
            rows={3}
            {...register("guestNotes")}
          />
          {errors.guestNotes && (
            <p className="text-xs text-destructive">
              {errors.guestNotes.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming booking and sending invitation...
            </>
          ) : (
            "Confirm & Schedule"
          )}
        </Button>
      </form>
    </div>
  );
}
