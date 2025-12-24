import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Matter } from '@/types/matter';
import { Calendar, Clock, AlertTriangle, CheckCircle, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatterDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matter: Matter | null;
}

export function MatterDetail({ open, onOpenChange, matter }: MatterDetailProps) {
  const [showExternalLinkConfirm, setShowExternalLinkConfirm] = useState(false);

  if (!matter) return null;

  const handleExternalLinkClick = () => {
    setShowExternalLinkConfirm(true);
  };

  const handleConfirmExternalLink = () => {
    if (matter.externalLink) {
      window.open(matter.externalLink, '_blank', 'noopener,noreferrer');
    }
    setShowExternalLinkConfirm(false);
  };

  const getSlaStatusStyle = (status: string) => {
    switch (status) {
      case 'Within SLA':
        return 'bg-success/20 text-success border-success/30';
      case 'At Risk':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'Critical':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Overdue':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl gold-text flex items-center gap-3">
            <FileText className="h-5 w-5" />
            {matter.caseId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">{matter.caseTitle}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-secondary/30">
                {matter.caseType}
              </Badge>
              <Badge variant="outline" className={getPriorityStyle(matter.priority)}>
                {matter.priority}
              </Badge>
              <Badge variant="outline" className={getSlaStatusStyle(matter.slaStatus)}>
                {matter.slaStatus}
              </Badge>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Timeline
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dept Submitted</p>
                    <p className="font-medium">{formatDate(matter.dsmSubmittedDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">SUT HE Received</p>
                    <p className="font-medium">{formatDate(matter.sutheReceivedDate)}</p>
                  </div>
                </div>

                {matter.sutheSubmittedToHuDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">SUT HE Submitted to HU</p>
                      <p className="font-medium">{formatDate(matter.sutheSubmittedToHuDate)}</p>
                    </div>
                  </div>
                )}

                {matter.queryIssuedDate && (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-xs text-muted-foreground">Query Issued</p>
                      <p className="font-medium">{formatDate(matter.queryIssuedDate)}</p>
                    </div>
                  </div>
                )}

                {matter.queryResponseDate && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-xs text-muted-foreground">Query Response</p>
                      <p className="font-medium">{formatDate(matter.queryResponseDate)}</p>
                    </div>
                  </div>
                )}

                {matter.signedDate && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-xs text-muted-foreground">Signed</p>
                      <p className="font-medium">{formatDate(matter.signedDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Status & SLA
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    matter.slaStatus === 'Overdue' ? 'bg-destructive animate-pulse' :
                    matter.slaStatus === 'Critical' ? 'bg-orange-500 animate-pulse' :
                    matter.slaStatus === 'At Risk' ? 'bg-warning' : 'bg-success'
                  )} />
                  <div>
                    <p className="text-xs text-muted-foreground">Current Status</p>
                    <p className="font-medium">{matter.overallStatus}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Days in Process</p>
                    <p className={cn(
                      'font-mono font-bold text-lg',
                      matter.daysInProcess > 30 ? 'text-destructive' :
                      matter.daysInProcess > 14 ? 'text-warning' : 'text-foreground'
                    )}>
                      {matter.daysInProcess}
                    </p>
                  </div>
                </div>

                {matter.daysSutHeToHu > 0 && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Days SUT HE to HU</p>
                      <p className="font-mono font-bold text-lg">
                        {matter.daysSutHeToHu}
                      </p>
                    </div>
                  </div>
                )}

                {matter.queryDaysPendingSutHe > 0 && (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-xs text-muted-foreground">Query Pending (SUT HE)</p>
                      <p className="font-mono font-bold text-lg text-warning">
                        {matter.queryDaysPendingSutHe} days
                      </p>
                    </div>
                  </div>
                )}

                {matter.queryDaysPendingHigherUp > 0 && (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">Query Pending (Higher Up)</p>
                      <p className="font-mono font-bold text-lg text-orange-400">
                        {matter.queryDaysPendingHigherUp} days
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">SLA Target</p>
                    <p className="font-medium">{matter.overallSlaDays} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {matter.remarks && (
            <>
              <Separator className="bg-border/50" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Remarks
                </h4>
                <p className="text-sm text-foreground/80">{matter.remarks}</p>
              </div>
            </>
          )}

          {matter.externalLink && (
            <>
              <Separator className="bg-border/50" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  External Link
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleExternalLinkClick}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open External Resource
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={showExternalLinkConfirm} onOpenChange={setShowExternalLinkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You are leaving this dashboard</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to navigate to an external website. This link will open in a new tab.
              <br />
              <span className="text-xs text-muted-foreground mt-2 block break-all">
                {matter.externalLink}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExternalLink}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
