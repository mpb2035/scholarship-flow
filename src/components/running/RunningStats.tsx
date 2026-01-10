import { Card, CardContent } from '@/components/ui/card';
import { Activity, Timer, Route, Flame, TrendingUp, Award } from 'lucide-react';
import { RunningLog } from '@/hooks/useRunningLogs';
import { goalInfo } from '@/data/trainingPlanData';
import { differenceInDays, parseISO } from 'date-fns';

interface RunningStatsProps {
  logs: RunningLog[];
  stats: {
    totalDistance: number;
    totalRuns: number;
    averagePace: number;
    longestRun: number;
  };
}

export function RunningStats({ logs, stats }: RunningStatsProps) {
  const daysToRace = differenceInDays(parseISO(goalInfo.raceDate), new Date());
  const targetPaceMinutes = 5 + (41 / 60); // 5:41 = 5.68 min/km
  
  // Calculate this week's distance
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  const thisWeekDistance = logs
    .filter(log => new Date(log.date) >= weekStart)
    .reduce((acc, log) => acc + log.distance, 0);

  // Calculate pace improvement (compare first 5 runs to last 5 runs)
  const sortedByDate = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first5Pace = sortedByDate.slice(0, 5).reduce((acc, log) => acc + (log.pace_per_km || 0), 0) / Math.min(5, sortedByDate.length);
  const last5Pace = sortedByDate.slice(-5).reduce((acc, log) => acc + (log.pace_per_km || 0), 0) / Math.min(5, sortedByDate.length);
  const paceImprovement = first5Pace > 0 && last5Pace > 0 ? first5Pace - last5Pace : 0;

  // Format pace as MM:SS
  const formatPace = (paceMinutes: number) => {
    if (!paceMinutes || paceMinutes <= 0) return '--:--';
    const mins = Math.floor(paceMinutes);
    const secs = Math.round((paceMinutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress toward goal
  const paceProgress = stats.averagePace > 0 
    ? Math.min(100, (targetPaceMinutes / stats.averagePace) * 100)
    : 0;

  const statCards = [
    {
      title: 'Total Distance',
      value: `${stats.totalDistance.toFixed(1)} km`,
      icon: Route,
      color: 'text-blue-500',
      bgColor: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Total Runs',
      value: stats.totalRuns.toString(),
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'from-green-500/10 to-green-600/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Average Pace',
      value: formatPace(stats.averagePace),
      subtitle: `Target: ${goalInfo.targetPace}`,
      icon: Timer,
      color: stats.averagePace <= targetPaceMinutes ? 'text-green-500' : 'text-orange-500',
      bgColor: stats.averagePace <= targetPaceMinutes ? 'from-green-500/10 to-green-600/10' : 'from-orange-500/10 to-orange-600/10',
      borderColor: stats.averagePace <= targetPaceMinutes ? 'border-green-500/20' : 'border-orange-500/20',
    },
    {
      title: 'Longest Run',
      value: `${stats.longestRun.toFixed(1)} km`,
      subtitle: 'Goal: 21.1 km',
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'from-purple-500/10 to-purple-600/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'This Week',
      value: `${thisWeekDistance.toFixed(1)} km`,
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'from-red-500/10 to-red-600/10',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Pace Progress',
      value: `${paceProgress.toFixed(0)}%`,
      subtitle: paceImprovement > 0 ? `↑ ${paceImprovement.toFixed(2)} min faster` : 'Keep training!',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'from-primary/10 to-primary/5',
      borderColor: 'border-primary/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((card) => (
        <Card 
          key={card.title} 
          className={`bg-gradient-to-br ${card.bgColor} ${card.borderColor} border`}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`h-5 w-5 ${card.color}`} />
                <span className="text-xs text-muted-foreground font-medium">
                  {card.title}
                </span>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
