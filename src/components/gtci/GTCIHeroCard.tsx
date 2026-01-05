import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { executiveSummary } from '@/data/gtciData';

export function GTCIHeroCard() {
  const { overallRank2025, overallScore2025, totalCountries, rankChange, scoreChange } = executiveSummary;
  
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden">
      <CardContent className="p-8 text-center">
        <div className="mb-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Global Talent Competitiveness Index 2025
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Brunei Darussalam
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Strategic Analysis, Performance Gaps & Policy Recommendations
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Rank Badge */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary-foreground">#{overallRank2025}</span>
                  <span className="text-sm text-primary-foreground/80 block">/ {totalCountries}</span>
                </div>
              </div>
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                rankChange > 0 ? 'bg-green-500/20 text-green-700' : 
                rankChange < 0 ? 'bg-red-500/20 text-red-700' : 'bg-muted text-muted-foreground'
              }`}>
                {rankChange > 0 ? <TrendingUp className="h-3 w-3" /> : 
                 rankChange < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {rankChange > 0 ? '+' : ''}{rankChange} positions
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-4">Overall Rank</span>
          </div>
          
          {/* Score */}
          <div className="flex flex-col items-center">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <span className="text-3xl font-bold text-foreground">{overallScore2025}</span>
              <span className="text-lg text-muted-foreground"> / 100</span>
              <div className={`flex items-center justify-center gap-1 mt-2 text-sm ${
                scoreChange > 0 ? 'text-green-600' : 
                scoreChange < 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {scoreChange > 0 ? <TrendingUp className="h-4 w-4" /> : 
                 scoreChange < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(2)} pts
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2">GTCI Score</span>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <span className="font-medium">Income Group:</span> High Income | 
          <span className="font-medium ml-2">Region:</span> Eastern, SE Asia & Oceania
        </div>
      </CardContent>
    </Card>
  );
}
