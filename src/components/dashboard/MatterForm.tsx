import { useEffect, useState } from 'react';
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
import { Matter, CaseType, Priority, OverallStatus, QueryStatus, SLAStatus } from '@/types/matter';

const formSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  caseTitle: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  caseType: z.string().min(1, 'Case type is required'),
  priority: z.string().min(1, 'Priority is required'),
  dsmSubmittedDate: z.string().min(1, 'Submission date is required'),
  sutheReceivedDate: z.string().min(1, 'Received date is required'),
  queryIssuedDate: z.string().optional(),
  queryResponseDate: z.string().optional(),
  signedDate: z.string().optional(),
  queryStatus: z.string(),
  overallStatus: z.string(),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MatterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matter?: Matter;
  existingCaseIds: { id: string; title: string }[];
  onSubmit: (data: Omit<Matter, 'id'>) => void;
}

const caseTypes: CaseType[] = [
  'Ministerial Inquiry',
  'Event Coordination',
  'Policy Review',
  'Budget Proposal',
  'Cross-Agency Project',
  'Scholarship Award',
  'Other',
];

const priorities: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];

const queryStatuses: QueryStatus[] = ['No Query', 'Query Issued', 'Query Resolved'];

const overallStatuses: OverallStatus[] = [
  'Pending SUT HE Review',
  'In Process',
  'DSM to Respond – SUT HE Query',
  'DSM to Respond – Higher Up Query',
  'Pending Higher Up Approval',
  'Returned for Query',
  'Approved & Signed',
  'Not Approved',
];

export function MatterForm({ open, onOpenChange, matter, existingCaseIds, onSubmit }: MatterFormProps) {
  const [useExisting, setUseExisting] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState('');

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
      overallStatus: 'Pending SUT HE Review',
      remarks: '',
    },
  });

  useEffect(() => {
    if (matter) {
      form.reset({
        caseId: matter.caseId,
        caseTitle: matter.caseTitle,
        caseType: matter.caseType,
        priority: matter.priority,
        dsmSubmittedDate: matter.dsmSubmittedDate,
        sutheReceivedDate: matter.sutheReceivedDate,
        queryIssuedDate: matter.queryIssuedDate,
        queryResponseDate: matter.queryResponseDate,
        signedDate: matter.signedDate,
        queryStatus: matter.queryStatus,
        overallStatus: matter.overallStatus,
        remarks: matter.remarks,
      });
    } else {
      form.reset();
    }
  }, [matter, form]);

  useEffect(() => {
    if (useExisting && selectedExisting) {
      const existing = existingCaseIds.find(c => c.id === selectedExisting);
      if (existing) {
        form.setValue('caseId', existing.id);
        form.setValue('caseTitle', existing.title);
      }
    }
  }, [useExisting, selectedExisting, existingCaseIds, form]);

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

  const handleSubmit = (data: FormData) => {
    const daysInProcess = calculateDaysInProcess(data.dsmSubmittedDate);
    const slaStatus = data.overallStatus === 'Approved & Signed' 
      ? 'Completed' 
      : calculateSLAStatus(daysInProcess, data.priority as Priority);

    const queryDaysPending = data.queryIssuedDate && !data.queryResponseDate
      ? Math.floor((new Date().getTime() - new Date(data.queryIssuedDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const slaDays = data.priority === 'Urgent' ? 3 : data.priority === 'High' ? 7 : data.priority === 'Medium' ? 14 : 21;

    onSubmit({
      caseId: data.caseId,
      caseTitle: data.caseTitle,
      caseType: data.caseType as CaseType,
      priority: data.priority as Priority,
      dsmSubmittedDate: data.dsmSubmittedDate,
      sutheReceivedDate: data.sutheReceivedDate,
      queryIssuedDate: data.queryIssuedDate,
      queryResponseDate: data.queryResponseDate,
      signedDate: data.signedDate,
      queryStatus: data.queryStatus as QueryStatus,
      overallStatus: data.overallStatus as OverallStatus,
      daysInProcess,
      queryDaysPending,
      overallSlaDays: slaDays,
      slaStatus,
      remarks: data.remarks,
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
                    <FormLabel>DSM Submitted Date</FormLabel>
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
                    <FormLabel>SUT HE Received Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-input border-border/50" />
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

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {matter ? 'Update Matter' : 'Log Matter'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
