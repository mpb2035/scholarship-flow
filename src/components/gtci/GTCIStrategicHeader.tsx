import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, Target, Globe2, Award } from 'lucide-react';
import type { GTCIStrategicAnalysis } from '@/types/gtciAnalysis';

interface GTCIStrategicHeaderProps {
  data: GTCIStrategicAnalysis;
  editable: boolean;
  onUpdate: (key: keyof GTCIStrategicAnalysis, value: GTCIStrategicAnalysis[keyof GTCIStrategicAnalysis]) => void;
}

export function GTCIStrategicHeader({ data, editable, onUpdate }: GTCIStrategicHeaderProps) {
  const updateExecutiveSummary = (key: keyof GTCIStrategicAnalysis['executive_summary'], value: string | number) => {
    onUpdate('executive_summary', {
      ...data.executive_summary,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="text-center space-y-2 pb-6 border-b">
        <h1 className="text-3xl font-bold tracking-tight">
          GLOBAL TALENT COMPETITIVENESS INDEX (GTCI) STRATEGIC ANALYSIS
        </h1>
        <h2 className="text-xl text-muted-foreground">BRUNEI DARUSSALAM 2026-2030</h2>
        
        <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Prepared for:</span>{' '}
            {editable ? (
              <Input
                value={data.metadata.preparedFor}
                onChange={(e) => onUpdate('metadata', { ...data.metadata, preparedFor: e.target.value })}
                className="inline-block w-auto h-6 text-sm"
              />
            ) : (
              data.metadata.preparedFor
            )}
          </div>
          <div>
            <span className="font-medium">Date:</span>{' '}
            {editable ? (
              <Input
                value={data.metadata.date}
                onChange={(e) => onUpdate('metadata', { ...data.metadata, date: e.target.value })}
                className="inline-block w-32 h-6 text-sm"
              />
            ) : (
              data.metadata.date
            )}
          </div>
        </div>
        
        <Badge variant="outline" className="mt-2">
          {data.metadata.classification}
        </Badge>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-primary" />
              GTCI Global Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editable ? (
              <Input
                type="number"
                value={data.executive_summary.currentRank}
                onChange={(e) => updateExecutiveSummary('currentRank', parseInt(e.target.value) || 0)}
                className="text-3xl font-bold h-12 w-20"
              />
            ) : (
              <div className="text-3xl font-bold text-primary">#{data.executive_summary.currentRank}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">2022-2023</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editable ? (
              <Input
                type="number"
                step="0.1"
                value={data.executive_summary.currentScore}
                onChange={(e) => updateExecutiveSummary('currentScore', parseFloat(e.target.value) || 0)}
                className="text-3xl font-bold h-12 w-24"
              />
            ) : (
              <div className="text-3xl font-bold text-blue-500">{data.executive_summary.currentScore}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">on 100-point scale</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Regional Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editable ? (
              <Input
                value={data.executive_summary.regionalRank}
                onChange={(e) => updateExecutiveSummary('regionalRank', e.target.value)}
                className="text-sm h-8"
              />
            ) : (
              <div className="text-sm font-medium">{data.executive_summary.regionalRank}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Strategic Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editable ? (
              <Input
                value={data.executive_summary.strategicTarget}
                onChange={(e) => updateExecutiveSummary('strategicTarget', e.target.value)}
                className="text-sm h-8"
              />
            ) : (
              <div className="text-sm font-medium">{data.executive_summary.strategicTarget}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
