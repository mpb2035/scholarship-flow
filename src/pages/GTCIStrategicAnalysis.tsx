import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Save, 
  RotateCcw, 
  FileText, 
  LayoutDashboard, 
  AlertCircle, 
  Building2, 
  DollarSign, 
  ListTodo, 
  Target,
  Loader2,
  LogIn,
  Shield,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { useGTCIStrategicAnalysis } from '@/hooks/useGTCIStrategicAnalysis';
import { useUserRole } from '@/hooks/useUserRole';
import { GTCIStrategicHeader } from '@/components/gtci/GTCIStrategicHeader';
import { GTCIPillarPerformanceChart } from '@/components/gtci/GTCIPillarPerformanceChart';
import { GTCIIndicatorAnalysisTable } from '@/components/gtci/GTCIIndicatorAnalysisTable';
import { EditableTable } from '@/components/gtci/EditableTable';

import type { 
  PillarPerformance, 
  DataGapIndicator, 
  WEFParticipationStep, 
  MinistryGovernance, 
  FundingModelItem, 
  ImplementationPhase, 
  ExpectedOutcome 
} from '@/types/gtciAnalysis';

export default function GTCIStrategicAnalysis() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { isAdmin, loading: roleLoading } = useUserRole();
  
  // Admin-only edit mode - automatically enabled for admins
  const [editMode, setEditMode] = useState(false);
  
  const {
    data,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    isAuthenticated,
    autoSaveEnabled,
    setAutoSaveEnabled,
    updateData,
    save,
    reset
  } = useGTCIStrategicAnalysis();

  // Enable edit mode by default for admins
  useEffect(() => {
    if (isAdmin && !roleLoading) {
      setEditMode(true);
    }
  }, [isAdmin, roleLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In Required
            </CardTitle>
            <CardDescription>
              Please sign in to view and edit the GTCI Strategic Analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/auth')}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pillarColumns = [
    { key: 'pillar', header: 'Pillar', width: '30%' },
    { key: 'score', header: 'Score', type: 'number' as const },
    { key: 'rank', header: 'Rank', type: 'number' as const },
    { key: 'status', header: 'Status' }
  ];

  const dataGapColumns = [
    { key: 'indicator', header: 'Indicator', width: '35%' },
    { key: 'currentStatus', header: 'Current Status' },
    { key: 'impact', header: 'Impact' },
    { key: 'dataSource', header: 'Data Source' }
  ];

  const wefColumns = [
    { key: 'source', header: 'Source', width: '30%' },
    { key: 'targetCount', header: 'Target #' },
    { key: 'contact', header: 'Contact', width: '25%' },
    { key: 'timeline', header: 'Timeline' }
  ];

  const ministryColumns = [
    { key: 'thematicGroup', header: 'Thematic Group', width: '30%' },
    { key: 'leadMinistry', header: 'Lead Ministry' },
    { key: 'coCoordinators', header: 'Co-Coordinators', width: '25%' },
    { key: 'indicators', header: 'Indicators' }
  ];

  const fundingColumns = [
    { key: 'component', header: 'Component', width: '35%' },
    { key: 'budget', header: 'Budget (BND)' },
    { key: 'source', header: 'Source' },
    { key: 'responsibility', header: 'Responsibility' }
  ];

  const roadmapColumns = [
    { key: 'priority', header: 'Priority' },
    { key: 'action', header: 'Action', width: '35%' },
    { key: 'leadAgency', header: 'Lead Agency' },
    { key: 'deadline', header: 'Deadline' },
    { key: 'budget', header: 'Budget' }
  ];

  const outcomeColumns = [
    { key: 'metric', header: 'Metric', width: '30%' },
    { key: 'baseline2023', header: 'Baseline (2023)' },
    { key: 'target2027', header: 'Target 2027' },
    { key: 'target2030', header: 'Target 2030' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Control Bar */}
        <div className="flex flex-wrap items-center justify-between sticky top-0 z-10 bg-background py-4 border-b gap-4">
          <div className="flex items-center gap-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">GTCI Strategic Analysis</h1>
              <p className="text-sm text-muted-foreground">Brunei Darussalam 2026-2030</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Admin Edit Mode Toggle */}
            {isAdmin ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Admin</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    id="edit-mode"
                    checked={editMode}
                    onCheckedChange={setEditMode}
                  />
                  <Label htmlFor="edit-mode" className="text-sm">Edit Mode</Label>
                </div>

                {editMode && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-save"
                      checked={autoSaveEnabled}
                      onCheckedChange={setAutoSaveEnabled}
                    />
                    <Label htmlFor="auto-save" className="text-sm">Auto-Save</Label>
                  </div>
                )}
              </>
            ) : (
              <Badge variant="secondary" className="text-muted-foreground">
                View Only
              </Badge>
            )}
            
            {/* Save Status Indicators */}
            {isSaving && (
              <Badge variant="outline" className="text-blue-500 border-blue-500 animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Saving...
              </Badge>
            )}
            
            {!isSaving && !hasUnsavedChanges && editMode && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
            
            {hasUnsavedChanges && !isSaving && (
              <Badge variant="outline" className="text-amber-500 border-amber-500">
                Unsaved Changes
              </Badge>
            )}
            
            {/* Admin Actions */}
            {isAdmin && editMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                
                <Button
                  size="sm"
                  onClick={save}
                  disabled={isSaving || !hasUnsavedChanges}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Now
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Header Section */}
        <GTCIStrategicHeader 
          data={data} 
          editable={isAdmin && editMode}
          onUpdate={updateData}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
              <LayoutDashboard className="h-3 w-3" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="gaps" className="flex items-center gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span className="hidden md:inline">Data Gaps</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-1 text-xs">
              <Building2 className="h-3 w-3" />
              <span className="hidden md:inline">Governance</span>
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center gap-1 text-xs">
              <FileText className="h-3 w-3" />
              <span className="hidden md:inline">Indicators</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-1 text-xs">
              <ListTodo className="h-3 w-3" />
              <span className="hidden md:inline">Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="flex items-center gap-1 text-xs">
              <Target className="h-3 w-3" />
              <span className="hidden md:inline">Outcomes</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Pillar</CardTitle>
                <CardDescription>
                  Visual overview of Brunei's GTCI performance across all 6 pillars
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <GTCIPillarPerformanceChart pillars={data.pillar_performance} />
                
                <EditableTable
                  title="Pillar Performance Data"
                  columns={pillarColumns}
                  data={data.pillar_performance}
                  onDataChange={(newData) => updateData('pillar_performance', newData as PillarPerformance[])}
                  editable={isAdmin && editMode}
                  newRowTemplate={{ pillar: '', score: 0, rank: 0, status: 'Moderate' }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Gaps Tab */}
          <TabsContent value="gaps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>WEF EOS Data Gap Analysis</CardTitle>
                <CardDescription>
                  Indicators affected by missing WEF Executive Opinion Survey participation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Problem Statement:</strong> Brunei loses approximately <strong>8-12 ranking positions</strong> 
                    (= 8-10 points) because of missing data in the WEF Executive Opinion Survey (EOS), 
                    not because of actual weak talent systems.
                  </p>
                </div>

                <EditableTable
                  title="Indicators Affected by Missing WEF EOS Participation"
                  columns={dataGapColumns}
                  data={data.data_gap_indicators}
                  onDataChange={(newData) => updateData('data_gap_indicators', newData as DataGapIndicator[])}
                  editable={isAdmin && editMode}
                  newRowTemplate={{ indicator: '', currentStatus: '', impact: '', dataSource: '' }}
                />

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">WEF Participation Recruitment Strategy</CardTitle>
                    <CardDescription>Target Sample: 200-300 Executive Respondents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EditableTable
                      columns={wefColumns}
                      data={data.wef_participation_steps}
                      onDataChange={(newData) => updateData('wef_participation_steps', newData as WEFParticipationStep[])}
                      editable={isAdmin && editMode}
                      newRowTemplate={{ source: '', targetCount: '', contact: '', timeline: '' }}
                    />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ministry-Level Data Ownership</CardTitle>
                <CardDescription>
                  MPEC as Coordination Hub - Responsibility and data ownership by thematic group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <EditableTable
                  columns={ministryColumns}
                  data={data.ministry_governance}
                  onDataChange={(newData) => updateData('ministry_governance', newData as MinistryGovernance[])}
                  editable={isAdmin && editMode}
                  newRowTemplate={{ thematicGroup: '', leadMinistry: '', coCoordinators: '', indicators: '' }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  2026-2027 GTCI Initiative Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditableTable
                  columns={fundingColumns}
                  data={data.funding_model}
                  onDataChange={(newData) => updateData('funding_model', newData as FundingModelItem[])}
                  editable={isAdmin && editMode}
                  newRowTemplate={{ component: '', budget: '', source: '', responsibility: '' }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indicators Tab */}
          <TabsContent value="indicators" className="space-y-6">
            <GTCIIndicatorAnalysisTable
              indicators={data.indicator_analysis}
              onUpdate={(indicators) => updateData('indicator_analysis', indicators)}
              editable={isAdmin && editMode}
            />
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Priority Implementation Roadmap 2026-2030</CardTitle>
                <CardDescription>
                  Phase 1: Immediate Actions (January - March 2026)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditableTable
                  columns={roadmapColumns}
                  data={data.implementation_roadmap}
                  onDataChange={(newData) => updateData('implementation_roadmap', newData as ImplementationPhase[])}
                  editable={isAdmin && editMode}
                  newRowTemplate={{ priority: 'MEDIUM', action: '', leadAgency: '', deadline: '', budget: '' }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outcomes Tab */}
          <TabsContent value="outcomes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expected Outcomes & Success Metrics</CardTitle>
                <CardDescription>
                  2027 GTCI Cycle (Data: 2026, Results: Nov 2027) - Expected improvements from WEF EOS participation + policy actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditableTable
                  columns={outcomeColumns}
                  data={data.expected_outcomes}
                  onDataChange={(newData) => updateData('expected_outcomes', newData as ExpectedOutcome[])}
                  editable={isAdmin && editMode}
                  newRowTemplate={{ metric: '', baseline2023: '', target2027: '', target2030: '' }}
                />
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-green-600">Strategic Imperatives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. IMMEDIATE: Participate in WEF GTCI 2026 EOS</h4>
                  <p className="text-sm text-muted-foreground">
                    This single action closes 8-10 indicator data gaps. Worth ~5 ranking positions. 
                    Feasible with current MPEC/MTIC resources.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">2. SHORT-TERM: Launch 5 Quick-Win Programs (by Q3 2026)</h4>
                  <p className="text-sm text-muted-foreground">
                    SME digital adoption, Internet in schools expansion, i-Ready scaling to 100K, 
                    Digital skills training, Women in leadership initiative.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">3. MEDIUM-TERM: Establish Sustainable Systems (2026-2030)</h4>
                  <p className="text-sm text-muted-foreground">
                    Researcher registry + publication tracking, GTCI data dashboard, R&D funding framework, 
                    Cluster development governance, Workforce skill certification systems.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
