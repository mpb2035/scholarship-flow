import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trainingPlan, goalInfo, TrainingDay } from '@/data/trainingPlanData';
import { format, parseISO, isAfter, isBefore, isToday, differenceInDays } from 'date-fns';
import { Calendar, Trophy, Moon, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrainingPlanView() {
  const today = new Date();
  const raceDate = parseISO(goalInfo.raceDate);
  const ramadanStart = parseISO(goalInfo.ramadanStart);
  const ramadanEnd = parseISO(goalInfo.ramadanEnd);

  const getStatusBadge = (day: TrainingDay) => {
    const date = parseISO(day.date);
    
    if (isToday(date)) {
      return <Badge className="bg-primary text-primary-foreground">Today</Badge>;
    }
    if (isBefore(date, today)) {
      return <Badge variant="outline" className="text-muted-foreground">Past</Badge>;
    }
    if (day.type === 'race') {
      return <Badge className="bg-yellow-500 text-yellow-950">Race</Badge>;
    }
    if (day.type === 'rest') {
      return <Badge variant="secondary">Rest</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-600">Upcoming</Badge>;
  };

  const isRamadanPeriod = (dateStr: string) => {
    const date = parseISO(dateStr);
    return isAfter(date, ramadanStart) && isBefore(date, ramadanEnd);
  };

  // Filter to show upcoming and recent workouts
  const relevantPlan = trainingPlan.filter(day => {
    const date = parseISO(day.date);
    const daysAgo = differenceInDays(today, date);
    const daysAhead = differenceInDays(date, today);
    return daysAgo <= 7 || daysAhead <= 60;
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Training Plan: Sub-2 Hour Half Marathon
          </CardTitle>
          <Badge className="bg-orange-500 text-white">
            <Trophy className="h-3 w-3 mr-1" />
            Nov 1, 2026
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Goal Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Target Time</p>
            <p className="text-xl font-bold text-primary">{goalInfo.targetTime}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Target Pace</p>
            <p className="text-xl font-bold text-primary">{goalInfo.targetPace}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Distance</p>
            <p className="text-xl font-bold">{goalInfo.distance} km</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Ramadan</p>
            <p className="text-sm font-medium flex items-center justify-center gap-1">
              <Moon className="h-4 w-4" />
              Feb 19 - Mar 19
            </p>
          </div>
        </div>

        {/* Training Schedule */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {relevantPlan.map((day, index) => (
              <div
                key={`${day.date}-${index}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  day.type === 'race' && "bg-yellow-500/10 border-yellow-500/30",
                  day.type === 'rest' && "bg-muted/30 border-muted",
                  day.type === 'workout' && "bg-card border-border hover:bg-muted/50",
                  isToday(parseISO(day.date)) && "ring-2 ring-primary",
                  isRamadanPeriod(day.date) && "border-l-4 border-l-purple-500"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(parseISO(day.date), 'EEE')}
                    </p>
                    <p className="font-semibold">
                      {format(parseISO(day.date), 'MMM d')}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{day.activity}</p>
                      {isRamadanPeriod(day.date) && (
                        <Moon className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{day.details}</p>
                  </div>
                </div>

                {getStatusBadge(day)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
