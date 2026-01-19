import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AttachmentOverseas {
  id: string;
  matterId: string;
  institution: 'PB' | 'IBTE';
  programmes: string[];
  programStartDate: string;
  programEndDate: string;
  fundingType: 'Self Funded' | 'Organizer Funded';
  country: string;
  destinationInstitution: string;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DbAttachmentOverseas {
  id: string;
  matter_id: string;
  institution: string;
  programmes: string[];
  program_start_date: string;
  program_end_date: string;
  funding_type: string;
  country: string;
  destination_institution: string;
  student_count: number;
  created_at: string;
  updated_at: string;
}

const mapDbToAttachmentOverseas = (db: DbAttachmentOverseas): AttachmentOverseas => ({
  id: db.id,
  matterId: db.matter_id,
  institution: db.institution as 'PB' | 'IBTE',
  programmes: db.programmes || [],
  programStartDate: db.program_start_date,
  programEndDate: db.program_end_date,
  fundingType: db.funding_type as 'Self Funded' | 'Organizer Funded',
  country: db.country,
  destinationInstitution: db.destination_institution,
  studentCount: db.student_count,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export interface AttachmentStats {
  totalProgrammes: number;
  activeProgrammes: number;
  studentsCurrentlyOverseas: number;
  returnedToBrunei: number;
  pbCount: number;
  ibteCount: number;
  programmeBreakdown: { programme: string; studentCount: number; daysRemaining: number; isActive: boolean }[];
  byInstitution: { institution: string; count: number; studentCount: number }[];
  byCountry: { country: string; count: number }[];
}

export function useAttachmentOverseas() {
  const [attachments, setAttachments] = useState<AttachmentOverseas[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAttachments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attachment_overseas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attachment overseas:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attachment overseas data.',
        variant: 'destructive',
      });
    } else {
      setAttachments((data || []).map(mapDbToAttachmentOverseas));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAttachments();

    const channel = supabase
      .channel('attachment-overseas-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attachment_overseas' },
        () => {
          fetchAttachments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAttachments]);

  const stats: AttachmentStats = useMemo(() => {
    const today = new Date();
    
    const activeProgrammes = attachments.filter(a => {
      const endDate = new Date(a.programEndDate);
      return endDate >= today;
    });

    const completedProgrammes = attachments.filter(a => {
      const endDate = new Date(a.programEndDate);
      return endDate < today;
    });

    const studentsCurrentlyOverseas = activeProgrammes.reduce((sum, a) => sum + a.studentCount, 0);
    const returnedToBrunei = completedProgrammes.reduce((sum, a) => sum + a.studentCount, 0);

    const pbAttachments = attachments.filter(a => a.institution === 'PB');
    const ibteAttachments = attachments.filter(a => a.institution === 'IBTE');

    // Programme breakdown with days remaining
    const programmeMap = new Map<string, { studentCount: number; endDate: Date; isActive: boolean }>();
    attachments.forEach(a => {
      a.programmes.forEach(prog => {
        const existing = programmeMap.get(prog);
        const endDate = new Date(a.programEndDate);
        const isActive = endDate >= today;
        if (existing) {
          programmeMap.set(prog, {
            studentCount: existing.studentCount + a.studentCount,
            endDate: existing.endDate > endDate ? existing.endDate : endDate,
            isActive: existing.isActive || isActive,
          });
        } else {
          programmeMap.set(prog, { studentCount: a.studentCount, endDate, isActive });
        }
      });
    });

    const programmeBreakdown = Array.from(programmeMap.entries()).map(([programme, data]) => ({
      programme,
      studentCount: data.studentCount,
      daysRemaining: Math.max(0, Math.ceil((data.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
      isActive: data.isActive,
    }));

    // By institution
    const byInstitution = [
      { institution: 'PB', count: pbAttachments.length, studentCount: pbAttachments.reduce((s, a) => s + a.studentCount, 0) },
      { institution: 'IBTE', count: ibteAttachments.length, studentCount: ibteAttachments.reduce((s, a) => s + a.studentCount, 0) },
    ];

    // By country
    const countryMap = new Map<string, number>();
    attachments.forEach(a => {
      countryMap.set(a.country, (countryMap.get(a.country) || 0) + 1);
    });
    const byCountry = Array.from(countryMap.entries()).map(([country, count]) => ({ country, count }));

    return {
      totalProgrammes: attachments.length,
      activeProgrammes: activeProgrammes.length,
      studentsCurrentlyOverseas,
      returnedToBrunei,
      pbCount: pbAttachments.length,
      ibteCount: ibteAttachments.length,
      programmeBreakdown,
      byInstitution,
      byCountry,
    };
  }, [attachments]);

  const addAttachment = useCallback(async (data: Omit<AttachmentOverseas, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: result, error } = await supabase
      .from('attachment_overseas')
      .insert({
        matter_id: data.matterId,
        institution: data.institution,
        programmes: data.programmes,
        program_start_date: data.programStartDate,
        program_end_date: data.programEndDate,
        funding_type: data.fundingType,
        country: data.country,
        destination_institution: data.destinationInstitution,
        student_count: data.studentCount,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding attachment overseas:', error);
      throw error;
    }
    return result ? mapDbToAttachmentOverseas(result) : null;
  }, []);

  const updateAttachment = useCallback(async (id: string, updates: Partial<AttachmentOverseas>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.institution !== undefined) dbUpdates.institution = updates.institution;
    if (updates.programmes !== undefined) dbUpdates.programmes = updates.programmes;
    if (updates.programStartDate !== undefined) dbUpdates.program_start_date = updates.programStartDate;
    if (updates.programEndDate !== undefined) dbUpdates.program_end_date = updates.programEndDate;
    if (updates.fundingType !== undefined) dbUpdates.funding_type = updates.fundingType;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.destinationInstitution !== undefined) dbUpdates.destination_institution = updates.destinationInstitution;
    if (updates.studentCount !== undefined) dbUpdates.student_count = updates.studentCount;

    const { error } = await supabase
      .from('attachment_overseas')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating attachment overseas:', error);
      throw error;
    }
  }, []);

  const deleteAttachment = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('attachment_overseas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting attachment overseas:', error);
      throw error;
    }
  }, []);

  const getByMatterId = useCallback((matterId: string) => {
    return attachments.find(a => a.matterId === matterId);
  }, [attachments]);

  return {
    attachments,
    stats,
    loading,
    addAttachment,
    updateAttachment,
    deleteAttachment,
    getByMatterId,
    refreshAttachments: fetchAttachments,
  };
}
