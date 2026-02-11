import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FolderKanban, Plus, Link2, CalendarClock } from 'lucide-react';
import { Matter, CaseType, Priority, OverallStatus, QueryStatus, SLAStatus } from '@/types/matter';
import { Project } from '@/hooks/useProjects';
import { AttachmentOverseasFields } from './AttachmentOverseasFields';
import { useAttachmentOverseas } from '@/hooks/useAttachmentOverseas';

const formSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  caseTitle: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  caseType: z.string().min(1, 'Case type is required'),
  receivedFrom: z.string().optional(),
  suthePassToDepartment: z.string().optional(),
  suthePassToDepartmentDate: z.string().optional(),
  priority: z.string().min(1, 'Priority is required'),
  dsmSubmittedDate: z.string().min(1, 'Submission date is required'),
  sutheReceivedDate: z.string().min(1, 'Received date is required'),
  sutheSubmittedToHuDate: z.string().optional(),
  huReturnedToSutheDate: z.string().optional(),
  queryIssuedDate: z.string().optional(),
  queryResponseDate: z.string().optional(),
  secondQueryStatus: z.string(),
  secondQueryIssuedDate: z.string().optional(),
  secondQueryResponseDate: z.string().optional(),
  secondSutheSubmittedToHuDate: z.string().optional(),
  signedDate: z.string().optional(),
  deadline: z.string().optional(),
  queryStatus: z.string(),
  overallStatus: z.string(),
  remarks: z.string().optional(),
  externalLink: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  // Attachment Overseas fields
  attachmentInstitution: z.string().optional(),
  attachmentProgrammes: z.array(z.string()).optional(),
  attachmentStartDate: z.string().optional(),
  attachmentEndDate: z.string().optional(),
  attachmentFundingType: z.string().optional(),
  attachmentCountry: z.string().optional(),
  attachmentDestination: z.string().optional(),
  attachmentStudentCount: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MatterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matter?: Matter;
  existingCaseIds: { id: string; title: string }[];
  onSubmit: (data: Omit<Matter, 'id'>) => void;
  projects?: Project[];
  onLinkProject?: (matterId: string | undefined, projectId: string) => void;
  onCreateProject?: (matterData: { caseId: string; caseTitle: string; caseType: string; priority: string; overallStatus: string }) => Promise<Project | undefined>;
  linkedProjectId?: string;
}

const caseTypes: CaseType[] = [
  'Ministerial Inquiry',
  'Event Coordination',
  'Policy Review',
  'Budget Proposal',
  'Cross-Agency Project',
  'Scholarship Award',
  'Extension Scholarship',
  'Manpower Blueprint',
  'Attachment Overseas',
  'BPTV',
  'TVET Scheme',
  'HECAS',
  'Greening Education Plan',
  'SUSLR',
  'MKPK',
  'Other',
];

const priorities: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];

const queryStatuses: QueryStatus[] = ['No Query', 'Query Issued', 'Query Resolved'];

const overallStatuses: OverallStatus[] = [
  'Pending SUT HE Review',
  'In Process',
  'Dept to Respond – SUT HE Query',
  'Dept to Respond – Higher Up Query',
  'SUT HE Submitted to HU',
  'Pending Higher Up Approval',
  'Returned for Query',
  'Approved & Signed',
  'Not Approved',
];

