import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, CheckCircle2, XCircle, Info, ShieldAlert, Database, Wifi } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ErrorDetail {
  category: 'validation' | 'permission' | 'network' | 'database' | 'unknown';
  title: string;
  message: string;
  solutions: string[];
  technicalDetail?: string;
}

interface MatterErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: unknown;
  context: 'create' | 'update' | 'delete';
  matterData?: { caseId?: string; caseTitle?: string; caseType?: string };
}

function parseError(error: unknown, context: string, matterData?: { caseId?: string; caseTitle?: string; caseType?: string }): ErrorDetail {
  const errorMessage = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  const errorCode = (error as any)?.code;
  const errorDetails = (error as any)?.details;
  const errorHint = (error as any)?.hint;

  // RLS / Permission errors
  if (errorMessage.includes('row-level security') || errorMessage.includes('policy') || errorCode === '42501') {
    return {
      category: 'permission',
      title: 'Permission Denied',
      message: 'You do not have permission to perform this action. This is typically a row-level security restriction.',
      solutions: [
        'Ensure you are logged in with an authorized account.',
        'Your account may need admin privileges to create or modify matters.',
        'Try signing out and signing back in to refresh your session.',
        'Contact an administrator if the issue persists.',
      ],
      technicalDetail: `Code: ${errorCode || 'N/A'}\nMessage: ${errorMessage}${errorHint ? `\nHint: ${errorHint}` : ''}`,
    };
  }

  // Duplicate key / unique constraint
  if (errorMessage.includes('duplicate') || errorMessage.includes('unique') || errorCode === '23505') {
    const caseId = matterData?.caseId || 'this Case ID';
    return {
      category: 'database',
      title: 'Duplicate Entry',
      message: `A matter with ${caseId !== 'this Case ID' ? `Case ID "${caseId}"` : 'this identifier'} already exists in the system.`,
      solutions: [
        'Use the "Update existing matter" toggle to modify the existing record instead.',
        'Generate a new unique Case ID by clicking the "Generate" button.',
        'Search for the existing matter in the table and edit it directly.',
      ],
      technicalDetail: `Code: ${errorCode || '23505'}\n${errorDetails || errorMessage}`,
    };
  }

  // Not null constraint
  if (errorMessage.includes('not-null') || errorMessage.includes('null value') || errorCode === '23502') {
    const column = errorMessage.match(/column "(\w+)"/)?.[1] || 'a required field';
    const fieldMap: Record<string, string> = {
      case_id: 'Case ID',
      case_title: 'Case Title',
      case_type: 'Case Type',
      priority: 'Priority',
      dsm_submitted_date: 'DSM Submitted Date',
      suthe_received_date: 'SUT HE Received Date',
      overall_status: 'Overall Status',
      query_status: 'Query Status',
      sla_status: 'SLA Status',
    };
    const friendlyName = fieldMap[column] || column;
    return {
      category: 'validation',
      title: 'Missing Required Field',
      message: `The field "${friendlyName}" is required but was not provided or is empty.`,
      solutions: [
        `Fill in the "${friendlyName}" field before submitting.`,
        'Ensure all required fields (marked with *) are completed.',
        'If using "Update existing matter", make sure a matter is selected.',
      ],
      technicalDetail: `Code: ${errorCode || '23502'}\nColumn: ${column}\n${errorDetails || errorMessage}`,
    };
  }

  // Foreign key constraint
  if (errorMessage.includes('foreign key') || errorCode === '23503') {
    return {
      category: 'database',
      title: 'Invalid Reference',
      message: 'The matter references a record that no longer exists (e.g., a linked project or attachment was deleted).',
      solutions: [
        'Remove any linked project or attachment references and try again.',
        'Refresh the page to get the latest data.',
        'If the matter was linked to a deleted project, unlink it first.',
      ],
      technicalDetail: `Code: ${errorCode || '23503'}\n${errorDetails || errorMessage}`,
    };
  }

  // Check constraint
  if (errorMessage.includes('check') || errorCode === '23514') {
    return {
      category: 'validation',
      title: 'Invalid Data',
      message: 'One or more field values are outside the allowed range or format.',
      solutions: [
        'Ensure dates are in the correct format (YYYY-MM-DD).',
        'Check that SLA days is a positive number.',
        'Verify that the selected status and priority are valid options.',
      ],
      technicalDetail: `Code: ${errorCode || '23514'}\n${errorDetails || errorMessage}`,
    };
  }

  // Network / fetch errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return {
      category: 'network',
      title: 'Connection Error',
      message: 'Unable to reach the server. This could be a temporary network issue.',
      solutions: [
        'Check your internet connection.',
        'Wait a moment and try again.',
        'If using a VPN, try disconnecting and reconnecting.',
        'Clear your browser cache and reload the page.',
      ],
      technicalDetail: errorMessage,
    };
  }

  // Timeout
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      category: 'network',
      title: 'Request Timed Out',
      message: 'The server took too long to respond. This may be due to high load or a large operation.',
      solutions: [
        'Wait a moment and try submitting again.',
        'Check your internet connection speed.',
        'If the problem persists, try during off-peak hours.',
      ],
      technicalDetail: errorMessage,
    };
  }

  // Auth expired
  if (errorMessage.includes('JWT') || errorMessage.includes('token') || errorMessage.includes('expired') || errorCode === 'PGRST301') {
    return {
      category: 'permission',
      title: 'Session Expired',
      message: 'Your login session has expired. You need to sign in again.',
      solutions: [
        'Click "Sign Out" and sign back in.',
        'Refresh the page — it may automatically restore your session.',
        'If the issue persists, clear your browser cookies and try again.',
      ],
      technicalDetail: `Code: ${errorCode || 'N/A'}\n${errorMessage}`,
    };
  }

  // Generic fallback
  return {
    category: 'unknown',
    title: `Failed to ${context === 'create' ? 'Log New Matter' : context === 'update' ? 'Update Matter' : 'Delete Matter'}`,
    message: errorMessage || 'An unexpected error occurred while saving the matter.',
    solutions: [
      'Try submitting again — it may be a temporary issue.',
      'Refresh the page and re-enter the data.',
      'If the problem continues, sign out and sign back in.',
      'Check that all fields are filled in correctly.',
      'Contact an administrator if the issue persists.',
    ],
    technicalDetail: `${errorCode ? `Code: ${errorCode}\n` : ''}${errorDetails ? `Details: ${errorDetails}\n` : ''}${errorHint ? `Hint: ${errorHint}\n` : ''}Message: ${errorMessage}`,
  };
}

