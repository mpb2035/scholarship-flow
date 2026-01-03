import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMatters } from '@/hooks/useMatters';
import { Matter } from '@/types/matter';
import { TimelineModal } from '@/components/dashboard/TimelineModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, History, RefreshCw, ArrowLeft } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function PendingResponse() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { matters, loading: mattersLoading, refreshMatters } = useMatters();
  
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  // Filter matters with "Dept to Respond" statuses
  const pendingMatters = useMemo(() => {
    return matters.filter(
      (m) =>
        m.overallStatus === 'Dept to Respond – SUT HE Query' ||
        m.overallStatus === 'Dept to Respond – Higher Up Query'
    );
  }, [matters]);

  // Calculate days pending for each matter
  const mattersWithDaysPending = useMemo(() => {
    const today = new Date();
    return pendingMatters.map((matter) => {
      // Use query issued date as the start of pending period
      const queryDate = matter.queryIssuedDate ? new Date(matter.queryIssuedDate) : new Date(matter.sutheReceivedDate);
      const daysPending = differenceInDays(today, queryDate);
      return { ...matter, daysPending };
    }).sort((a, b) => b.daysPending - a.daysPending); // Sort by most days pending first
  }, [pendingMatters]);

  const handleViewTimeline = (matter: Matter) => {
    setSelectedMatter(matter);
    setTimelineOpen(true);
  };

  if (authLoading || mattersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const totalPending = mattersWithDaysPending.length;
  const sutHeQueryCount = mattersWithDaysPending.filter(m => m.overallStatus === 'Dept to Respond – SUT HE Query').length;
  const higherUpQueryCount = mattersWithDaysPending.filter(m => m.overallStatus === 'Dept to Respond – Higher Up Query').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold gold-text">Pending Department Response</h1>
            <p className="text-muted-foreground text-sm">Items awaiting department response to queries</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refreshMatters} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-mono text-primary">{totalPending}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SUT HE Query</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-mono text-amber-500">{sutHeQueryCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Higher Up Query</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-mono text-destructive">{higherUpQueryCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items Grid */}
      {mattersWithDaysPending.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No items pending department response</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mattersWithDaysPending.map((matter) => (
            <Card 
              key={matter.id} 
              className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleViewTimeline(matter)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-mono">{matter.caseId}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{matter.caseTitle}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={matter.overallStatus.includes('Higher Up') 
                      ? 'border-destructive text-destructive' 
                      : 'border-amber-500 text-amber-500'
                    }
                  >
                    {matter.overallStatus.includes('Higher Up') ? 'HU Query' : 'SUT HE Query'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Big Days Pending Display */}
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className={`text-5xl font-bold font-mono ${
                      matter.daysPending > 14 
                        ? 'text-destructive' 
                        : matter.daysPending > 7 
                          ? 'text-amber-500' 
                          : 'text-primary'
                    }`}>
                      {matter.daysPending}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Days Pending
                    </div>
                  </div>
                </div>

                {/* Warning for overdue */}
                {matter.daysPending > 14 && (
                  <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded px-2 py-1 mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Overdue - exceeds 14 days SLA</span>
                  </div>
                )}

                {/* View Timeline Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewTimeline(matter);
                  }}
                >
                  <History className="h-4 w-4" />
                  View Timeline
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Timeline Modal */}
      <TimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        matter={selectedMatter}
      />
    </div>
  );
}
