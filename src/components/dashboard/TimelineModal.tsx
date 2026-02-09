import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Matter } from '@/types/matter';
import { History, Copy, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

interface TimelineEvent {
  date: string;
  status: string;
  sortDate: Date;
}

interface TimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matter: Matter | null;
}

function buildTimeline(matter: Matter): TimelineEvent[] {
  const timelineEvents: TimelineEvent[] = [];

  // Map of date fields to their labels
  const dateFields: { key: keyof Matter; label: string }[] = [
    { key: 'dsmSubmittedDate', label: 'Dept Submitted' },
    { key: 'sutheReceivedDate', label: 'SUT HE Received' },
    { key: 'sutheSubmittedToHuDate', label: 'SUT HE Submitted to HU' },
    { key: 'queryIssuedDate', label: 'Query Issued to Dept' },
    { key: 'queryResponseDate', label: 'Query Response Received' },
    { key: 'secondQueryIssuedDate', label: '2nd Query Issued to Dept' },
    { key: 'secondQueryResponseDate', label: '2nd Query Response Received' },
    { key: 'secondSutheSubmittedToHuDate', label: '2nd SUT HE Submitted to HU' },
    { key: 'signedDate', label: 'Approved & Signed' },
  ];

  // Check every date column and push to array if it exists
  dateFields.forEach(({ key, label }) => {
    const dateValue = matter[key];
    if (dateValue && typeof dateValue === 'string') {
      timelineEvents.push({
        date: dateValue,
        status: label,
        sortDate: new Date(dateValue),
      });
    }
  });

  // Sort by date ascending (chronological order)
  timelineEvents.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

  return timelineEvents;
}

function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateForCopy(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getDaysBetween(date1: Date, date2: Date): number {
  return Math.abs(differenceInDays(date2, date1));
}

export function TimelineModal({ open, onOpenChange, matter }: TimelineModalProps) {
  const [copied, setCopied] = useState(false);

  if (!matter) return null;

  const timeline = buildTimeline(matter);
  const today = new Date();
  const latestEvent = timeline.length > 0 ? timeline[timeline.length - 1] : null;
  const daysSinceLatest = latestEvent ? getDaysBetween(latestEvent.sortDate, today) : 0;

  const handleCopyHistory = async () => {
    const historyText = timeline
      .map((event, index) => {
        const daysPart = index > 0 
          ? ` (+${getDaysBetween(timeline[index - 1].sortDate, event.sortDate)} days)`
          : '';
        return `${formatDateForCopy(event.date)} - ${event.status}${daysPart}`;
      })
      .join('\n');

    const latestNote = latestEvent 
      ? `\n\nDays since last update: ${daysSinceLatest} days`
      : '';

    try {
      await navigator.clipboard.writeText(historyText + latestNote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-lg gold-text flex items-center gap-2">
            <History className="h-5 w-5" />
            Case Timeline
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-mono">{matter.caseId}</p>
        </DialogHeader>

        <div className="py-4">
          {timeline.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No timeline events recorded
            </p>
          ) : (
            <div className="relative pl-6">
              {/* Vertical connecting line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />

              <div className="space-y-6">
                {timeline.map((event, index) => {
                  const daysSincePrevious = index > 0 
                    ? getDaysBetween(timeline[index - 1].sortDate, event.sortDate) 
                    : 0;

                  return (
                    <div key={index} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          'absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2',
                          index === timeline.length - 1
                            ? 'bg-primary border-primary'
                            : 'bg-card border-muted-foreground'
                        )}
                      />

                      {/* Days between indicator */}
                      {index > 0 && (
                        <div className="absolute left-[-14px] -top-4 text-[10px] text-muted-foreground font-mono bg-card px-1">
                          +{daysSincePrevious}d
                        </div>
                      )}

                      {/* Event content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-sm text-foreground">
                          {formatDateDisplay(event.date)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {event.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Days since latest update */}
          {latestEvent && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Days since last update:</span>
                <span className="font-mono font-bold text-primary">{daysSinceLatest} days</span>
              </div>
            </div>
          )}
        </div>

        {timeline.length > 0 && (
          <div className="pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleCopyHistory}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Case History
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
