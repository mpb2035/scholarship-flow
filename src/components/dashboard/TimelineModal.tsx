import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Matter } from '@/types/matter';
import { History, Copy, Check, Clock, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, addDays, getDay, format } from 'date-fns';

interface ExcludedDate {
  date: string;
  displayDate: string;
  reason: 'Friday' | 'Sunday' | string; // string for PH name
}

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

// Brunei Darussalam public holidays (fixed + estimated dates for moveable holidays)
// Moveable Islamic holidays are approximated for 2024-2027 range
function getBruneiPublicHolidays(year: number): Map<string, string> {
  const holidays = new Map<string, string>();

  // All holidays by year (fixed + moveable combined, sourced from official gazette / publicholidays.asia)
  const holidaysByYear: Record<number, [string, string][]> = {
    2024: [
      ['2024-01-01', "New Year's Day"],
      ['2024-02-08', 'Israk Mikraj'],
      ['2024-02-10', 'Chinese New Year'],
      ['2024-02-23', 'National Day'],
      ['2024-03-12', 'Awal Ramadhan'],
      ['2024-03-27', 'Nuzul Al-Quran'],
      ['2024-04-10', 'Hari Raya Aidilfitri'], ['2024-04-11', 'Hari Raya Aidilfitri'], ['2024-04-12', 'Hari Raya Aidilfitri'],
      ['2024-05-31', 'RBAF Day'],
      ['2024-06-17', 'Hari Raya Aidiladha'], ['2024-06-18', 'Hari Raya Aidiladha'],
      ['2024-07-08', 'Awal Muharram'],
      ['2024-07-15', "Sultan's Birthday"],
      ['2024-09-16', 'Maulud Nabi'],
      ['2024-12-25', 'Christmas Day'],
    ],
    2025: [
      ['2025-01-01', "New Year's Day"],
      ['2025-01-27', 'Israk Mikraj'],
      ['2025-01-29', 'Chinese New Year'],
      ['2025-02-23', 'National Day'],
      ['2025-03-01', 'Awal Ramadhan'], ['2025-03-02', 'Awal Ramadhan'],
      ['2025-03-15', 'Nuzul Al-Quran'],
      ['2025-03-30', 'Hari Raya Aidilfitri'], ['2025-03-31', 'Hari Raya Aidilfitri'], ['2025-04-01', 'Hari Raya Aidilfitri'],
      ['2025-05-31', 'RBAF Day'],
      ['2025-06-06', 'Hari Raya Aidiladha'], ['2025-06-07', 'Hari Raya Aidiladha'],
      ['2025-06-27', 'Awal Muharram'],
      ['2025-07-15', "Sultan's Birthday"],
      ['2025-09-05', 'Maulud Nabi'],
      ['2025-12-25', 'Christmas Day'],
    ],
    // 2026: Official gazetted holidays (ref: pmo.gov.bn circular jpmsk04-2025)
    2026: [
      ['2026-01-01', "New Year's Day"],
      ['2026-01-17', 'Israk Mikraj'],
      ['2026-02-17', 'Chinese New Year'],
      ['2026-02-19', 'Awal Ramadhan'],
      ['2026-02-23', 'National Day'],
      ['2026-03-07', 'Nuzul Al-Quran'],
      ['2026-03-21', 'Hari Raya Aidilfitri'], ['2026-03-22', 'Hari Raya Aidilfitri'], ['2026-03-23', 'Hari Raya Aidilfitri'], ['2026-03-24', 'Hari Raya Aidilfitri'],
      ['2026-05-27', 'Hari Raya Aidiladha'],
      ['2026-05-31', 'RBAF Day'],
      ['2026-06-01', 'RBAF Day Holiday'],
      ['2026-06-17', 'Awal Muharram'],
      ['2026-07-15', "Sultan's Birthday"],
      ['2026-08-25', 'Maulud Nabi'],
      ['2026-12-25', 'Christmas Day'],
      ['2026-12-26', 'Christmas Holiday'],
    ],
    // 2027: Estimated dates (moveable Islamic holidays approximate)
    2027: [
      ['2027-01-01', "New Year's Day"],
      ['2027-01-02', "New Year Holiday"],
      ['2027-01-05', 'Israk Mikraj'],
      ['2027-02-06', 'Chinese New Year'],
      ['2027-02-08', 'Awal Ramadhan'],
      ['2027-02-23', 'National Day'],
      ['2027-02-24', 'Nuzul Al-Quran'],
      ['2027-03-10', 'Hari Raya Aidilfitri'], ['2027-03-11', 'Hari Raya Aidilfitri'], ['2027-03-12', 'Hari Raya Aidilfitri'], ['2027-03-13', 'Hari Raya Aidilfitri'],
      ['2027-05-17', 'Hari Raya Aidiladha'],
      ['2027-05-31', 'RBAF Day'],
      ['2027-06-06', 'Awal Muharram'],
      ['2027-06-07', 'Awal Muharram Holiday'],
      ['2027-07-15', "Sultan's Birthday"],
      ['2027-08-15', 'Maulud Nabi'],
      ['2027-08-16', 'Maulud Nabi Holiday'],
      ['2027-12-25', 'Christmas Day'],
      ['2027-12-26', 'Israk Mikraj'],
      ['2027-12-27', 'Israk Mikraj Holiday'],
    ],
    // 2028: Estimated dates
    2028: [
      ['2028-01-01', "New Year's Day"],
      ['2028-01-26', 'Chinese New Year'],
      ['2028-01-28', 'Awal Ramadhan'],
      ['2028-01-29', 'Awal Ramadhan Holiday'],
      ['2028-02-13', 'Nuzul Al-Quran'],
      ['2028-02-23', 'National Day'],
      ['2028-02-26', 'Hari Raya Aidilfitri'], ['2028-02-27', 'Hari Raya Aidilfitri'], ['2028-02-28', 'Hari Raya Aidilfitri'], ['2028-02-29', 'Hari Raya Aidilfitri'],
      ['2028-05-05', 'Hari Raya Aidiladha'],
      ['2028-05-06', 'Hari Raya Aidiladha Holiday'],
      ['2028-05-25', 'Awal Muharram'],
      ['2028-05-31', 'RBAF Day'],
      ['2028-07-15', "Sultan's Birthday"],
      ['2028-08-03', 'Maulud Nabi'],
      ['2028-12-14', 'Israk Mikraj'],
      ['2028-12-25', 'Christmas Day'],
    ],
  };

  (holidaysByYear[year] || []).forEach(([d, name]) => holidays.set(d, name));
  return holidays;
}

