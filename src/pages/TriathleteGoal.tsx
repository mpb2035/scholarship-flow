import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRunningLogs } from '@/hooks/useRunningLogs';
import { RunLogForm } from '@/components/running/RunLogForm';
import { PerformanceChart } from '@/components/running/PerformanceChart';
import { TrainingPlanView } from '@/components/running/TrainingPlanView';
import { RunningStats } from '@/components/running/RunningStats';
import { RunLogTable } from '@/components/running/RunLogTable';
import { HeartRateTrendChart } from '@/components/running/HeartRateTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Activity, Calendar, BarChart3, Trophy, Heart } from 'lucide-react';
import { goalInfo } from '@/data/trainingPlanData';
import { differenceInDays, parseISO } from 'date-fns';

export default function TriathleteGoal() {
  const { logs, isLoading, addLog, deleteLog, stats, completedTrainingDates } = useRunningLogs();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const daysToRace = differenceInDays(parseISO(goalInfo.raceDate), new Date());
  const raceDisplayDate = 'October 27, 2026';

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="px-3 sm:container sm:mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="sm:hidden">Sub-2 Half Marathon</span>
            <span className="hidden sm:inline">Triathlete Goal: Sub-2 Hour Half Marathon</span>
          </h1>
           <p className="text-sm text-muted-foreground mt-1">
            Track your training toward {raceDisplayDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border-primary/30">
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            {daysToRace} days to race
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <RunningStats logs={logs} stats={stats} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 sm:grid sm:grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Log Run
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="heartrate" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              HR
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <PerformanceChart logs={logs} completedTrainingDates={completedTrainingDates} />
        </TabsContent>

        <TabsContent value="log" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <RunLogForm onSubmit={addLog} completedTrainingDates={completedTrainingDates} />
            
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Quick Tips for Sub-2 Hour
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-500 shrink-0">1</Badge>
                    <p><strong>Easy runs</strong> should feel conversational - you should be able to talk without gasping.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-orange-500 shrink-0">2</Badge>
                    <p><strong>Tempo runs</strong> at 5:30-5:40/km will build your lactate threshold.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-blue-500 shrink-0">3</Badge>
                    <p><strong>Long runs</strong> build endurance - aim for 16-20km at easy pace by peak training.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-purple-500 shrink-0">4</Badge>
                    <p><strong>Intervals</strong> at 4:50-5:00/km develop speed and VO2max.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-red-500 shrink-0">5</Badge>
                    <p><strong>Rest</strong> is when adaptation happens - don't skip recovery days!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <RunLogTable logs={logs} onDelete={deleteLog} />
        </TabsContent>

        <TabsContent value="plan">
          <TrainingPlanView completedTrainingDates={completedTrainingDates} onLogRun={addLog} />
        </TabsContent>

        <TabsContent value="heartrate">
          <HeartRateTrendChart logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
