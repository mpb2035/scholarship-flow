import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface DuplicateGroup {
  matterId: string;
  records: {
    id: string;
    createdAt: string;
    institution: string;
    programmes: string[];
    keep: boolean;
  }[];
}

interface AuditLogEntry {
  id: string;
  matterId: string;
  institution: string;
  createdAt: string;
  deletedAt: string;
}

export function AttachmentCleanupDialog({ onCleanupComplete }: { onCleanupComplete?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [cleanupDone, setCleanupDone] = useState(false);
  const { toast } = useToast();

  const scanForDuplicates = async () => {
    setScanning(true);
    setCleanupDone(false);
    setAuditLog([]);

    try {
      const { data, error } = await supabase
        .from('attachment_overseas')
        .select('id, matter_id, institution, programmes, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by matter_id
      const grouped = new Map<string, typeof data>();
      (data || []).forEach((record) => {
        const existing = grouped.get(record.matter_id) || [];
        existing.push(record);
        grouped.set(record.matter_id, existing);
      });

      // Find duplicates (matter_id with more than 1 record)
      const duplicateGroups: DuplicateGroup[] = [];
      grouped.forEach((records, matterId) => {
        if (records.length > 1) {
          duplicateGroups.push({
            matterId,
            records: records.map((r, idx) => ({
              id: r.id,
              createdAt: r.created_at,
              institution: r.institution,
              programmes: r.programmes || [],
              keep: idx === 0, // Keep the newest (first since ordered desc)
            })),
          });
        }
      });

      setDuplicates(duplicateGroups);
    } catch (err) {
      console.error('Error scanning for duplicates:', err);
      toast({
        title: 'Scan Failed',
        description: 'Could not scan for duplicates.',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  const performCleanup = async () => {
    setLoading(true);
    const deletedRecords: AuditLogEntry[] = [];

    try {
      for (const group of duplicates) {
        const toDelete = group.records.filter((r) => !r.keep);
        for (const record of toDelete) {
          const { error } = await supabase
            .from('attachment_overseas')
            .delete()
            .eq('id', record.id);

          if (error) {
            console.error(`Failed to delete ${record.id}:`, error);
          } else {
            deletedRecords.push({
              id: record.id,
              matterId: group.matterId,
              institution: record.institution,
              createdAt: record.createdAt,
              deletedAt: new Date().toISOString(),
            });
          }
        }
      }

      setAuditLog(deletedRecords);
      setCleanupDone(true);
      setDuplicates([]);

      toast({
        title: 'Cleanup Complete',
        description: `Removed ${deletedRecords.length} duplicate record(s).`,
      });

      onCleanupComplete?.();
    } catch (err) {
      console.error('Cleanup error:', err);
      toast({
        title: 'Cleanup Failed',
        description: 'An error occurred during cleanup.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      scanForDuplicates();
    }
  }, [open]);

  const totalDuplicates = duplicates.reduce(
    (sum, g) => sum + g.records.filter((r) => !r.keep).length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Cleanup Duplicates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Attachment Overseas Duplicate Cleanup
          </DialogTitle>
          <DialogDescription>
            This tool detects and removes duplicate Attachment Overseas records per matter,
            keeping only the newest entry for each.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {scanning ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Scanning for duplicates...
            </div>
          ) : cleanupDone ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Cleanup completed successfully!</span>
              </div>

              {auditLog.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Audit Log - Deleted Records:</h4>
                  <ScrollArea className="h-48 border rounded-md p-3">
                    <div className="space-y-2">
                      {auditLog.map((entry) => (
                        <div
                          key={entry.id}
                          className="text-xs p-2 bg-destructive/10 rounded border border-destructive/20"
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {entry.institution}
                            </Badge>
                            <span className="text-muted-foreground">
                              Deleted: {new Date(entry.deletedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-muted-foreground">
                            <span>ID: {entry.id.slice(0, 8)}...</span>
                            <span className="mx-2">|</span>
                            <span>Matter: {entry.matterId.slice(0, 8)}...</span>
                            <span className="mx-2">|</span>
                            <span>Created: {new Date(entry.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          ) : duplicates.length === 0 ? (
            <div className="flex items-center justify-center py-8 gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              No duplicates found! Your data is clean.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                <span>
                  Found <strong>{totalDuplicates}</strong> duplicate record(s) across{' '}
                  <strong>{duplicates.length}</strong> matter(s).
                </span>
              </div>

              <ScrollArea className="h-64 border rounded-md p-3">
                <div className="space-y-4">
                  {duplicates.map((group) => (
                    <div key={group.matterId} className="space-y-2">
                      <div className="text-sm font-medium">
                        Matter ID: {group.matterId.slice(0, 8)}...
                      </div>
                      <div className="space-y-1 pl-4">
                        {group.records.map((record) => (
                          <div
                            key={record.id}
                            className={`text-xs p-2 rounded flex items-center justify-between ${
                              record.keep
                                ? 'bg-green-500/10 border border-green-500/20'
                                : 'bg-destructive/10 border border-destructive/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={record.keep ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {record.keep ? 'KEEP' : 'DELETE'}
                              </Badge>
                              <span>{record.institution}</span>
                              <span className="text-muted-foreground">
                                ({record.programmes.join(', ') || 'No programmes'})
                              </span>
                            </div>
                            <span className="text-muted-foreground">
                              {new Date(record.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          {!cleanupDone && duplicates.length > 0 && (
            <Button
              variant="destructive"
              onClick={performCleanup}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete {totalDuplicates} Duplicate(s)
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => setOpen(false)}>
            {cleanupDone ? 'Close' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
