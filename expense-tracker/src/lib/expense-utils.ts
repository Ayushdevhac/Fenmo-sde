export const EXPENSE_CATEGORIES = [
  "Food",
  "Housing",
  "Transportation",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Savings",
  "Debt",
  "Entertainment",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type SortOrder = "date_desc" | "date_asc";

export type ExpenseLike = {
  amount: number;
  date: string;
};

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function isValidCategory(category: string): category is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
}

export function getOrderBy(sort: string | null): { date: "asc" | "desc" } {
  return sort === "date_asc" ? { date: "asc" } : { date: "desc" };
}

export function sortExpensesByDate<T extends { date: string }>(
  expenses: T[],
  sortOrder: SortOrder
): T[] {
  return [...expenses].sort((a, b) => {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();
    return sortOrder === "date_asc" ? first - second : second - first;
  });
}

export function calculateExpenseStats(expenses: ExpenseLike[], now: Date = new Date()) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0) / 100;
  const expenseCount = expenses.length;
  const averageExpense = expenseCount > 0 ? totalAmount / expenseCount : 0;

  const currentMonthTotal =
    expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0) / 100;

  return {
    totalAmount,
    expenseCount,
    averageExpense,
    currentMonthTotal,
  };
}

type ParsedExpense = {
  amountCents: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
};

type ParseResult =
  | { ok: true; data: ParsedExpense }
  | { ok: false; error: string };

export function parseCreateExpenseBody(payload: unknown): ParseResult {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const body = payload as Record<string, unknown>;

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be a positive number" };
  }

  if (typeof body.category !== "string" || !isValidCategory(body.category)) {
    return { ok: false, error: "Invalid category" };
  }

  if (typeof body.description !== "string" || body.description.trim().length === 0) {
    return { ok: false, error: "Description is required" };
  }

  if (typeof body.date !== "string" || body.date.trim().length === 0) {
    return { ok: false, error: "Date is required" };
  }

  const parsedDate = new Date(body.date);
  if (Number.isNaN(parsedDate.getTime())) {
    return { ok: false, error: "Invalid date" };
  }

  return {
    ok: true,
    data: {
      amountCents: toCents(amount),
      category: body.category,
      description: body.description.trim(),
      date: parsedDate,
    },
  };
}