const categoryConfig = {
  validation: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  permission: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  network: { icon: Wifi, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  database: { icon: Database, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  unknown: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export function MatterErrorDialog({ open, onOpenChange, error, context, matterData }: MatterErrorDialogProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorDetail = parseError(error, context, matterData);
  const config = categoryConfig[errorDetail.category];
  const Icon = config.icon;

  const handleCopy = async () => {
    const text = `Error: ${errorDetail.title}\nCategory: ${errorDetail.category}\nMessage: ${errorDetail.message}\n\nTechnical Details:\n${errorDetail.technicalDetail || 'N/A'}\n\nTimestamp: ${new Date().toISOString()}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <span>{errorDetail.title}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-2">
            {/* Error Message */}
            <div className={`p-3 rounded-lg border ${config.border} ${config.bg}`}>
              <p className="text-sm">{errorDetail.message}</p>
            </div>

            {/* Matter Context */}
            {matterData && (matterData.caseId || matterData.caseTitle) && (
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Matter Details</p>
                <div className="space-y-0.5 text-sm">
                  {matterData.caseId && <p><span className="text-muted-foreground">Case ID:</span> <span className="font-mono">{matterData.caseId}</span></p>}
                  {matterData.caseTitle && <p><span className="text-muted-foreground">Title:</span> {matterData.caseTitle}</p>}
                  {matterData.caseType && <p><span className="text-muted-foreground">Type:</span> {matterData.caseType}</p>}
                </div>
              </div>
            )}

            {/* Solutions */}
            <div>
              <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                How to fix this
              </p>
              <ul className="space-y-2">
                {errorDetail.solutions.map((solution, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Details (collapsible) */}
            {errorDetail.technicalDetail && (
              <div>
                <button
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  {showTechnical ? 'Hide' : 'Show'} technical details
                </button>
                {showTechnical && (
                  <pre className="mt-2 p-3 rounded-lg bg-secondary/50 border border-border/50 text-xs font-mono whitespace-pre-wrap break-all overflow-x-auto">
                    {errorDetail.technicalDetail}
                  </pre>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy Error'}
          </Button>
          <Button onClick={() => onOpenChange(false)} size="sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