function getWorkingDaysBetween(startDate: Date, endDate: Date): number {
  const start = startDate < endDate ? startDate : endDate;
  const end = startDate < endDate ? endDate : startDate;

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const allHolidays = new Map<string, string>();
  for (let y = startYear; y <= endYear; y++) {
    getBruneiPublicHolidays(y).forEach((name, d) => allHolidays.set(d, name));
  }

  let workingDays = 0;
  let current = addDays(start, 1);

  while (current <= end) {
    const dayOfWeek = getDay(current);
    const isFriday = dayOfWeek === 5;
    const isSunday = dayOfWeek === 0;
    const dateStr = format(current, 'yyyy-MM-dd');
    const isHoliday = allHolidays.has(dateStr);

    if (!isFriday && !isSunday && !isHoliday) {
      workingDays++;
    }
    current = addDays(current, 1);
  }

  return workingDays;
}

function getExcludedDates(startDate: Date, endDate: Date): ExcludedDate[] {
  const start = startDate < endDate ? startDate : endDate;
  const end = startDate < endDate ? endDate : startDate;

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const allHolidays = new Map<string, string>();
  for (let y = startYear; y <= endYear; y++) {
    getBruneiPublicHolidays(y).forEach((name, d) => allHolidays.set(d, name));
  }

  const excluded: ExcludedDate[] = [];
  let current = addDays(start, 1);

  while (current <= end) {
    const dayOfWeek = getDay(current);
    const isFriday = dayOfWeek === 5;
    const isSunday = dayOfWeek === 0;
    const dateStr = format(current, 'yyyy-MM-dd');
    const holidayName = allHolidays.get(dateStr);

    if (isFriday || isSunday || holidayName) {
      const reasons: string[] = [];
      if (isFriday) reasons.push('Friday');
      if (isSunday) reasons.push('Sunday');
      if (holidayName) reasons.push(holidayName);
      excluded.push({
        date: dateStr,
        displayDate: format(current, 'dd MMM yyyy (EEE)'),
        reason: reasons.join(' + '),
      });
    }
    current = addDays(current, 1);
  }

  return excluded;
}

function buildTimeline(matter: Matter): TimelineEvent[] {
  const timelineEvents: TimelineEvent[] = [];
  const dateFields: { key: keyof Matter; label: string }[] = [
    { key: 'dsmSubmittedDate', label: 'Dept Submitted' },
    { key: 'sutheReceivedDate', label: 'SUT HE Received' },
    { key: 'suthePassToDepartmentDate', label: 'SUT HE Passed to Department' },
    { key: 'sutheSubmittedToHuDate', label: 'SUT HE Submitted to HU' },
    { key: 'huReturnedToSutheDate', label: 'HU Returned to SUT HE' },
    { key: 'queryIssuedDate', label: 'Query Issued to Dept' },
    { key: 'queryResponseDate', label: 'Query Response Received' },
    { key: 'secondQueryIssuedDate', label: '2nd Query Issued to Dept' },
    { key: 'secondQueryResponseDate', label: '2nd Query Response Received' },
    { key: 'secondSutheSubmittedToHuDate', label: '2nd SUT HE Submitted to HU' },
    { key: 'signedDate', label: 'Approved & Signed' },
  ];

  dateFields.forEach(({ key, label }) => {
    const dateValue = matter[key];
    if (dateValue && typeof dateValue === 'string') {
      timelineEvents.push({ date: dateValue, status: label, sortDate: new Date(dateValue) });
    }
  });

  timelineEvents.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
  return timelineEvents;
}

