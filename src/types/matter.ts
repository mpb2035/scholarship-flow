export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type QueryStatus = 'No Query' | 'Query Issued' | 'Query Resolved';

export type OverallStatus = 
  | 'Pending SUT HE Review'
  | 'In Process'
  | 'DSM to Respond – SUT HE Query'
  | 'DSM to Respond – Higher Up Query'
  | 'Pending Higher Up Approval'
  | 'Returned for Query'
  | 'Approved & Signed'
  | 'Not Approved';

export type CaseType = 
  | 'Ministerial Inquiry'
  | 'Event Coordination'
  | 'Policy Review'
  | 'Budget Proposal'
  | 'Cross-Agency Project'
  | 'Scholarship Award'
  | 'Other';

export type SLAStatus = 'Within SLA' | 'At Risk' | 'Critical' | 'Overdue' | 'Completed Overdue' | 'Completed';

export interface Matter {
  id: string;
  caseId: string;
  caseTitle: string;
  caseType: CaseType;
  priority: Priority;
  dsmSubmittedDate: string;
  sutheReceivedDate: string;
  queryIssuedDate?: string;
  queryResponseDate?: string;
  signedDate?: string;
  queryStatus: QueryStatus;
  overallStatus: OverallStatus;
  daysInProcess: number;
  queryDaysPending: number;
  overallSlaDays: number;
  slaStatus: SLAStatus;
  remarks?: string;
  assignedTo?: string;
}

export interface SLAConfig {
  slaGroup: string;
  stage: string;
  slaDays: number;
  atRiskDays: number;
  criticalDays: number;
}

export interface DashboardStats {
  totalActive: number;
  inProcess: number;
  returnedForQuery: number;
  approvedLast30Days: number;
  slaBreached: number;
  avgDaysToApproval: number;
  atRisk: number;
  pendingSutHe: number;
  dsmToRespondSutHe: number;
  dsmToRespondHigherUp: number;
  pendingHigherUp: number;
}
