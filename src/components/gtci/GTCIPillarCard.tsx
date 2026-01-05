import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pillar, Indicator } from '@/data/gtciData';

interface GTCIPillarCardProps {
  pillar: Pillar;
}

function getStatusColor(status: Indicator['status']) {
  switch (status) {
    case 'improved': return 'text-green-600 bg-green-50';
    case 'declined': return 'text-red-600 bg-red-50';
    case 'stable': return 'text-muted-foreground bg-muted';
    case 'missing': return 'text-orange-600 bg-orange-50';
    case 'new': return 'text-blue-600 bg-blue-50';
    default: return 'text-muted-foreground bg-muted';
  }
}

function getStatusIcon(status: Indicator['status']) {
  switch (status) {
    case 'improved': return <TrendingUp className="h-3 w-3" />;
    case 'declined': return <TrendingDown className="h-3 w-3" />;
    case 'stable': return <Minus className="h-3 w-3" />;
    case 'missing': return <AlertCircle className="h-3 w-3" />;
    case 'new': return <CheckCircle className="h-3 w-3" />;
    default: return <Minus className="h-3 w-3" />;
  }
}

function getStatusLabel(status: Indicator['status']) {
  switch (status) {
    case 'improved': return 'IMPROVED';
    case 'declined': return 'DECLINED';
    case 'stable': return 'STABLE';
    case 'missing': return 'DATA GAP';
    case 'new': return 'NEW DATA';
    default: return 'N/A';
  }
}

export function GTCIPillarCard({ pillar }: GTCIPillarCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const borderColor = pillar.status === 'improved' ? 'border-l-green-500' : 
                      pillar.status === 'declined' ? 'border-l-red-500' : 'border-l-muted';

  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{pillar.icon}</span>
              <div>
                <CardTitle className="text-lg">{pillar.name}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {pillar.responsibleAgencies.slice(0, 2).join(', ')}
                  {pillar.responsibleAgencies.length > 2 && ` +${pillar.responsibleAgencies.length - 2} more`}
                </div>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CardContent>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">2025 Rank</div>
              <div className="text-lg font-bold">#{pillar.rank2025}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">2023 Rank</div>
              <div className="text-lg font-bold">#{pillar.rank2023}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Score</div>
              <div className="text-lg font-bold">{pillar.score2025.toFixed(2)}</div>
            </div>
            <div className={`text-center p-2 rounded-lg ${
              pillar.rankChange > 0 ? 'bg-green-50' : pillar.rankChange < 0 ? 'bg-red-50' : 'bg-muted/50'
            }`}>
              <div className="text-xs text-muted-foreground">Change</div>
              <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                pillar.rankChange > 0 ? 'text-green-600' : pillar.rankChange < 0 ? 'text-red-600' : ''
              }`}>
                {pillar.rankChange > 0 ? <TrendingUp className="h-4 w-4" /> : 
                 pillar.rankChange < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {pillar.rankChange > 0 ? '+' : ''}{pillar.rankChange}
              </div>
            </div>
          </div>

          <CollapsibleContent className="space-y-4">
            {/* Sub-Pillars and Indicators */}
            {pillar.subPillars.map((subPillar) => (
              <div key={subPillar.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{subPillar.name}</h4>
                  <Badge variant="outline">Score: {subPillar.score2025.toFixed(2)}</Badge>
                </div>
                
                <div className="space-y-2">
                  {subPillar.indicators.map((indicator) => (
                    <div 
                      key={indicator.id}
                      className={`flex items-center justify-between p-2 rounded-md text-xs ${getStatusColor(indicator.status)}`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-mono text-muted-foreground">{indicator.id}</span>
                        <span className="truncate">{indicator.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {indicator.score2023 !== null && indicator.score2025 !== null && (
                          <span className="text-muted-foreground">
                            {indicator.score2023.toFixed(1)} → {indicator.score2025.toFixed(1)}
                          </span>
                        )}
                        {indicator.change !== null && (
                          <span className={indicator.change > 0 ? 'text-green-600' : indicator.change < 0 ? 'text-red-600' : ''}>
                            {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}
                          </span>
                        )}
                        {indicator.rank2025 && (
                          <Badge variant="secondary" className="text-xs">
                            #{indicator.rank2025}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {getStatusIcon(indicator.status)}
                          <span className="font-medium">{getStatusLabel(indicator.status)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Priorities */}
            {pillar.priorities.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Strategic Priorities
                </h4>
                <div className="grid gap-3">
                  {pillar.priorities.map((priority, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="font-medium text-sm text-red-800 mb-2">🎯 {priority.title}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div><span className="text-muted-foreground">Score:</span> {priority.score}</div>
                        <div><span className="text-muted-foreground">Rank:</span> {priority.rank}</div>
                        <div className="col-span-2 text-red-600">{priority.decline}</div>
                      </div>
                      <div className="space-y-1 text-xs">
                        {priority.actions.map((action, i) => (
                          <div key={i} className="text-muted-foreground">→ {action}</div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs font-medium text-primary">
                        Target: {priority.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Gaps */}
            {pillar.dataGaps.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Data Gaps Requiring Action
                </h4>
                <div className="space-y-2">
                  {pillar.dataGaps.map((gap, idx) => (
                    <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs">
                      <div className="font-medium text-orange-800">{gap.indicator}</div>
                      <div className="grid grid-cols-2 gap-1 mt-1 text-muted-foreground">
                        <div>Source: {gap.source}</div>
                        <div>Owner: {gap.localOwner}</div>
                        <div className="col-span-2">Action: {gap.action}</div>
                        <div className="col-span-2 text-orange-600">Deadline: {gap.deadline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
