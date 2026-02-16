import { Plus, RefreshCw, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Matter } from '@/types/matter';

interface HeaderProps {
  onAddNew: () => void;
  onRefresh: () => void;
  matters?: Matter[];
}

export function Header({ onAddNew, onRefresh, matters = [] }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleExportReport = () => {
    // Filter for Active and Overdue matters
    const reportMatters = matters.filter(
      (m) =>
        !m.overallStatus.includes('Signed') &&
        (m.slaStatus === 'Overdue' ||
          m.slaStatus === 'At Risk' ||
          m.slaStatus === 'Critical' ||
          m.slaStatus === 'Within SLA')
    );

    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Weekly Matters Report - ${today}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px; 
      background: white; 
      color: #1a1a1a;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { color: #666; font-size: 14px; }
    .summary { 
      display: flex; 
      gap: 20px; 
      margin-bottom: 30px; 
      justify-content: center;
    }
    .summary-item { 
      padding: 15px 25px; 
      border: 1px solid #ddd; 
      border-radius: 8px;
      text-align: center;
    }
    .summary-item strong { display: block; font-size: 24px; }
    .summary-item span { color: #666; font-size: 12px; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: 12px;
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 10px 8px; 
      text-align: left; 
    }
    th { 
      background: #f5f5f5; 
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
    }
    tr:nth-child(even) { background: #fafafa; }
    .status-overdue { color: #dc2626; font-weight: 600; }
    .status-critical { color: #ea580c; font-weight: 600; }
    .status-at-risk { color: #ca8a04; font-weight: 600; }
    .status-within { color: #16a34a; }
    .priority-high { color: #dc2626; font-weight: 600; }
    .priority-medium { color: #ca8a04; }
    .priority-low { color: #16a34a; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Weekly Matters Report</h1>
    <p>Generated on ${today} | Active & Overdue Cases</p>
  </div>
  
  <div class="summary">
    <div class="summary-item">
      <strong>${reportMatters.length}</strong>
      <span>Total Active</span>
    </div>
    <div class="summary-item">
      <strong>${reportMatters.filter((m) => m.slaStatus === 'Overdue').length}</strong>
      <span>Overdue</span>
    </div>
    <div class="summary-item">
      <strong>${reportMatters.filter((m) => m.slaStatus === 'Critical').length}</strong>
      <span>Critical</span>
    </div>
    <div class="summary-item">
      <strong>${reportMatters.filter((m) => m.slaStatus === 'At Risk').length}</strong>
      <span>At Risk</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Case ID</th>
        <th>Title</th>
        <th>Type</th>
        <th>Priority</th>
        <th>Status</th>
        <th>SLA Status</th>
        <th>Days in Process</th>
        <th>Assigned To</th>
      </tr>
    </thead>
    <tbody>
      ${reportMatters
        .sort((a, b) => {
          const slaOrder = { Overdue: 0, Critical: 1, 'At Risk': 2, 'Within SLA': 3 };
          return (slaOrder[a.slaStatus as keyof typeof slaOrder] ?? 4) - (slaOrder[b.slaStatus as keyof typeof slaOrder] ?? 4);
        })
        .map(
          (m) => `
        <tr>
          <td>${m.caseId}</td>
          <td>${m.caseTitle}</td>
          <td>${m.caseType}</td>
          <td class="priority-${m.priority.toLowerCase()}">${m.priority}</td>
          <td>${m.overallStatus}</td>
          <td class="status-${m.slaStatus.toLowerCase().replace(' ', '-')}">${m.slaStatus}</td>
          <td>${m.daysInProcess}</td>
          <td>${m.assignedTo || '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
    }

    toast({
      title: 'Report Generated',
      description: 'Print window opened. Use Ctrl+P to save as PDF.',
    });
  };

  return (
    <header className="glass-card p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold gold-text tracking-wide">
            SFZN WORK
          </h1>
          <p className="text-muted-foreground mt-1">
            Matter Tracking Dashboard
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportReport}
            className="border-border/50 hover:border-primary/50 hover:bg-secondary/50"
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            className="border-border/50 hover:border-primary/50 hover:bg-secondary/50"
          >
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            onClick={onAddNew}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Log New Matter</span>
            <span className="sm:hidden">New</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            className="border-border/50 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
