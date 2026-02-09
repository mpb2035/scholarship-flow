export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type QueryStatus = 'No Query' | 'Query Issued' | 'Query Resolved';

export type OverallStatus = 
  | 'Pending SUT HE Review'
  | 'In Process'
  | 'Dept to Respond – SUT HE Query'
  | 'Dept to Respond – Higher Up Query'
  | 'SUT HE Submitted to HU'
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
  | 'Extension Scholarship'
  | 'Manpower Blueprint'
  | 'Attachment Overseas'
  | 'BPTV'
  | 'TVET Scheme'
  | 'HECAS'
  | 'Greening Education Plan'
  | 'SUSLR'
  | 'MKPK'
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
  sutheSubmittedToHuDate?: string;
  queryIssuedDate?: string;
  queryResponseDate?: string;
  secondQueryStatus: QueryStatus;
  secondQueryIssuedDate?: string;
  secondQueryResponseDate?: string;
  secondSutheSubmittedToHuDate?: string;
  signedDate?: string;
  queryStatus: QueryStatus;
  overallStatus: OverallStatus;
  daysInProcess: number;
  daysSutHeToHu: number;
  queryDaysPendingSutHe: number;
  queryDaysPendingHigherUp: number;
  overallSlaDays: number;
  slaStatus: SLAStatus;
  remarks?: string;
  assignedTo?: string;
  externalLink?: string;
  deadline?: string;
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
  deptToRespondSutHe: number;
  deptToRespondHigherUp: number;
  pendingHigherUp: number;
}
