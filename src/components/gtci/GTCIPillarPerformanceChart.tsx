import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import type { PillarPerformance } from '@/types/gtciAnalysis';

interface GTCIPillarPerformanceChartProps {
  pillars: PillarPerformance[];
}

export function GTCIPillarPerformanceChart({ pillars }: GTCIPillarPerformanceChartProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'STRONG':
      case 'COMPETITIVE':
        return 'hsl(var(--chart-2))';
      case 'MODERATE':
        return 'hsl(var(--chart-4))';
      case 'WEAK':
        return 'hsl(var(--chart-3))';
      case 'CRITICAL':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toUpperCase()) {
      case 'STRONG':
      case 'COMPETITIVE':
        return 'default';
      case 'MODERATE':
        return 'secondary';
      case 'WEAK':
      case 'CRITICAL':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const radarData = pillars.map(p => ({
    pillar: p.pillar.replace(' ', '\n'),
    score: p.score,
    fullMark: 100
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance by Pillar (Score)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pillars} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis 
                type="category" 
                dataKey="pillar" 
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}`, 'Score']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {pillars.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competitiveness Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card className="lg:col-span-2">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {pillars.map((pillar) => (
              <div key={pillar.pillar} className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="text-sm font-medium">{pillar.pillar}</div>
                <Badge variant={getStatusBadgeVariant(pillar.status)}>
                  {pillar.status}
                </Badge>
                <span className="text-muted-foreground text-sm">Rank #{pillar.rank}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
