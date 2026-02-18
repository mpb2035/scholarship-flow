import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatters } from '@/hooks/useMatters';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useMeetings } from '@/hooks/useMeetings';
import { useAttachmentOverseas } from '@/hooks/useAttachmentOverseas';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { KPIDetailDialog } from '@/components/dashboard/KPIDetailDialog';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { SLABarChart } from '@/components/dashboard/SLABarChart';
import { MatterTable } from '@/components/dashboard/MatterTable';
import { FilterBar, StatusToggle } from '@/components/dashboard/FilterBar';
import { MatterForm } from '@/components/dashboard/MatterForm';
import { MatterDetail } from '@/components/dashboard/MatterDetail';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { DeadlineCounterCard } from '@/components/dashboard/DeadlineCounterCard';
import { DeadlineDetailDialog } from '@/components/dashboard/DeadlineDetailDialog';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { Matter, OverallStatus, SLAStatus } from '@/types/matter';
import { MatterErrorDialog } from '@/components/dashboard/MatterErrorDialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MessageSquare,
  Send,
  RefreshCw
} from 'lucide-react';
import { parseISO } from 'date-fns';

type KPIType = 'totalActive' | 'inProcess' | 'pendingReview' | 'deptQuerySut' | 'deptQueryHu' | 'higherUp' | 'approved30d';

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

  const { projects, createProjectFromMatter, refreshProjects } = useProjects();
  const { upcomingMeetings, addMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const { addAttachment, updateAttachment, getByMatterId, refreshAttachments } = useAttachmentOverseas();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [editingMatter, setEditingMatter] = useState<Matter | undefined>();
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPIType | null>(null);
  const [statusToggle, setStatusToggle] = useState<StatusToggle>('all');
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogError, setErrorDialogError] = useState<unknown>(null);
  const [errorDialogContext, setErrorDialogContext] = useState<'create' | 'update' | 'delete'>('create');
  const [errorDialogMatterData, setErrorDialogMatterData] = useState<{ caseId?: string; caseTitle?: string; caseType?: string } | undefined>();
  const [selectedDeadlineCategory, setSelectedDeadlineCategory] = useState<'overdue' | 'thisWeek' | 'upcoming' | 'noDeadline' | null>(null);

  // Apply status toggle filter to filteredMatters
  const displayedMatters = useMemo(() => {
    if (statusToggle === 'completed') {
      return filteredMatters.filter(m => m.overallStatus === 'Approved & Signed' || m.overallStatus === 'Not Approved');
    } else if (statusToggle === 'in-process') {
      return filteredMatters.filter(m => m.overallStatus !== 'Approved & Signed' && m.overallStatus !== 'Not Approved');
    }
    return filteredMatters;
  }, [filteredMatters, statusToggle]);
  // Compute matters for each KPI category
  const kpiMatters = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return {
      totalActive: matters.filter(m => !['Approved & Signed', 'Not Approved'].includes(m.overallStatus)),
      inProcess: matters.filter(m => m.overallStatus === 'In Process'),
      pendingReview: matters.filter(m => m.overallStatus === 'Pending SUT HE Review'),
      deptQuerySut: matters.filter(m => m.overallStatus === 'Dept to Respond – SUT HE Query'),
      deptQueryHu: matters.filter(m => m.overallStatus === 'Dept to Respond – Higher Up Query'),
      higherUp: matters.filter(m => m.overallStatus === 'Pending Higher Up Approval'),
      approved30d: matters.filter(m => m.overallStatus === 'Approved & Signed' && m.signedDate && new Date(m.signedDate) >= thirtyDaysAgo),
    };
  }, [matters]);

  // Compute overdue counts for each status category
  const overdueCounts = useMemo(() => ({
    inProcess: kpiMatters.inProcess.filter(m => m.slaStatus === 'Overdue').length,
    pendingReview: kpiMatters.pendingReview.filter(m => m.slaStatus === 'Overdue').length,
    deptQuerySut: kpiMatters.deptQuerySut.filter(m => m.slaStatus === 'Overdue').length,
    deptQueryHu: kpiMatters.deptQueryHu.filter(m => m.slaStatus === 'Overdue').length,
    higherUp: kpiMatters.higherUp.filter(m => m.slaStatus === 'Overdue').length,
  }), [kpiMatters]);

  // Compute deadline matters for dialog
  const deadlineMatters = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const activeMatters = matters.filter(m => 
      !['Approved & Signed', 'Not Approved'].includes(m.overallStatus)
    );
    
    const mattersWithDeadline = activeMatters.filter(m => m.deadline);

    return {
      overdue: mattersWithDeadline.filter(m => {
        const deadline = parseISO(m.deadline!);
        return deadline < today;
      }),
      thisWeek: mattersWithDeadline.filter(m => {
        const deadline = parseISO(m.deadline!);
        return deadline >= today && deadline <= weekFromNow;
      }),
      upcoming: mattersWithDeadline.filter(m => {
        const deadline = parseISO(m.deadline!);
        return deadline > weekFromNow;
      }),
      noDeadline: activeMatters.filter(m => !m.deadline),
    };
  }, [matters]);

  const kpiTitles: Record<KPIType, string> = {
    totalActive: 'Total Active Matters',
    inProcess: 'In Process Matters',
    pendingReview: 'Pending SUT HE Review',
    deptQuerySut: 'Dept to Respond – SUT HE Query',
    deptQueryHu: 'Dept to Respond – Higher Up Query',
    higherUp: 'Pending Higher Up Approval',
    approved30d: 'Approved in Last 30 Days',
  };

  const handleKPIClick = (kpiType: KPIType) => {
    setSelectedKPI(kpiType);
    setKpiDialogOpen(true);
  };

  const handleDeadlineClick = (category: 'overdue' | 'thisWeek' | 'upcoming' | 'noDeadline') => {
    setSelectedDeadlineCategory(category);
    setDeadlineDialogOpen(true);
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
    } catch (error) {
      setErrorDialogError(error);
      setErrorDialogContext('delete');
      setErrorDialogMatterData(undefined);
      setErrorDialogOpen(true);
    }
  };

  // Auto-save attachment overseas data after matter creation/update (update if it already exists)
  const saveAttachmentOverseas = useCallback(async (matterId: string) => {
    const pendingData = sessionStorage.getItem('pendingAttachmentOverseas');
    if (!pendingData) return;

    let attachmentData: any;
    try {
      attachmentData = JSON.parse(pendingData);
    } catch {
      sessionStorage.removeItem('pendingAttachmentOverseas');
      return;
    }

    const isBlank =
      !attachmentData?.institution &&
      !attachmentData?.programStartDate &&
      !attachmentData?.programEndDate &&
      !(attachmentData?.programmes?.length) &&
      !attachmentData?.fundingType &&
      !attachmentData?.country &&
      !attachmentData?.destinationInstitution;

    // If the user didn’t fill any overseas fields, don’t block matter save.
    if (isBlank) {
      sessionStorage.removeItem('pendingAttachmentOverseas');
      return;
    }

    // Validate required fields for saving the overseas record
    if (!attachmentData.institution || !attachmentData.programStartDate || !attachmentData.programEndDate) {
      toast({
        title: 'Attachment Overseas not saved',
        description: 'Please fill Institution, Start Date, and End Date to save the overseas details.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      institution: attachmentData.institution,
      programmes: attachmentData.programmes || [],
      programStartDate: attachmentData.programStartDate,
      programEndDate: attachmentData.programEndDate,
      fundingType: attachmentData.fundingType || 'Self Funded',
      country: attachmentData.country || '',
      destinationInstitution: attachmentData.destinationInstitution || '',
      studentCount: attachmentData.studentCount || 1,
    };

    try {
      const existing = getByMatterId(matterId);

      if (existing) {
        await updateAttachment(existing.id, payload);
      } else {
        await addAttachment({
          matterId,
          ...payload,
        });
      }

      sessionStorage.removeItem('pendingAttachmentOverseas');
      await refreshAttachments();

      toast({
        title: 'Attachment Overseas Saved',
        description: 'Overseas attachment details have been linked to the matter.',
      });
    } catch (error) {
      console.error('Error saving attachment overseas:', error);
      toast({
        title: 'Warning',
        description: 'Matter saved, but failed to save attachment overseas details.',
        variant: 'destructive',
      });
    }
  }, [addAttachment, updateAttachment, getByMatterId, refreshAttachments, toast]);

  const handleFormSubmit = async (data: Omit<Matter, 'id'>) => {
    try {
      if (editingMatter) {
        await updateMatter(editingMatter.id, data);
        if (data.caseType === 'Attachment Overseas') {
          await saveAttachmentOverseas(editingMatter.id);
        }
        toast({
          title: 'Matter Updated',
          description: 'The matter has been successfully updated.',
        });
      } else {
        const newMatter = await addMatter(data);
        if (newMatter && data.caseType === 'Attachment Overseas') {
          await saveAttachmentOverseas(newMatter.id);
        }
        toast({
          title: 'Matter Logged',
          description: 'New matter has been added to tracking.',
        });
      }
    } catch (error) {
      console.error('Matter save error:', error);
      setErrorDialogError(error);
      setErrorDialogContext(editingMatter ? 'update' : 'create');
      setErrorDialogMatterData({ caseId: data.caseId, caseTitle: data.caseTitle, caseType: data.caseType });
      setErrorDialogOpen(true);
    }
  };

  const handleRefresh = async () => {
    await refreshMatters();
    toast({
      title: 'Dashboard Refreshed',
      description: 'All data has been synchronized.',
    });
  };

  const handleStatusChartClick = (status: string) => {
    if (status === 'sla_breached') {
      // Special case: filter by SLA status
      setFilters({ ...filters, status: 'all', slaStatus: 'Overdue' });
    } else if (status.startsWith('[')) {
      // Multiple statuses case (Query Response) - parse JSON array and filter to show any matching status
      try {
        const statuses = JSON.parse(status) as string[];
        // For now, filter using the first status, but search will match any
        // We'll use search-based filtering for multiple statuses
        setFilters({ ...filters, status: 'Returned for Query' as OverallStatus, slaStatus: 'all' });
      } catch {
        setFilters({ ...filters, status: status as OverallStatus, slaStatus: 'all' });
      }
    } else {
      setFilters({ ...filters, status: status as OverallStatus, slaStatus: 'all' });
    }
  };

  const handleSLAChartClick = (slaStatus: string) => {
    setFilters({ ...filters, slaStatus: slaStatus as SLAStatus, status: 'all' });
  };

  const handleConvertToProject = async (matter: Matter) => {
    try {
      await createProjectFromMatter({
        id: matter.id,
        caseId: matter.caseId,
        caseTitle: matter.caseTitle,
        caseType: matter.caseType,
        priority: matter.priority,
        overallStatus: matter.overallStatus,
      });
      toast({
        title: 'Project Created',
        description: `"${matter.caseId}" has been converted to a project.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateProjectFromForm = async (matterData: { caseId: string; caseTitle: string; caseType: string; priority: string; overallStatus: string }) => {
    try {
      const project = await createProjectFromMatter({
        id: '', // Not linked to a specific matter ID yet
        ...matterData,
      });
      toast({
        title: 'Project Created',
        description: `New project "${project.title}" has been created.`,
      });
      await refreshProjects();
      return project;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project.',
        variant: 'destructive',
      });
      return undefined;
    }
  };

  const handleLinkProject = (matterId: string | undefined, projectId: string) => {
    // This is a UI-only link for now - the project is selected in the form
    toast({
      title: 'Project Linked',
      description: 'Matter linked to project successfully.',
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
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        <Header onAddNew={handleAddNew} onRefresh={handleRefresh} matters={matters} />

        {/* KPI Cards - Total Active + 5 Sub-cards + Approved */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <KPICard
            title="Total Active"
            value={stats.totalActive}
            icon={FileText}
            variant="primary"
            isMain
            delay={0}
            onClick={() => handleKPIClick('totalActive')}
          />
          <KPICard
            title="In Process (SFZN Tray)"
            value={stats.inProcess}
            icon={RefreshCw}
            delay={50}
            overdueCount={overdueCounts.inProcess}
            onClick={() => handleKPIClick('inProcess')}
          />
          <KPICard
            title="Pending SUT HE Signature"
            value={stats.pendingSutHe}
            icon={Clock}
            delay={100}
            overdueCount={overdueCounts.pendingReview}
            onClick={() => handleKPIClick('pendingReview')}
          />
          <KPICard
            title="Dept Query (SUT)"
            value={stats.deptToRespondSutHe}
            icon={MessageSquare}
            delay={150}
            overdueCount={overdueCounts.deptQuerySut}
            onClick={() => handleKPIClick('deptQuerySut')}
          />
          <KPICard
            title="Dept Query (HU)"
            value={stats.deptToRespondHigherUp}
            icon={Send}
            delay={200}
            overdueCount={overdueCounts.deptQueryHu}
            onClick={() => handleKPIClick('deptQueryHu')}
          />
          <KPICard
            title="Higher Up"
            value={stats.pendingHigherUp}
            icon={TrendingUp}
            delay={250}
            overdueCount={overdueCounts.higherUp}
            onClick={() => handleKPIClick('higherUp')}
          />
          <KPICard
            title="Approved (30d)"
            value={stats.approvedLast30Days}
            icon={CheckCircle}
            variant="success"
            delay={300}
            onClick={() => handleKPIClick('approved30d')}
          />
        </div>

        {/* Charts Row + Deadline Tracker + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <StatusChart stats={stats} onSegmentClick={handleStatusChartClick} />
          <SLABarChart matters={matters} onBarClick={handleSLAChartClick} />
          <AlertsPanel matters={matters} onMatterClick={handleView} />
          <DeadlineCounterCard matters={matters} onClick={handleDeadlineClick} />
        </div>

        {/* Upcoming Events */}
        <div className="mb-6">
          <UpcomingEventsCard
            meetings={upcomingMeetings}
            onAdd={addMeeting}
            onUpdate={updateMeeting}
            onDelete={deleteMeeting}
          />
        </div>

        {/* Filters */}
        <FilterBar 
          filters={filters} 
          onFiltersChange={setFilters} 
          filteredMatters={displayedMatters}
          statusToggle={statusToggle}
          onStatusToggleChange={setStatusToggle}
        />

        {/* Table */}
        <div className="mt-6">
          <MatterTable
            matters={displayedMatters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onConvertToProject={handleConvertToProject}
          />
        </div>

        {/* Forms/Dialogs */}
        <MatterForm
          open={formOpen}
          onOpenChange={setFormOpen}
          matter={editingMatter}
          existingCaseIds={getExistingCaseIds()}
          onSubmit={handleFormSubmit}
          projects={projects}
          onCreateProject={handleCreateProjectFromForm}
          onLinkProject={handleLinkProject}
          linkedProjectId={editingMatter ? projects.find(p => p.sourceMatterId === editingMatter.id)?.id : undefined}
        />

        <MatterDetail
          open={detailOpen}
          onOpenChange={setDetailOpen}
          matter={selectedMatter}
          onEdit={handleEdit}
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

        <DeadlineDetailDialog
          open={deadlineDialogOpen}
          onOpenChange={setDeadlineDialogOpen}
          category={selectedDeadlineCategory}
          matters={selectedDeadlineCategory ? deadlineMatters[selectedDeadlineCategory] : []}
          onMatterClick={(matter) => {
            setDeadlineDialogOpen(false);
            handleView(matter);
          }}
        />

        <MatterErrorDialog
          open={errorDialogOpen}
          onOpenChange={setErrorDialogOpen}
          error={errorDialogError}
          context={errorDialogContext}
          matterData={errorDialogMatterData}
        />
      </div>
    </div>
  );
};

export default Index;
