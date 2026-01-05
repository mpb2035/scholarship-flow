import { TrendingUp, TrendingDown, Minus, Trophy, AlertTriangle, Globe, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executiveSummary } from "@/data/gtciData";

export function GTCIExecutiveDashboard() {
  const {
    overallRank2025,
    overallRank2023,
    totalCountries,
    overallScore2025,
    overallScore2023,
    scoreChange,
    rankChange,
    incomeGroupAvg,
    topStrength,
    criticalWeakness,
    keyNarrative,
  } = executiveSummary;

  const gapFromAvg = overallScore2025 - incomeGroupAvg;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Card 1: The Big Stat */}
      <Card className="border-l-4 border-l-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-lg">🎯</span> Overall Rank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">#{overallRank2025}</span>
            <span className="text-muted-foreground">/ {totalCountries}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">2023: #{overallRank2023}</div>
          <div
            className={`flex items-center gap-1 mt-1 text-sm ${
              rankChange > 0 ? "text-green-600" : rankChange < 0 ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            {rankChange > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : rankChange < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            {rankChange > 0 ? "+" : ""}
            {rankChange} positions (Minor slip)
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Status: HIGH INCOME GROUP</div>
        </CardContent>
      </Card>

      {/* Card 2: The Score */}
      <Card className={`border-l-4 ${scoreChange >= 0 ? "border-l-green-500" : "border-l-red-500"}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-lg">📊</span> Overall Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{overallScore2025}</span>
            <span className="text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">2023: {overallScore2023}</div>
          <div
            className={`flex items-center gap-1 mt-1 text-sm ${scoreChange >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {scoreChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {scoreChange >= 0 ? "+" : ""}
            {scoreChange.toFixed(2)} points
          </div>
          <div className="mt-2 text-xs text-red-600">
            Income Avg: {incomeGroupAvg} (BELOW by {gapFromAvg.toFixed(2)}pts)
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Top Strength */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-600" /> Top Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-green-700">{topStrength.name}</div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm">🎖️ Rank: #{topStrength.rank}</span>
            <span className="text-sm">📈 Score: {topStrength.score}</span>
          </div>
          <div className="mt-3 space-y-1">
            {topStrength.highlights.map((h, i) => (
              <div key={i} className="text-xs text-muted-foreground">
                • {h}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Critical Weakness */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" /> Critical Weakness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-red-700">{criticalWeakness.name}</div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm">🔴 Rank: #{criticalWeakness.rank}</span>
            <span className="text-sm">Score: {criticalWeakness.score}</span>
          </div>
          <div className="mt-3 space-y-1">
            {criticalWeakness.issues.map((issue, i) => (
              <div key={i} className="text-xs text-red-600">
                • {issue}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card 5: Regional Context */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" /> Regional Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">ASEAN Rank Position: Tier 2</div>
          <div className="text-sm text-muted-foreground">(Below Singapore, Above Malaysia)</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="text-red-600">
              High-Income Group: BELOW average by {Math.abs(gapFromAvg).toFixed(2)} pts
            </div>
            <div className="text-muted-foreground">Need: +8.5 pts to match income group median</div>
          </div>
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            <div>Benchmark: Singapore (GTCI #1, 73.29)</div>
            <div>Malaysia (GTCI #46, 50.20)</div>
          </div>
        </CardContent>
      </Card>

      {/* Card 6: Key Narrative */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600" /> Key Narrative
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium mb-2">Why the Rank Shifted:</div>
          <div className="space-y-3">
            {keyNarrative.map((text, i) => (
              <div key={i} className="text-sm text-muted-foreground">
                {i + 1}. {text}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
