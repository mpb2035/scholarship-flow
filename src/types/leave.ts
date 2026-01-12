export interface Leave {
  id: string;
  user_id: string;
  leave_type: 'annual' | 'sick' | 'other';
  start_date: string;
  end_date: string;
  days_used: number;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  user_id: string;
  year: number;
  annual_entitlement: number;
  sick_entitlement: number;
  other_entitlement: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveInput {
  leave_type: 'annual' | 'sick' | 'other';
  start_date: string;
  end_date: string;
  days_used: number;
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface LeaveBalanceInput {
  year: number;
  annual_entitlement: number;
  sick_entitlement: number;
  other_entitlement: number;
}
