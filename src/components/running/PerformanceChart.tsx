import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar } from 'recharts';
import { RunningLog } from '@/hooks/useRunningLogs';
import { trainingPlan, goalInfo } from '@/data/trainingPlanData';
import { format, parseISO, differenceInDays, isBefore } from 'date-fns';
import { TrendingUp, Target, Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface PerformanceChartProps {
  logs: RunningLog[];
  completedTrainingDates?: Set<string>;
}

export function PerformanceChart({ logs, completedTrainingDates = new Set() }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    // Combine actual runs with planned runs from training plan
    const actualByDate = new Map<string, RunningLog>();
    logs.forEach(log => {
      actualByDate.set(log.date, log);
    });

    // Get planned distances from training plan
    const plannedByDate = new Map<string, number>();
    trainingPlan.forEach(day => {
      // Extract distance from details (rough parsing)
      const match = day.details.match(/(\d+(?:\.\d+)?)\s*km/);
      if (match) {
        plannedByDate.set(day.date, parseFloat(match[1]));
      }
    });

    // Create combined data for last 90 days
    const today = new Date();
    const data: Array<{
      date: string;
      displayDate: string;
      actual: number | null;
      planned: number | null;
      pace: number | null;
    }> = [];

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const actualLog = actualByDate.get(dateStr);
      const plannedDistance = plannedByDate.get(dateStr);

      data.push({
        date: dateStr,
        displayDate: format(date, 'MMM d'),
        actual: actualLog?.distance || null,
        planned: plannedDistance || null,
        pace: actualLog?.pace_per_km || null,
      });
    }

    return data;
  }, [logs]);

  const weeklyData = useMemo(() => {
    // Group by week
    const weeks = new Map<string, { distance: number; runs: number }>();
    
    logs.forEach(log => {
      const date = parseISO(log.date);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = format(weekStart, 'MMM d');
      
      const existing = weeks.get(weekKey) || { distance: 0, runs: 0 };
      weeks.set(weekKey, {
        distance: existing.distance + log.distance,
        runs: existing.runs + 1,
      });
    });

    return Array.from(weeks.entries())
      .map(([week, data]) => ({ week, ...data }))
      .slice(-12);
  }, [logs]);

  const daysToRace = differenceInDays(parseISO(goalInfo.raceDate), new Date());

  // Calculate training plan adherence
  const trainingStats = useMemo(() => {
    const today = new Date();
    const pastWorkouts = trainingPlan.filter(day => {
      const date = parseISO(day.date);
      return isBefore(date, today) && day.type !== 'rest';
    });
    const completedCount = pastWorkouts.filter(day => completedTrainingDates.has(day.date)).length;
    const missedCount = pastWorkouts.length - completedCount;
    const completionRate = pastWorkouts.length > 0 
      ? Math.round((completedCount / pastWorkouts.length) * 100) 
      : 0;
    
    // Upcoming workouts this week
    const upcomingThisWeek = trainingPlan.filter(day => {
      const date = parseISO(day.date);
      const daysAhead = differenceInDays(date, today);
      return daysAhead >= 0 && daysAhead <= 7 && day.type !== 'rest';
    }).length;

    return { completedCount, missedCount, completionRate, upcomingThisWeek, totalPast: pastWorkouts.length };
  }, [completedTrainingDates]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Days to Race</p>
                <p className="text-2xl font-bold text-orange-500">{daysToRace}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Target Pace</p>
                <p className="text-2xl font-bold text-primary">{goalInfo.targetPace}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Race Date</p>
                <p className="text-2xl font-bold text-green-500">Nov 1, 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Plan Adherence Card */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Plan Adherence</p>
                <Badge 
                  variant="outline" 
                  className={
                    trainingStats.completionRate >= 80 
                      ? "bg-green-500/10 text-green-600 border-green-500/30" 
                      : trainingStats.completionRate >= 50 
                        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                        : "bg-red-500/10 text-red-600 border-red-500/30"
                  }
                >
                  {trainingStats.completionRate}%
                </Badge>
              </div>
              <Progress value={trainingStats.completionRate} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  {trainingStats.completedCount} completed
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-3 w-3" />
                  {trainingStats.missedCount} missed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distance Chart - Actual vs Planned */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distance: Actual vs Planned (Last 90 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="planned"
                  stroke="hsl(var(--muted-foreground))"
                  fill="url(#plannedGradient)"
                  strokeDasharray="5 5"
                  name="Planned (km)"
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  fill="url(#actualGradient)"
                  name="Actual (km)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Volume */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Running Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'distance' ? `${value.toFixed(1)} km` : value,
                    name === 'distance' ? 'Total Distance' : 'Runs'
                  ]}
                />
                <Bar dataKey="distance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Distance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pace Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pace Trend (min/km)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.filter(d => d.pace !== null)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} />
                <YAxis 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} min/km`, 'Pace']}
                />
                {/* Target pace line */}
                <Line
                  type="monotone"
                  dataKey={() => 5.68}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target (5:41/km)"
                />
                <Line
                  type="monotone"
                  dataKey="pace"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  name="Actual Pace"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
