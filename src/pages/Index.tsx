import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatters } from '@/hooks/useMatters';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { KPIDetailDialog } from '@/components/dashboard/KPIDetailDialog';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { SLABarChart } from '@/components/dashboard/SLABarChart';
import { MatterTable } from '@/components/dashboard/MatterTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { MatterForm } from '@/components/dashboard/MatterForm';
import { MatterDetail } from '@/components/dashboard/MatterDetail';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { Matter } from '@/types/matter';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  MessageSquare,
  Send,
  RefreshCw
} from 'lucide-react';

type KPIType = 'totalActive' | 'inProcess' | 'pendingReview' | 'dsmQuerySut' | 'dsmQueryHu' | 'higherUp' | 'slaBreached' | 'atRisk' | 'approved30d';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  const { 
    filteredMatters, 
    filters, 
    setFilters, 
    stats,
    addMatter,
    updateMatter,
    deleteMatter,
    getExistingCaseIds,
    loading,
    refreshMatters,
    matters
  } = useMatters();

  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [editingMatter, setEditingMatter] = useState<Matter | undefined>();
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPIType | null>(null);

  // Compute matters for each KPI category
  const kpiMatters = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return {
      totalActive: matters.filter(m => !['Approved & Signed', 'Not Approved'].includes(m.overallStatus)),
      inProcess: matters.filter(m => m.overallStatus === 'In Process'),
      pendingReview: matters.filter(m => m.overallStatus === 'Pending SUT HE Review'),
      dsmQuerySut: matters.filter(m => m.overallStatus === 'DSM to Respond – SUT HE Query'),
      dsmQueryHu: matters.filter(m => m.overallStatus === 'DSM to Respond – Higher Up Query'),
      higherUp: matters.filter(m => m.overallStatus === 'Pending Higher Up Approval'),
      slaBreached: matters.filter(m => m.slaStatus === 'Overdue'),
      atRisk: matters.filter(m => m.slaStatus === 'At Risk' || m.slaStatus === 'Critical'),
      approved30d: matters.filter(m => m.overallStatus === 'Approved & Signed' && m.signedDate && new Date(m.signedDate) >= thirtyDaysAgo),
    };
  }, [matters]);

  const kpiTitles: Record<KPIType, string> = {
    totalActive: 'Total Active Matters',
    inProcess: 'In Process Matters',
    pendingReview: 'Pending SUT HE Review',
    dsmQuerySut: 'Dept to Respond – SUT HE Query',
    dsmQueryHu: 'Dept to Respond – Higher Up Query',
    higherUp: 'Pending Higher Up Approval',
    slaBreached: 'SLA Breached Matters',
    atRisk: 'At Risk Matters',
    approved30d: 'Approved in Last 30 Days',
  };

  const handleKPIClick = (kpiType: KPIType) => {
    setSelectedKPI(kpiType);
    setKpiDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingMatter(undefined);
    setFormOpen(true);
  };

  const handleEdit = (matter: Matter) => {
    setEditingMatter(matter);
    setFormOpen(true);
  };

  const handleView = (matter: Matter) => {
    setSelectedMatter(matter);
    setDetailOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMatter(id);
      toast({
        title: 'Matter Deleted',
        description: 'The matter has been removed from tracking.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete matter.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: Omit<Matter, 'id'>) => {
    try {
      if (editingMatter) {
        await updateMatter(editingMatter.id, data);
        toast({
          title: 'Matter Updated',
          description: 'The matter has been successfully updated.',
        });
      } else {
        await addMatter(data);
        toast({
          title: 'Matter Logged',
          description: 'New matter has been added to tracking.',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save matter. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    await refreshMatters();
    toast({
      title: 'Dashboard Refreshed',
      description: 'All data has been synchronized.',
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        <Header onAddNew={handleAddNew} onRefresh={handleRefresh} />

        {/* KPI Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3 mb-6">
          <KPICard
            title="Total Active"
            value={stats.totalActive}
            icon={FileText}
            delay={0}
            onClick={() => handleKPIClick('totalActive')}
          />
          <KPICard
            title="In Process"
            value={stats.inProcess}
            icon={RefreshCw}
            delay={50}
            onClick={() => handleKPIClick('inProcess')}
          />
          <KPICard
            title="Pending Review"
            value={stats.pendingSutHe}
            icon={Clock}
            variant="warning"
            delay={100}
            onClick={() => handleKPIClick('pendingReview')}
          />
          <KPICard
            title="Dept Query (SUT)"
            value={stats.dsmToRespondSutHe}
            icon={MessageSquare}
            variant="warning"
            delay={150}
            onClick={() => handleKPIClick('dsmQuerySut')}
          />
          <KPICard
            title="Dept Query (HU)"
            value={stats.dsmToRespondHigherUp}
            icon={Send}
            variant="warning"
            delay={200}
            onClick={() => handleKPIClick('dsmQueryHu')}
          />
          <KPICard
            title="Higher Up"
            value={stats.pendingHigherUp}
            icon={TrendingUp}
            delay={250}
            onClick={() => handleKPIClick('higherUp')}
          />
          <KPICard
            title="SLA Breached"
            value={stats.slaBreached}
            icon={XCircle}
            variant="danger"
            delay={300}
            onClick={() => handleKPIClick('slaBreached')}
          />
          <KPICard
            title="At Risk"
            value={stats.atRisk}
            icon={AlertTriangle}
            variant="warning"
            delay={350}
            onClick={() => handleKPIClick('atRisk')}
          />
          <KPICard
            title="Approved (30d)"
            value={stats.approvedLast30Days}
            icon={CheckCircle}
            variant="success"
            delay={400}
            onClick={() => handleKPIClick('approved30d')}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <StatusChart stats={stats} />
          <SLABarChart matters={matters} />
          <AlertsPanel matters={matters} onMatterClick={handleView} />
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onFiltersChange={setFilters} filteredMatters={filteredMatters} />

        {/* Table */}
        <div className="mt-6">
          <MatterTable
            matters={filteredMatters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </div>

        {/* Forms/Dialogs */}
        <MatterForm
          open={formOpen}
          onOpenChange={setFormOpen}
          matter={editingMatter}
          existingCaseIds={getExistingCaseIds()}
          onSubmit={handleFormSubmit}
        />

        <MatterDetail
          open={detailOpen}
          onOpenChange={setDetailOpen}
          matter={selectedMatter}
        />

        <KPIDetailDialog
          open={kpiDialogOpen}
          onOpenChange={setKpiDialogOpen}
          title={selectedKPI ? kpiTitles[selectedKPI] : ''}
          matters={selectedKPI ? kpiMatters[selectedKPI] : []}
          onMatterClick={(matter) => {
            setKpiDialogOpen(false);
            handleView(matter);
          }}
        />
      </div>
    </div>
  );
};

export default Index;
