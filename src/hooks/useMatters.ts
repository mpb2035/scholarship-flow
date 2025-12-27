import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Matter, DashboardStats, OverallStatus, Priority, CaseType, SLAStatus } from '@/types/matter';
import { useToast } from '@/hooks/use-toast';

export interface Filters {
  status: OverallStatus | 'all' | 'Completed';
  priority: Priority | 'all';
  caseType: CaseType | 'all';
  slaStatus: SLAStatus | 'all';
  search: string;
  month: string;
  year: string;
}

interface DbMatter {
  id: string;
  case_id: string;
  case_title: string;
  case_type: string;
  priority: string;
  dsm_submitted_date: string;
  suthe_received_date: string;
  suthe_submitted_to_hu_date: string | null;
  query_issued_date: string | null;
  query_response_date: string | null;
  signed_date: string | null;
  query_status: string;
  overall_status: string;
  overall_sla_days: number;
  sla_status: string;
  remarks: string | null;
  assigned_to: string | null;
  external_link: string | null;
}

const calculateDaysInProcess = (submittedDate: string, signedDate?: string | null): number => {
  const submitted = new Date(submittedDate);
  const endDate = signedDate ? new Date(signedDate) : new Date();
  return Math.floor((endDate.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateDaysSutHeToHu = (sutheReceivedDate: string, sutheSubmittedToHuDate?: string | null): number => {
  if (!sutheSubmittedToHuDate) return 0;
  const received = new Date(sutheReceivedDate);
  const submitted = new Date(sutheSubmittedToHuDate);
  return Math.floor((submitted.getTime() - received.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateQueryDaysPending = (
  queryIssuedDate?: string | null, 
  queryResponseDate?: string | null, 
  overallStatus?: string
): { sutHe: number; higherUp: number } => {
  if (!queryIssuedDate || queryResponseDate) return { sutHe: 0, higherUp: 0 };
  const issued = new Date(queryIssuedDate);
  const today = new Date();
  const days = Math.floor((today.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24));
  
  if (overallStatus === 'Dept to Respond – SUT HE Query') {
    return { sutHe: days, higherUp: 0 };
  } else if (overallStatus === 'Dept to Respond – Higher Up Query') {
    return { sutHe: 0, higherUp: days };
  }
  return { sutHe: 0, higherUp: 0 };
};

const mapDbToMatter = (db: DbMatter): Matter => {
  const queryDays = calculateQueryDaysPending(db.query_issued_date, db.query_response_date, db.overall_status);
  return {
    id: db.id,
    caseId: db.case_id,
    caseTitle: db.case_title,
    caseType: db.case_type as CaseType,
    priority: db.priority as Priority,
    dsmSubmittedDate: db.dsm_submitted_date,
    sutheReceivedDate: db.suthe_received_date,
    sutheSubmittedToHuDate: db.suthe_submitted_to_hu_date || undefined,
    queryIssuedDate: db.query_issued_date || undefined,
    queryResponseDate: db.query_response_date || undefined,
    signedDate: db.signed_date || undefined,
    queryStatus: db.query_status as Matter['queryStatus'],
    overallStatus: db.overall_status as OverallStatus,
    daysInProcess: calculateDaysInProcess(db.dsm_submitted_date, db.signed_date),
    daysSutHeToHu: calculateDaysSutHeToHu(db.suthe_received_date, db.suthe_submitted_to_hu_date),
    queryDaysPendingSutHe: queryDays.sutHe,
    queryDaysPendingHigherUp: queryDays.higherUp,
    overallSlaDays: db.overall_sla_days,
    slaStatus: db.sla_status as SLAStatus,
    remarks: db.remarks || undefined,
    assignedTo: db.assigned_to || undefined,
    externalLink: db.external_link || undefined,
  };
};

export function useMatters() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    priority: 'all',
    caseType: 'all',
    slaStatus: 'all',
    search: '',
    month: 'all',
    year: 'all',
  });

  // Fetch matters from database
  const fetchMatters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load matters from database.',
        variant: 'destructive',
      });
    } else {
      setMatters((data || []).map(mapDbToMatter));
    }
    setLoading(false);
  }, [toast]);

  // Subscribe to realtime changes
  useEffect(() => {
    fetchMatters();

    const channel = supabase
      .channel('matters-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matters' },
        () => {
          fetchMatters();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMatters]);

  const filteredMatters = useMemo(() => {
    // Query-related statuses for combined "Query Response" filter
    const queryStatuses = ['Returned for Query', 'Dept to Respond – SUT HE Query', 'Dept to Respond – Higher Up Query'];
    
    return matters.filter((matter) => {
      // Handle "Completed" filter - matches matters with signed date (approved)
      if (filters.status === 'Completed') {
        if (!matter.signedDate) return false;
      } else if (filters.status === 'Returned for Query') {
        // Special case: "Returned for Query" filter shows all query-related statuses
        if (!queryStatuses.includes(matter.overallStatus)) return false;
      } else if (filters.status !== 'all' && matter.overallStatus !== filters.status) {
        return false;
      }
      if (filters.priority !== 'all' && matter.priority !== filters.priority) return false;
      if (filters.caseType !== 'all' && matter.caseType !== filters.caseType) return false;
      if (filters.slaStatus !== 'all' && matter.slaStatus !== filters.slaStatus) return false;
      
      // Month and year filter based on DSM submitted date
      if (filters.month !== 'all' || filters.year !== 'all') {
        const submittedDate = new Date(matter.dsmSubmittedDate);
        if (filters.year !== 'all' && submittedDate.getFullYear().toString() !== filters.year) {
          return false;
        }
        if (filters.month !== 'all' && (submittedDate.getMonth() + 1).toString() !== filters.month) {
          return false;
        }
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          matter.caseId.toLowerCase().includes(searchLower) ||
          matter.caseTitle.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [matters, filters]);

  const stats: DashboardStats = useMemo(() => {
    const active = matters.filter(m => !['Approved & Signed', 'Not Approved'].includes(m.overallStatus));
    const approved = matters.filter(m => m.overallStatus === 'Approved & Signed');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return {
      totalActive: active.length,
      inProcess: matters.filter(m => m.overallStatus === 'In Process').length,
      returnedForQuery: matters.filter(m => 
        m.overallStatus.includes('Dept to Respond') || m.overallStatus === 'Returned for Query'
      ).length,
      approvedLast30Days: approved.filter(m => 
        m.signedDate && new Date(m.signedDate) >= thirtyDaysAgo
      ).length,
      slaBreached: matters.filter(m => m.slaStatus === 'Overdue').length,
      avgDaysToApproval: approved.length > 0 
        ? Math.round(approved.reduce((sum, m) => sum + m.daysInProcess, 0) / approved.length)
        : 0,
      atRisk: matters.filter(m => m.slaStatus === 'At Risk' || m.slaStatus === 'Critical').length,
      pendingSutHe: matters.filter(m => m.overallStatus === 'Pending SUT HE Review').length,
      deptToRespondSutHe: matters.filter(m => m.overallStatus === 'Dept to Respond – SUT HE Query').length,
      deptToRespondHigherUp: matters.filter(m => m.overallStatus === 'Dept to Respond – Higher Up Query').length,
      pendingHigherUp: matters.filter(m => m.overallStatus === 'Pending Higher Up Approval').length,
    };
  }, [matters]);

  const addMatter = useCallback(async (matter: Omit<Matter, 'id'>) => {
    const { data, error } = await supabase
      .from('matters')
      .insert({
        case_id: matter.caseId,
        case_title: matter.caseTitle,
        case_type: matter.caseType,
        priority: matter.priority,
        dsm_submitted_date: matter.dsmSubmittedDate,
        suthe_received_date: matter.sutheReceivedDate,
        suthe_submitted_to_hu_date: matter.sutheSubmittedToHuDate || null,
        query_issued_date: matter.queryIssuedDate || null,
        query_response_date: matter.queryResponseDate || null,
        signed_date: matter.signedDate || null,
        query_status: matter.queryStatus,
        overall_status: matter.overallStatus,
        overall_sla_days: matter.overallSlaDays,
        sla_status: matter.slaStatus,
        remarks: matter.remarks || null,
        assigned_to: matter.assignedTo || null,
        external_link: matter.externalLink || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding matter:', error);
      throw error;
    }
    return data ? mapDbToMatter(data) : null;
  }, []);

  const updateMatter = useCallback(async (id: string, updates: Partial<Matter>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.caseId !== undefined) dbUpdates.case_id = updates.caseId;
    if (updates.caseTitle !== undefined) dbUpdates.case_title = updates.caseTitle;
    if (updates.caseType !== undefined) dbUpdates.case_type = updates.caseType;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.dsmSubmittedDate !== undefined) dbUpdates.dsm_submitted_date = updates.dsmSubmittedDate;
    if (updates.sutheReceivedDate !== undefined) dbUpdates.suthe_received_date = updates.sutheReceivedDate;
    if (updates.sutheSubmittedToHuDate !== undefined) dbUpdates.suthe_submitted_to_hu_date = updates.sutheSubmittedToHuDate || null;
    if (updates.queryIssuedDate !== undefined) dbUpdates.query_issued_date = updates.queryIssuedDate || null;
    if (updates.queryResponseDate !== undefined) dbUpdates.query_response_date = updates.queryResponseDate || null;
    if (updates.signedDate !== undefined) dbUpdates.signed_date = updates.signedDate || null;
    if (updates.queryStatus !== undefined) dbUpdates.query_status = updates.queryStatus;
    if (updates.overallStatus !== undefined) dbUpdates.overall_status = updates.overallStatus;
    if (updates.overallSlaDays !== undefined) dbUpdates.overall_sla_days = updates.overallSlaDays;
    if (updates.slaStatus !== undefined) dbUpdates.sla_status = updates.slaStatus;
    if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks || null;
    if (updates.externalLink !== undefined) dbUpdates.external_link = updates.externalLink || null;

    const { error } = await supabase
      .from('matters')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating matter:', error);
      throw error;
    }
  }, []);

  const deleteMatter = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('matters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting matter:', error);
      throw error;
    }
  }, []);

  const getExistingCaseIds = useCallback(() => {
    return matters.map(m => ({ id: m.caseId, title: m.caseTitle }));
  }, [matters]);

  return {
    matters,
    filteredMatters,
    filters,
    setFilters,
    stats,
    addMatter,
    updateMatter,
    deleteMatter,
    getExistingCaseIds,
    loading,
    refreshMatters: fetchMatters,
  };
}
