import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trainingPlan, goalInfo, phaseInfo, TrainingDay, TrainingPhase } from '@/data/trainingPlanData';
import { format, parseISO, isAfter, isBefore, isToday, differenceInDays } from 'date-fns';
import { Calendar, Trophy, Moon, CheckCircle2, Circle, Filter, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrainingDayExpanded } from './TrainingDayExpanded';
import { RunningLogInput } from '@/hooks/useRunningLogs';

interface TrainingPlanViewProps {
  completedTrainingDates?: Set<string>;
  onLogRun?: (data: RunningLogInput) => Promise<unknown>;
}

export function TrainingPlanView({ completedTrainingDates = new Set(), onLogRun }: TrainingPlanViewProps) {
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const today = new Date();
  const ramadanStart = parseISO(goalInfo.ramadanStart);
  const ramadanEnd = parseISO(goalInfo.ramadanEnd);

  const getStatusBadge = (day: TrainingDay) => {
    const date = parseISO(day.date);
    const isCompleted = completedTrainingDates.has(day.date);

    if (isCompleted) {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Done
        </Badge>
      );
    }
    if (day.type === 'race') {
      return <Badge className="bg-yellow-500 text-yellow-950">🏁 Race</Badge>;
    }
    if (isToday(date)) {
      return <Badge className="bg-primary text-primary-foreground">Today</Badge>;
    }
    if (isBefore(date, today) && day.type !== 'rest') {
      return <Badge variant="outline" className="text-muted-foreground">Missed</Badge>;
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

  const phaseStats = useMemo(() => {
    const phases = Object.keys(phaseInfo) as TrainingPhase[];
    return phases.map(phase => {
      const phaseDays = trainingPlan.filter(d => d.phase === phase);
      const workoutDays = phaseDays.filter(d => d.type !== 'rest');
      const pastWorkouts = workoutDays.filter(d => isBefore(parseISO(d.date), today));
      const completed = pastWorkouts.filter(d => completedTrainingDates.has(d.date)).length;
      const rate = pastWorkouts.length > 0 ? Math.round((completed / pastWorkouts.length) * 100) : 0;
      const isActive = phaseDays.some(d => {
        const date = parseISO(d.date);
        const diff = differenceInDays(date, today);
        return diff >= -3 && diff <= 3;
      });
      return { phase, total: workoutDays.length, completed, pastTotal: pastWorkouts.length, rate, isActive };
    });
  }, [completedTrainingDates]);

  const filteredPlan = useMemo(() => {
    let plan = trainingPlan;
    if (phaseFilter !== 'all') {
      plan = plan.filter(d => d.phase === phaseFilter);
    }
    return plan;
  }, [phaseFilter]);

  const overallStats = useMemo(() => {
    const pastWorkouts = trainingPlan.filter(d => isBefore(parseISO(d.date), today) && d.type !== 'rest');
    const completed = pastWorkouts.filter(d => completedTrainingDates.has(d.date)).length;
    const rate = pastWorkouts.length > 0 ? Math.round((completed / pastWorkouts.length) * 100) : 0;
    const totalWorkouts = trainingPlan.filter(d => d.type !== 'rest').length;
    return { completed, missed: pastWorkouts.length - completed, rate, totalWorkouts, pastTotal: pastWorkouts.length };
  }, [completedTrainingDates]);

  const handleRowClick = (day: TrainingDay) => {
    if (day.type === 'rest') return;
    if (completedTrainingDates.has(day.date)) return;
    setExpandedDate(prev => prev === day.date ? null : day.date);
  };

  return (
    <div className="space-y-6">
      {/* Scorecard */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Training Progress Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Adherence</span>
            <span className={cn("text-sm font-bold",
              overallStats.rate >= 80 ? "text-green-500" : overallStats.rate >= 50 ? "text-yellow-500" : "text-destructive"
            )}>{overallStats.rate}%</span>
          </div>
          <Progress value={overallStats.rate} className="h-3 mb-4" />
          <div className="flex justify-between text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />{overallStats.completed} completed</span>
            <span>{overallStats.pastTotal} past workouts</span>
            <span>{overallStats.totalWorkouts} total workouts</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {phaseStats.map(ps => (
              <div
                key={ps.phase}
                className={cn(
                  "p-3 rounded-lg border text-center cursor-pointer transition-all hover:scale-105",
                  phaseInfo[ps.phase].color,
                  ps.isActive && "ring-2 ring-primary"
                )}
                onClick={() => setPhaseFilter(ps.phase === phaseFilter ? 'all' : ps.phase)}
              >
                <p className="text-xs font-medium truncate">{phaseInfo[ps.phase].label}</p>
                <p className="text-lg font-bold mt-1">{ps.rate}%</p>
                <p className="text-xs opacity-70">{ps.completed}/{ps.pastTotal > 0 ? ps.pastTotal : ps.total}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Plan */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Day-by-Day Training Plan
              {onLogRun && <span className="text-xs font-normal text-muted-foreground ml-2">Click a workout to log</span>}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-500 text-white">
                <Trophy className="h-3 w-3 mr-1" />
                Oct 27, 2026
              </Badge>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-3 w-3 mr-2" />
                  <SelectValue placeholder="Filter phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  {(Object.keys(phaseInfo) as TrainingPhase[]).map(phase => (
                    <SelectItem key={phase} value={phase}>{phaseInfo[phase].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-1.5">
              {filteredPlan.map((day, index) => {
                const isCompleted = completedTrainingDates.has(day.date);
                const isExpanded = expandedDate === day.date;
                return (
                  <div key={`${day.date}-${index}`} className="space-y-0">
                    <div
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        isCompleted && "bg-green-500/10 border-green-500/30",
                        !isCompleted && day.type === 'race' && "bg-yellow-500/10 border-yellow-500/30",
                        !isCompleted && day.type === 'rest' && "bg-muted/30 border-muted",
                        !isCompleted && day.type === 'workout' && "bg-card border-border hover:bg-muted/50",
                        isToday(parseISO(day.date)) && "ring-2 ring-primary",
                        isRamadanPeriod(day.date) && "border-l-4 border-l-purple-500",
                        onLogRun && !isCompleted && day.type !== 'rest' && "cursor-pointer"
                      )}
                      onClick={() => onLogRun && handleRowClick(day)}
                    >
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className={cn("h-5 w-5",
                            isBefore(parseISO(day.date), today) && day.type !== 'rest' ? "text-destructive" : "text-muted-foreground"
                          )} />
                        )}
                      </div>

                      <div className="text-center min-w-[50px]">
                        <p className="text-[10px] text-muted-foreground uppercase">{day.dayLabel}</p>
                        <p className="text-xs font-semibold">{format(parseISO(day.date), 'MMM d')}</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-sm font-medium truncate", isCompleted && "text-green-600")}>
                            {day.activity}
                          </p>
                          {isRamadanPeriod(day.date) && <Moon className="h-3 w-3 text-purple-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{day.details !== 'REST' ? day.details : day.notes}</p>
                      </div>

                      <Badge variant="outline" className={cn("text-[10px] shrink-0 hidden md:inline-flex", phaseInfo[day.phase].color)}>
                        {phaseInfo[day.phase].label}
                      </Badge>

                      {getStatusBadge(day)}
                    </div>

                    {/* Expanded quick-log form */}
                    {isExpanded && onLogRun && (
                      <TrainingDayExpanded
                        day={day}
                        onSubmit={onLogRun}
                        onClose={() => setExpandedDate(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