export function MatterForm({ open, onOpenChange, matter, existingCaseIds, onSubmit, projects = [], onLinkProject, onCreateProject, linkedProjectId }: MatterFormProps) {
  const [useExisting, setUseExisting] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const { getByMatterId } = useAttachmentOverseas();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseId: '',
      caseTitle: '',
      caseType: '',
      priority: 'Medium',
      dsmSubmittedDate: new Date().toISOString().split('T')[0],
      sutheReceivedDate: new Date().toISOString().split('T')[0],
      queryStatus: 'No Query',
      secondQueryStatus: 'No Query',
      overallStatus: 'Pending SUT HE Review',
      remarks: '',
      externalLink: '',
      deadline: '',
      attachmentProgrammes: [],
      attachmentStudentCount: 1,
    },
  });

  const watchCaseType = form.watch('caseType');
  const watchSecondQueryStatus = form.watch('secondQueryStatus');
  const attachmentPrefillRef = useRef<string | null>(null);

  useEffect(() => {
    // reset per-open so we can prefill again if user reopens the dialog
    if (!open) {
      attachmentPrefillRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (matter) {
      form.reset({
        caseId: matter.caseId,
        caseTitle: matter.caseTitle,
        caseType: matter.caseType,
        receivedFrom: matter.receivedFrom || '',
        suthePassToDepartment: matter.suthePassToDepartment || '',
        suthePassToDepartmentDate: matter.suthePassToDepartmentDate || '',
        priority: matter.priority,
        dsmSubmittedDate: matter.dsmSubmittedDate,
        sutheReceivedDate: matter.sutheReceivedDate,
        sutheSubmittedToHuDate: matter.sutheSubmittedToHuDate,
        huReturnedToSutheDate: matter.huReturnedToSutheDate,
        queryIssuedDate: matter.queryIssuedDate,
        queryResponseDate: matter.queryResponseDate,
        secondQueryStatus: matter.secondQueryStatus || 'No Query',
        secondQueryIssuedDate: matter.secondQueryIssuedDate,
        secondQueryResponseDate: matter.secondQueryResponseDate,
        secondSutheSubmittedToHuDate: matter.secondSutheSubmittedToHuDate,
        signedDate: matter.signedDate,
        deadline: matter.deadline || '',
        queryStatus: matter.queryStatus,
        overallStatus: matter.overallStatus,
        remarks: matter.remarks,
        externalLink: matter.externalLink || '',
      });
    } else {
      form.reset();
    }
  }, [matter, form]);

  useEffect(() => {
    if (linkedProjectId) {
      setSelectedProjectId(linkedProjectId);
    } else {
      setSelectedProjectId('');
    }
  }, [linkedProjectId, open]);

  useEffect(() => {
    if (useExisting && selectedExisting) {
      const existing = existingCaseIds.find(c => c.id === selectedExisting);
      if (existing) {
        form.setValue('caseId', existing.id);
        form.setValue('caseTitle', existing.title);
      }
    }
  }, [useExisting, selectedExisting, existingCaseIds, form]);

  useEffect(() => {
    if (!open) return;
    if (!matter) return;
    if (matter.caseType !== 'Attachment Overseas') return;

    // Only prefill once per dialog open to avoid overwriting in-progress edits
    if (attachmentPrefillRef.current === matter.id) return;

    const existing = getByMatterId(matter.id);
    if (!existing) return;

    attachmentPrefillRef.current = matter.id;

    form.setValue('attachmentInstitution', existing.institution, { shouldDirty: false });
    form.setValue('attachmentProgrammes', existing.programmes || [], { shouldDirty: false });
    form.setValue('attachmentStartDate', existing.programStartDate, { shouldDirty: false });
    form.setValue('attachmentEndDate', existing.programEndDate, { shouldDirty: false });
    form.setValue('attachmentFundingType', existing.fundingType, { shouldDirty: false });
    form.setValue('attachmentCountry', existing.country || '', { shouldDirty: false });
    form.setValue('attachmentDestination', existing.destinationInstitution || '', { shouldDirty: false });
    form.setValue('attachmentStudentCount', existing.studentCount || 1, { shouldDirty: false });
  }, [open, matter, getByMatterId, form]);

  const calculateDaysInProcess = (submittedDate: string): number => {
    const submitted = new Date(submittedDate);
    const today = new Date();
    return Math.floor((today.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateSLAStatus = (daysInProcess: number, priority: Priority): SLAStatus => {
    const slaDays = priority === 'Urgent' ? 3 : priority === 'High' ? 7 : priority === 'Medium' ? 14 : 21;
    if (daysInProcess > slaDays) return 'Overdue';
    if (daysInProcess >= slaDays * 0.9) return 'Critical';
    if (daysInProcess >= slaDays * 0.8) return 'At Risk';
    return 'Within SLA';
  };

  const handleSubmit = async (data: FormData) => {
    const daysInProcess = calculateDaysInProcess(data.dsmSubmittedDate);
    const slaStatus = data.overallStatus === 'Approved & Signed' 
      ? 'Completed' 
      : calculateSLAStatus(daysInProcess, data.priority as Priority);

    // Calculate days from SUT HE received to submitted to HU
    const daysSutHeToHu = data.sutheSubmittedToHuDate && data.sutheReceivedDate
      ? Math.floor((new Date(data.sutheSubmittedToHuDate).getTime() - new Date(data.sutheReceivedDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate query days pending based on status
    let queryDaysPendingSutHe = 0;
    let queryDaysPendingHigherUp = 0;
    if (data.queryIssuedDate && !data.queryResponseDate) {
      const queryDays = Math.floor((new Date().getTime() - new Date(data.queryIssuedDate).getTime()) / (1000 * 60 * 60 * 24));
      if (data.overallStatus === 'Dept to Respond – SUT HE Query') {
        queryDaysPendingSutHe = queryDays;
      } else if (data.overallStatus === 'Dept to Respond – Higher Up Query') {
        queryDaysPendingHigherUp = queryDays;
      }
    }

    const slaDays = data.priority === 'Urgent' ? 3 : data.priority === 'High' ? 7 : data.priority === 'Medium' ? 14 : 21;

    // Store attachment data for after matter is created/updated
    if (data.caseType === 'Attachment Overseas') {
      const attachmentData = {
        institution: data.attachmentInstitution || '',
        programmes: data.attachmentProgrammes || [],
        programStartDate: data.attachmentStartDate || '',
        programEndDate: data.attachmentEndDate || '',
        fundingType: data.attachmentFundingType || '',
        country: data.attachmentCountry || '',
        destinationInstitution: data.attachmentDestination || '',
        studentCount: data.attachmentStudentCount || 1,
      };

      sessionStorage.setItem('pendingAttachmentOverseas', JSON.stringify(attachmentData));
    }

    onSubmit({
      caseId: data.caseId,
      caseTitle: data.caseTitle,
      caseType: data.caseType as CaseType,
      receivedFrom: data.receivedFrom || undefined,
      suthePassToDepartment: data.suthePassToDepartment || undefined,
      suthePassToDepartmentDate: data.suthePassToDepartmentDate || undefined,
      priority: data.priority as Priority,
      dsmSubmittedDate: data.dsmSubmittedDate,
      sutheReceivedDate: data.sutheReceivedDate,
      sutheSubmittedToHuDate: data.sutheSubmittedToHuDate,
      huReturnedToSutheDate: data.huReturnedToSutheDate,
      queryIssuedDate: data.queryIssuedDate,
      queryResponseDate: data.queryResponseDate,
      secondQueryStatus: data.secondQueryStatus as QueryStatus,
      secondQueryIssuedDate: data.secondQueryIssuedDate,
      secondQueryResponseDate: data.secondQueryResponseDate,
      secondSutheSubmittedToHuDate: data.secondSutheSubmittedToHuDate,
      signedDate: data.signedDate,
      queryStatus: data.queryStatus as QueryStatus,
      overallStatus: data.overallStatus as OverallStatus,
      daysInProcess,
      daysSutHeToHu,
      daysSecondSutHeToHu: data.sutheSubmittedToHuDate && data.secondSutheSubmittedToHuDate
        ? Math.floor((new Date(data.secondSutheSubmittedToHuDate).getTime() - new Date(data.sutheSubmittedToHuDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      queryDaysPendingSutHe,
      queryDaysPendingHigherUp,
      overallSlaDays: slaDays,
      slaStatus,
      remarks: data.remarks,
      externalLink: data.externalLink || undefined,
      deadline: data.deadline || undefined,
    });

    form.reset();
    setUseExisting(false);
    setSelectedExisting('');
    onOpenChange(false);
  };

  const generateNewCaseId = () => {
    const year = new Date().getFullYear();
    const existingCount = existingCaseIds.filter(c => c.id.includes(year.toString())).length;
    return `SUTHE-${year}-${String(existingCount + 1).padStart(4, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border scrollbar-gold">
        <DialogHeader>
          <DialogTitle className="font-display text-xl gold-text">
            {matter ? 'Update Matter' : 'Log New Matter'}
          </DialogTitle>
        </DialogHeader>

        {!matter && existingCaseIds.length > 0 && (
          <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg mb-4">
            <Switch
              id="use-existing"
              checked={useExisting}
              onCheckedChange={setUseExisting}
            />
            <Label htmlFor="use-existing" className="text-sm">
              Update existing matter (avoid duplication)
            </Label>
          </div>
        )}

        {useExisting && (
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground mb-2 block">
              Select Existing Matter
            </Label>
            <Select value={selectedExisting} onValueChange={setSelectedExisting}>
              <SelectTrigger className="bg-input border-border/50">
                <SelectValue placeholder="Choose a matter to update..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[200px]">
                {existingCaseIds.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="font-mono text-primary">{c.id}</span>
                    <span className="text-muted-foreground ml-2">- {c.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="caseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case ID</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          {...field} 
                          className="bg-input border-border/50 font-mono"
                          disabled={useExisting}
                        />
                        {!matter && !useExisting && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.setValue('caseId', generateNewCaseId())}
                            className="whitespace-nowrap"
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        {caseTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="caseTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Title</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-input border-border/50"
                      disabled={useExisting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Received From */}
            <FormField
              control={form.control}
              name="receivedFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Received From</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select source..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Department">Department</SelectItem>
                      <SelectItem value="Higher Up">Higher Up</SelectItem>
                      <SelectItem value="Other Agency">Other Agency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SUT HE Pass to Department + Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="suthePassToDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SUT HE Pass to Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border max-h-[200px]">
                        <SelectItem value="Jabatan Pentadbiran dan Perkhidmatan-perkhidmatan">Jabatan Pentadbiran dan Perkhidmatan-perkhidmatan</SelectItem>
                        <SelectItem value="Jabatan Sekolah-sekolah">Jabatan Sekolah-sekolah</SelectItem>
                        <SelectItem value="Jabatan Peperiksaan">Jabatan Peperiksaan</SelectItem>
                        <SelectItem value="Jabatan Perancangan dan Pengurusan Dasar Pendidikan">Jabatan Perancangan dan Pengurusan Dasar Pendidikan</SelectItem>
                        <SelectItem value="Jabatan Kurikulum">Jabatan Kurikulum</SelectItem>
                        <SelectItem value="Jabatan Teknologi Maklumat dan Komunikasi">Jabatan Teknologi Maklumat dan Komunikasi</SelectItem>
                        <SelectItem value="Jabatan Pengajian Tinggi">Jabatan Pengajian Tinggi</SelectItem>
                        <SelectItem value="Jabatan Pendidikan Teknik">Jabatan Pendidikan Teknik</SelectItem>
                        <SelectItem value="Institut Pendidikan Teknik Brunei (IBTE)">Institut Pendidikan Teknik Brunei (IBTE)</SelectItem>
                        <SelectItem value="Universiti Brunei Darussalam (UBD)">Universiti Brunei Darussalam (UBD)</SelectItem>
                        <SelectItem value="Universiti Teknologi Brunei (UTB)">Universiti Teknologi Brunei (UTB)</SelectItem>
                        <SelectItem value="Universiti Islam Sultan Sharif Ali (UNISSA)">Universiti Islam Sultan Sharif Ali (UNISSA)</SelectItem>
                        <SelectItem value="Politeknik Brunei (PB)">Politeknik Brunei (PB)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="suthePassToDepartmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Passed to Department</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional Attachment Overseas Fields */}
            {watchCaseType === 'Attachment Overseas' && (
              <AttachmentOverseasFields form={form} />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overallStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        {overallStatuses.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dsmSubmittedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submitted Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sutheReceivedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sutheSubmittedToHuDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SUT HE Submitted to HU Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="huReturnedToSutheDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HU Returned to SUT HE Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="queryStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Query Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        {queryStatuses.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="queryIssuedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Query Issued Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="queryResponseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Query Response Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Second Query Row */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="secondQueryStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Query Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        {queryStatuses.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondQueryIssuedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Query Issued Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondQueryResponseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Query Response Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Second SUT HE Submitted to HU Date - only shown when there's a second query */}
            {watchSecondQueryStatus && watchSecondQueryStatus !== 'No Query' && (
              <FormField
                control={form.control}
                name="secondSutheSubmittedToHuDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second SUT HE Submitted to HU Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="signedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signed Date (if approved)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-warning" />
                      Deadline
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="bg-input border-border/50 min-h-[80px]"
                      placeholder="Any additional notes..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    External Link
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="url"
                      className="bg-input border-border/50"
                      placeholder="https://example.com/document"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Workflow Section */}
            <div className="border-t border-border/50 pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <FolderKanban className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Project Workflow</h3>
              </div>
              
              {selectedProjectId && projects.find(p => p.id === selectedProjectId) ? (
                <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{projects.find(p => p.id === selectedProjectId)?.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {projects.find(p => p.id === selectedProjectId)?.status}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProjectId('')}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Unlink
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Link to Existing Project
                      </Label>
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue placeholder="Select a project..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border max-h-[200px]">
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <span className="font-medium">{project.title}</span>
                              <span className="text-muted-foreground ml-2">({project.status})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          if (onCreateProject) {
                            setIsCreatingProject(true);
                            try {
                              const formValues = form.getValues();
                              const newProject = await onCreateProject({
                                caseId: formValues.caseId,
                                caseTitle: formValues.caseTitle,
                                caseType: formValues.caseType,
                                priority: formValues.priority,
                                overallStatus: formValues.overallStatus,
                              });
                              if (newProject) {
                                setSelectedProjectId(newProject.id);
                              }
                            } finally {
                              setIsCreatingProject(false);
                            }
                          }
                        }}
                        disabled={isCreatingProject || !form.getValues().caseId}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isCreatingProject ? 'Creating...' : 'Create New Project'}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Link this matter to a project to track tasks, notes, and progress in the Project Workflow tab.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  if (selectedProjectId && onLinkProject && matter?.id) {
                    onLinkProject(matter.id, selectedProjectId);
                  }
                }}
              >
                {matter ? 'Update Matter' : 'Log Matter'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
