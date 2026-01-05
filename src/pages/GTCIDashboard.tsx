import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GTCIHeroCard } from '@/components/gtci/GTCIHeroCard';
import { GTCIExecutiveDashboard } from '@/components/gtci/GTCIExecutiveDashboard';
import { GTCIPillarCard } from '@/components/gtci/GTCIPillarCard';
import { GTCIDataGapsTable } from '@/components/gtci/GTCIDataGapsTable';
import { GTCIPolicyPriorities } from '@/components/gtci/GTCIPolicyPriorities';
import { pillars } from '@/data/gtciData';
import { LayoutDashboard, Layers, AlertCircle, Target } from 'lucide-react';

export default function GTCIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Hero Section */}
        <GTCIHeroCard />

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Executive Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="pillars" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">6 Pillars Deep Dive</span>
              <span className="sm:hidden">Pillars</span>
            </TabsTrigger>
            <TabsTrigger value="gaps" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Data Gaps & Reporting</span>
              <span className="sm:hidden">Gaps</span>
            </TabsTrigger>
            <TabsTrigger value="action" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Policy & Targets</span>
              <span className="sm:hidden">Action</span>
            </TabsTrigger>
          </TabsList>

          {/* Executive Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Executive Dashboard (Macro View)</h2>
              <p className="text-muted-foreground mb-6">
                A comprehensive overview of Brunei's GTCI 2025 performance compared to 2023.
              </p>
              <GTCIExecutiveDashboard />
            </div>
          </TabsContent>

          {/* Pillars Deep Dive Tab */}
          <TabsContent value="pillars" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">The 6 Pillars Deep Dive (77 Indicators)</h2>
              <p className="text-muted-foreground mb-6">
                Detailed analysis of each pillar with all sub-indicators, strategic priorities, and data gaps.
                Click on each pillar to expand and see the full breakdown.
              </p>
              
              <div className="grid gap-4">
                {pillars.map((pillar) => (
                  <GTCIPillarCard key={pillar.id} pillar={pillar} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Data Gaps Tab */}
          <TabsContent value="gaps" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Critical Data Gaps & Reporting Strategy</h2>
              <p className="text-muted-foreground mb-6">
                Address the "n/a" and missing data points that hurt the ranking, with a clear governance 
                structure and timeline for data submission.
              </p>
              <GTCIDataGapsTable />
            </div>
          </TabsContent>

          {/* Policy & Targets Tab */}
          <TabsContent value="action" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Summary & Call to Action</h2>
              <p className="text-muted-foreground mb-6">
                Top 3 Policy priorities for Wawasan 2035 alignment, National Competitiveness Taskforce 
                structure, and realistic rank targets for GTCI 2027 and 2030.
              </p>
              <GTCIPolicyPriorities />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
