import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Matter } from '@/types/matter';
import { History, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { key: 'queryIssuedDate', label: 'Query Issued' },
    { key: 'queryResponseDate', label: 'Query Response Received' },
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

export function TimelineModal({ open, onOpenChange, matter }: TimelineModalProps) {
  const [copied, setCopied] = useState(false);

  if (!matter) return null;

  const timeline = buildTimeline(matter);

  const handleCopyHistory = async () => {
    const historyText = timeline
      .map((event) => `${formatDateForCopy(event.date)} - ${event.status}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(historyText);
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
                {timeline.map((event, index) => (
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
                ))}
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
