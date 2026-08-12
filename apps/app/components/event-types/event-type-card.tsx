"use client";

import { useState, useTransition } from "react";
import { Clock, Copy, Check, Trash2, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { toggleEventType, deleteEventType } from "@/app/actions/event-type";

interface EventTypeCardProps {
  id: string;
  title: string;
  slug: string;
  duration: number;
  description?: string | null;
  isActive: boolean;
  username: string;
}

export function EventTypeCard({
  id,
  title,
  slug,
  duration,
  description,
  isActive: initialIsActive,
  username,
}: EventTypeCardProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/${username}/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = (checked: boolean) => {
    setIsActive(checked);
    startTransition(async () => {
      const res = await toggleEventType(id, checked);
      if (!res || !res.success) {
        setIsActive(!checked); // Revert UI state on server failure
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteEventType(id);
    });
  };

  return (
    <Card className="flex flex-col justify-between border-border/60 bg-card/60 shadow-sm transition-all hover:border-border">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 pr-4">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{duration} mins</span>
            <span>•</span>
            <span className="font-mono text-[11px]">/{slug}</span>
          </div>
        </div>

        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label="Toggle active status"
        />
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </Button>

            {/* Fix 2: Removed asChild from Button tag */}
            <a
              href={`/${username}/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <AlertDialog>
            <AlertDialogTrigger
              className="h-8 w-8 flex items-center text-muted-foreground hover:text-destructive cursor-pointer"
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event Type?</AlertDialogTitle>
                {/* Fix 3: Escaped quotes using &quot; */}
                <AlertDialogDescription>
                  This will permanently delete &quot;{title}&quot;. Any existing
                  booking links for this slug will stop working.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
