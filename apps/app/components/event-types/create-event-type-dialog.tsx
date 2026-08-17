"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  eventTypeSchema,
  type EventTypeFormValues,
} from "@/lib/schemas/event-type";
import { createEventType } from "@/app/actions/event-type";
import type { z } from "zod";

type EventTypeFormInput = z.input<typeof eventTypeSchema>;

export function CreateEventTypeDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Fix 1: Replaced 'any' with 'undefined' to pass strict ESLint rules
  const form = useForm<EventTypeFormInput, undefined, EventTypeFormValues>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      duration: 30,
      bufferBefore: 0,
      bufferAfter: 0,
      isActive: true,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<EventTypeFormValues> = async (values) => {
    setServerError(null);

    const result = await createEventType(values);

    if (!result || !result.success) {
      if (result && typeof result.error === "string") {
        setServerError(result.error);
      } else {
        setServerError("Failed to create event type. Please check the inputs.");
      }
      return;
    }

    form.reset();
    setOpen(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);

    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    form.setValue("slug", generatedSlug, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Fix 2: Removed asChild and render Button directly inside DialogTrigger */}
      <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground gap-2">
        <Plus className="h-4 w-4" /> New Event Type
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add New Event Type</DialogTitle>
          <DialogDescription>
            Create a new meeting template that guests can book on your calendar.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 15-Min Quick Sync"
                      {...field}
                      value={(field.value as string) || ""}
                      onChange={handleTitleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                      <span>/</span>
                      <Input
                        {...field}
                        value={(field.value as string) || ""}
                        className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                        placeholder="15min-sync"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your guest link will be slotsyncro.com/[username]/
                    {(field.value as string) || "slug"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      max={480}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      disabled={field.disabled}
                      value={typeof field.value === "number" ? field.value : 30}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly explain what this meeting is for..."
                      rows={3}
                      {...field}
                      value={(field.value as string) || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Create Event Type"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
