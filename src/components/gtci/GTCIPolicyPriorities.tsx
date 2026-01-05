import { Target, TrendingUp, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { policyPriorities, rankTargets } from '@/data/gtciData';

export function GTCIPolicyPriorities() {
  return (
    <div className="space-y-6">
      {/* Policy Priorities */}
      <div className="grid gap-4">
        {policyPriorities.map((priority) => (
          <Card key={priority.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2">Priority #{priority.id}</Badge>
                  <CardTitle className="text-lg">{priority.title}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Current Rank</div>
                  <div className="text-2xl font-bold">#{priority.currentRank}</div>
                  <div className="text-xs text-muted-foreground">→ Target: #{priority.targetRank}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Pillar</div>
                  <div className="text-sm text-muted-foreground mb-3">{priority.pillar}</div>
                  
                  <div className="text-sm font-medium mb-1">Issue</div>
                  <div className="text-sm text-red-600 mb-3">{priority.issue}</div>
                  
                  <div className="text-sm font-medium mb-1">🎯 Wawasan 2035 Link</div>
                  <div className="text-sm text-primary">{priority.wawasan2035Link}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Policy Actions</div>
                  <div className="space-y-1">
                    {priority.actions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {action}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <div className="text-xs text-muted-foreground">Expected Impact</div>
                    <div className="text-sm font-medium text-green-700">{priority.expectedImpact}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rank Targets */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 2027 Target */}
        <Card className="bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              GTCI 2027 Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-primary">#{rankTargets.target2027.overallRank}</div>
              <div className="text-sm text-muted-foreground">
                from #43 (improving by 8 positions)
              </div>
              <div className="mt-2 text-lg">
                Expected Score: <span className="font-bold">{rankTargets.target2027.overallScore}</span> / 100
              </div>
            </div>
            
            <div className="space-y-3">
              {rankTargets.target2027.pillars.map((pillar) => {
                const improvement = pillar.current - pillar.target;
                const progress = ((pillar.current - pillar.target) / pillar.current) * 100;
                return (
                  <div key={pillar.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{pillar.name}</span>
                      <span className="font-mono">
                        #{pillar.current} → #{pillar.target}
                        <span className="text-green-600 ml-2">(+{improvement})</span>
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2030 Vision */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Long-Term Vision: GTCI 2030
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-amber-600">#{rankTargets.target2030.overallRank}</div>
              <div className="text-sm text-muted-foreground mb-2">
                {rankTargets.target2030.description}
              </div>
              <div className="text-lg">
                Target Score: <span className="font-bold">{rankTargets.target2030.overallScore}+</span> / 100
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 text-sm">
              <div className="font-medium mb-2">This requires:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Sustained funding of 3 priorities above</li>
                <li>• Regional coordination (attract ASEAN talent)</li>
                <li>• Continued political commitment</li>
                <li>• All pillars #35 or better</li>
                <li>• Brunei as "Top-Tier Asian Talent Hub"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Takeaways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 Key Takeaways for Decision-Makers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Brunei's Paradox",
                content: "Rank #43 globally masks internal imbalances. STRENGTH: Pension/Stability (#39 RETAIN), Digital Skills (#1 global). CRISIS: Innovation/Startups (#50 GA SKILLS), Skills Hiring (#119 VT SKILLS)"
              },
              {
                title: "Actionable Insight",
                content: "The economy is STABLE but STAGNANT. Cannot attract foreign talent (migrant stock down -29.34 pts). Cannot generate innovation (new business density = 0.00). Cannot hire skilled workers."
              },
              {
                title: "Win-Win Alignment",
                content: "3 Policy Priorities align with Wawasan 2035 diversification: Digital Entrepreneurship = economic non-oil growth. Skills Alignment = full employment. Higher Education = knowledge-based economy."
              },
              {
                title: "Next Steps",
                content: "Form National Competitiveness Taskforce by January 2026. Assign data collection leads immediately. Prepare policy blueprints for Cabinet by March 2026. Launch pilot programs by Q2 2026."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-muted/50 rounded-lg p-4">
                <div className="font-medium mb-2">{idx + 1}. {item.title}</div>
                <div className="text-sm text-muted-foreground">{item.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