function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateForCopy(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function getDaysBetween(date1: Date, date2: Date): number {
  return Math.abs(differenceInDays(date2, date1));
}

export function TimelineModal({ open, onOpenChange, matter }: TimelineModalProps) {
  const [copied, setCopied] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);

  if (!matter) return null;

  const timeline = buildTimeline(matter);
  const today = new Date();
  const latestEvent = timeline.length > 0 ? timeline[timeline.length - 1] : null;
  const daysSinceLatest = latestEvent ? getDaysBetween(latestEvent.sortDate, today) : 0;
  const workingDaysSinceLatest = latestEvent ? getWorkingDaysBetween(latestEvent.sortDate, today) : 0;
  const excludedDates = latestEvent ? getExcludedDates(latestEvent.sortDate, today) : [];
  const fridayCount = excludedDates.filter(d => d.reason.includes('Friday')).length;
  const sundayCount = excludedDates.filter(d => d.reason.includes('Sunday')).length;
  const phCount = excludedDates.filter(d => !['Friday', 'Sunday'].includes(d.reason)).length;

  const handleCopyHistory = async () => {
    const historyText = timeline
      .map((event, index) => {
        const daysPart = index > 0
          ? ` (+${getDaysBetween(timeline[index - 1].sortDate, event.sortDate)}d / ${getWorkingDaysBetween(timeline[index - 1].sortDate, event.sortDate)}wd)`
          : '';
        return `${formatDateForCopy(event.date)} - ${event.status}${daysPart}`;
      })
      .join('\n');

    const latestNote = latestEvent
      ? `\n\nDays since last update: ${daysSinceLatest} calendar days / ${workingDaysSinceLatest} working days`
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
      <DialogContent className="max-w-lg bg-card border-border">
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
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />

              <div className="space-y-6">
                {timeline.map((event, index) => {
                  const daysSincePrevious = index > 0
                    ? getDaysBetween(timeline[index - 1].sortDate, event.sortDate)
                    : 0;
                  const workingDaysSincePrevious = index > 0
                    ? getWorkingDaysBetween(timeline[index - 1].sortDate, event.sortDate)
                    : 0;

                  return (
                    <div key={index} className="relative flex gap-4">
                      <div
                        className={cn(
                          'absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2',
                          index === timeline.length - 1
                            ? 'bg-primary border-primary'
                            : 'bg-card border-muted-foreground'
                        )}
                      />

                      {index > 0 && (
                        <div className="absolute left-[-24px] -top-4 flex gap-1">
                          <span className="text-[10px] text-muted-foreground font-mono bg-card px-1">+{daysSincePrevious}d</span>
                          <span className="text-[10px] text-primary font-mono bg-card px-1">+{workingDaysSincePrevious}wd</span>
                        </div>
                      )}

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

          {/* Days since latest update - Calendar & Working */}
          {latestEvent && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Calendar Days</p>
                    <p className="font-mono font-bold text-primary">{daysSinceLatest} days</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExcluded(!showExcluded)}
                  className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-left w-full"
                >
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground">Working Days</p>
                    <p className="font-mono font-bold text-primary">{workingDaysSinceLatest} days</p>
                    <p className="text-[10px] text-muted-foreground">Excl. Fri, Sun & PH</p>
                  </div>
                  {showExcluded ? (
                    <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </button>
              </div>

              {/* Excluded dates breakdown */}
              {showExcluded && excludedDates.length > 0 && (
                <div className="mt-3 rounded-md border border-border bg-muted/30 overflow-hidden">
                  <div className="px-3 py-2 border-b border-border bg-muted/50">
                    <p className="text-[11px] font-semibold text-foreground">
                      Excluded Dates ({excludedDates.length})
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {fridayCount} Fri · {sundayCount} Sun · {phCount} PH
                    </p>
                  </div>
                  <ScrollArea className="max-h-40">
                    <div className="divide-y divide-border">
                      {excludedDates.map((d) => (
                        <div key={d.date} className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-[11px] font-mono text-foreground">{d.displayDate}</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium",
                            d.reason === 'Friday' ? 'bg-blue-500/15 text-blue-400' :
                            d.reason === 'Sunday' ? 'bg-purple-500/15 text-purple-400' :
                            'bg-amber-500/15 text-amber-400'
                          )}>
                            {d.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        {timeline.length > 0 && (
          <div className="pt-2 border-t border-border">
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleCopyHistory}>
              {copied ? (
                <><Check className="h-4 w-4 text-success" /> Copied!</>
              ) : (
                <><Copy className="h-4 w-4" /> Copy Case History</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
