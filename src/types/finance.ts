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
