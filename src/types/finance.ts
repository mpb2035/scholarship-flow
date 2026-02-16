export interface ExpenseCategory {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  categoryId: string | null;
  month: number;
  year: number;
  budgetAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string | null;
  description: string;
  amount: number;
  expenseDate: string;
  isRecurring: boolean;
  payPeriod: number | null; // 1 or 2 for biweekly, null for regular monthly
  createdAt: string;
  updatedAt: string;
}

export interface BiweeklyPaySettings {
  id: string;
  userId: string;
  payAmount: number;
  firstPayDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithBudgetAndSpending extends ExpenseCategory {
  budget: number;
  spent: number;
  remaining: number;
}

export interface FixedCommitment {
  id: string;
  userId: string;
  description: string;
  amount: number;
  payPeriod: number;
  category: string;
  customLabel: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
