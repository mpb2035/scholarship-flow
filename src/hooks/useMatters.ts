import { useState, useMemo, useCallback } from 'react';
import { Matter, DashboardStats, OverallStatus, Priority, CaseType, SLAStatus } from '@/types/matter';
import { initialMatters } from '@/data/sampleData';

export interface Filters {
  status: OverallStatus | 'all';
  priority: Priority | 'all';
  caseType: CaseType | 'all';
  slaStatus: SLAStatus | 'all';
  search: string;
}

export function useMatters() {
  const [matters, setMatters] = useState<Matter[]>(initialMatters);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    priority: 'all',
    caseType: 'all',
    slaStatus: 'all',
    search: '',
  });

  const filteredMatters = useMemo(() => {
    return matters.filter((matter) => {
      if (filters.status !== 'all' && matter.overallStatus !== filters.status) return false;
      if (filters.priority !== 'all' && matter.priority !== filters.priority) return false;
      if (filters.caseType !== 'all' && matter.caseType !== filters.caseType) return false;
      if (filters.slaStatus !== 'all' && matter.slaStatus !== filters.slaStatus) return false;
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
        m.overallStatus.includes('DSM to Respond') || m.overallStatus === 'Returned for Query'
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
      dsmToRespondSutHe: matters.filter(m => m.overallStatus === 'DSM to Respond – SUT HE Query').length,
      dsmToRespondHigherUp: matters.filter(m => m.overallStatus === 'DSM to Respond – Higher Up Query').length,
      pendingHigherUp: matters.filter(m => m.overallStatus === 'Pending Higher Up Approval').length,
    };
  }, [matters]);

  const addMatter = useCallback((matter: Omit<Matter, 'id'>) => {
    const newMatter: Matter = {
      ...matter,
      id: Date.now().toString(),
    };
    setMatters(prev => [...prev, newMatter]);
    return newMatter;
  }, []);

  const updateMatter = useCallback((id: string, updates: Partial<Matter>) => {
    setMatters(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteMatter = useCallback((id: string) => {
    setMatters(prev => prev.filter(m => m.id !== id));
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
  };
}
