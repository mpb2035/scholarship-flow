import { useState } from 'react';
import { useMatters } from '@/hooks/useMatters';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { SLABarChart } from '@/components/dashboard/SLABarChart';
import { MatterTable } from '@/components/dashboard/MatterTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { MatterForm } from '@/components/dashboard/MatterForm';
import { MatterDetail } from '@/components/dashboard/MatterDetail';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { Matter } from '@/types/matter';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  MessageSquare,
  Send
} from 'lucide-react';

const Index = () => {
  const { 
    matters, 
    filteredMatters, 
    filters, 
    setFilters, 
    stats,
    addMatter,
    updateMatter,
    deleteMatter,
    getExistingCaseIds
  } = useMatters();

  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [editingMatter, setEditingMatter] = useState<Matter | undefined>();

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

  const handleDelete = (id: string) => {
    deleteMatter(id);
    toast({
      title: 'Matter Deleted',
      description: 'The matter has been removed from tracking.',
    });
  };

  const handleFormSubmit = (data: Omit<Matter, 'id'>) => {
    if (editingMatter) {
      updateMatter(editingMatter.id, data);
      toast({
        title: 'Matter Updated',
        description: 'The matter has been successfully updated.',
      });
    } else {
      addMatter(data);
      toast({
        title: 'Matter Logged',
        description: 'New matter has been added to tracking.',
      });
    }
  };

  const handleRefresh = () => {
    toast({
      title: 'Dashboard Refreshed',
      description: 'All data has been synchronized.',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        <Header onAddNew={handleAddNew} onRefresh={handleRefresh} />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          <KPICard
            title="Total Active"
            value={stats.totalActive}
            icon={FileText}
            delay={0}
          />
          <KPICard
            title="Pending Review"
            value={stats.pendingSutHe}
            icon={Clock}
            variant="warning"
            delay={50}
          />
          <KPICard
            title="DSM Query (SUT)"
            value={stats.dsmToRespondSutHe}
            icon={MessageSquare}
            variant="warning"
            delay={100}
          />
          <KPICard
            title="DSM Query (HU)"
            value={stats.dsmToRespondHigherUp}
            icon={Send}
            variant="warning"
            delay={150}
          />
          <KPICard
            title="Higher Up"
            value={stats.pendingHigherUp}
            icon={TrendingUp}
            delay={200}
          />
          <KPICard
            title="SLA Breached"
            value={stats.slaBreached}
            icon={XCircle}
            variant="danger"
            delay={250}
          />
          <KPICard
            title="At Risk"
            value={stats.atRisk}
            icon={AlertTriangle}
            variant="warning"
            delay={300}
          />
          <KPICard
            title="Approved (30d)"
            value={stats.approvedLast30Days}
            icon={CheckCircle}
            variant="success"
            delay={350}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <StatusChart stats={stats} />
          <SLABarChart matters={matters} />
          <AlertsPanel matters={matters} onMatterClick={handleView} />
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onFiltersChange={setFilters} />

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
      </div>
    </div>
  );
};

export default Index;
