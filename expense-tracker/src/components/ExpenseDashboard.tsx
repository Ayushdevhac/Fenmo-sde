"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  Coffee,
  Home,
  Car,
  Zap,
  Shield,
  HeartPulse,
  PiggyBank,
  CreditCard,
  Popcorn,
  HelpCircle,
  Plus,
  Loader2,
  SearchX,
  Calendar,
  Layers,
  ArrowDownUp,
  AlertCircle,
  TrendingUp,
  Receipt
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
};

const CATEGORIES = [
  { name: "Food", icon: Coffee, color: "text-orange-500", bg: "bg-orange-100" },
  { name: "Housing", icon: Home, color: "text-blue-500", bg: "bg-blue-100" },
  { name: "Transportation", icon: Car, color: "text-slate-600", bg: "bg-slate-100" },
  { name: "Utilities", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100" },
  { name: "Insurance", icon: Shield, color: "text-indigo-500", bg: "bg-indigo-100" },
  { name: "Healthcare", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-100" },
  { name: "Savings", icon: PiggyBank, color: "text-emerald-500", bg: "bg-emerald-100" },
  { name: "Debt", icon: CreditCard, color: "text-red-500", bg: "bg-red-100" },
  { name: "Entertainment", icon: Popcorn, color: "text-purple-500", bg: "bg-purple-100" },
  { name: "Other", icon: HelpCircle, color: "text-gray-500", bg: "bg-gray-100" },
];

const getCategoryMeta = (categoryName: string) => {
  return CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[CATEGORIES.length - 1];
};

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Sort State
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("date_desc");

  useEffect(() => {
    let active = true;
    const fetchIt = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ sort: sortOrder });
        if (filterCategory !== "All") params.set("category", filterCategory);
        
        const response = await fetch(`/api/expenses?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch expenses");
        const data = await response.json();
        if (active) setExpenses(data);
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchIt();
    return () => {
      active = false;
    };
  }, [filterCategory, sortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!description || !date) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = uuidv4();

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          amount: Number(amount),
          category,
          description,
          date,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create expense");
      }

      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory(CATEGORIES[0].name);
      
      const newExp = await response.json();
      
      if (
        filterCategory === "All" || filterCategory === newExp.category
      ) {
            setExpenses((prev) => {
            const combined = [newExp, ...prev.filter(x => x.id !== newExp.id)];
            if (sortOrder === "date_desc") {
                return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            } else {
                return combined.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }
            });
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0) / 100;
  const expenseCount = expenses.length;
  const averageExpense = expenseCount > 0 ? totalAmount / expenseCount : 0;
  const currentMonthTotal =
    expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0) / 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20 hero-fade-up">
      
      {/* LEFT COLUMN: Add Expense Widget */}
      <div className="lg:col-span-4 glass-panel card-3d-deep soft-shine p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/10 rounded-3xl pointer-events-none" />
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">New Expense</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Record a new transaction</p>
          </div>
        </div>

        {error && (
          <div className="error-shake mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label htmlFor="expense-amount" className="block text-sm font-bold text-slate-700 mb-1.5">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold">$</span>
              </div>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-8 pr-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all sm:text-base font-semibold shadow-sm hover:border-slate-300"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="expense-category" className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {(() => {
                    const Icon = getCategoryMeta(category).icon;
                    return <Icon className={cn("w-4 h-4", getCategoryMeta(category).color)} />;
                  })()}
                </div>
                <select
                  id="expense-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full pl-9 pr-10 py-3 bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all sm:text-sm font-semibold appearance-none shadow-sm hover:border-slate-300 cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ArrowDownUp className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="expense-date" className="block text-sm font-bold text-slate-700 mb-1.5">Date</label>
              <input
                id="expense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full px-3 py-3 bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 focus:bg-white transition-all sm:text-sm font-semibold appearance-none shadow-sm hover:border-slate-300"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="expense-description" className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
            <input
              id="expense-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-purple-50/30 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 focus:bg-white transition-all sm:text-sm font-medium shadow-sm hover:border-slate-300"
              placeholder="What was this for?"
              required
            />
          </div>

          {/* Spacer */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "group w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden",
                isSubmitting 
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:ring-blue-600 active:scale-[0.97]"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Processing
                </>
              ) : (
                "Save Expense"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Review Section */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Top Controls & Totals */}
        <div className="glass-panel card-3d-deep soft-shine p-6 sm:p-8 rounded-3xl flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-transparent to-blue-50/10 rounded-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card-3d-deep rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white/90 to-slate-50/50 p-4 hover:border-blue-300/50 hover:bg-gradient-to-br hover:from-blue-50/40 hover:to-white/60">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="card-3d-deep rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white/90 to-slate-50/50 p-4 hover:border-emerald-300/50 hover:bg-gradient-to-br hover:from-emerald-50/40 hover:to-white/60">
              <div className="flex items-center gap-2 text-slate-500">
                <Receipt className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Entries</p>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{expenseCount}</p>
            </div>
            <div className="card-3d-deep rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white/90 to-slate-50/50 p-4 hover:border-orange-300/50 hover:bg-gradient-to-br hover:from-orange-50/40 hover:to-white/60">
              <div className="flex items-center gap-2 text-slate-500">
                <TrendingUp className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Monthly</p>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                ${currentMonthTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="relative w-full sm:w-auto basis-1/2 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                  <Layers className="h-4 w-4" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full pl-9 pr-10 py-3 bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 appearance-none shadow-sm cursor-pointer hover:border-slate-300 transition-all"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                  <ArrowDownUp className="h-3 w-3" />
                </div>
            </div>

            <div className="relative w-full sm:w-auto basis-1/2 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                  <Calendar className="h-4 w-4" />
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="block w-full pl-9 pr-10 py-3 bg-gradient-to-r from-slate-50 to-emerald-50/20 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 appearance-none shadow-sm cursor-pointer hover:border-slate-300 transition-all"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ArrowDownUp className="h-3 w-3" />
                </div>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-500">
            Average expense: ${averageExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Expenses List */}
        <div className="glass-panel card-3d-deep rounded-3xl overflow-hidden flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-transparent to-blue-50/20 pointer-events-none" />
          {loading ? (
             <div className="relative z-10 p-16 flex flex-col items-center justify-center text-slate-400 gap-6">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                  <div className="absolute inset-0 animate-pulse blur-lg bg-blue-500/20 rounded-full"></div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-slate-600">Fetching history...</p>
                  <p className="text-xs text-slate-400 mt-1">Loading your expenses</p>
                </div>
             </div>
          ) : expenses.length === 0 ? (
            <div className="relative z-10 p-20 flex flex-col items-center justify-center text-center">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 w-28 h-28 rounded-full flex items-center justify-center mb-6 border-2 border-slate-200 shadow-lg">
                <SearchX className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">No expenses found</h3>
              <p className="text-slate-500 max-w-sm text-sm font-medium">
                We could not find any expenses matching your selected filters. Start tracking now.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200/50 relative z-10">
              {expenses.map((expense) => {
                const meta = getCategoryMeta(expense.category);
                const Icon = meta.icon;
                
                return (
                  <li key={expense.id} className="stagger-item p-5 sm:px-8 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-transparent transition-all duration-300 group flex items-center gap-5 cursor-default border-l-4 border-l-transparent hover:border-l-blue-400">
                    {/* Icon Badge */}
                    <div className={cn("p-3.5 rounded-2xl shrink-0 transition-all shadow-sm group-hover:shadow-md group-hover:scale-110", meta.bg, meta.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0 pr-4">
                       <p className="text-slate-900 font-bold truncate tracking-tight text-base group-hover:text-blue-600 transition-colors">
                         {expense.description}
                       </p>
                       <div className="flex items-center gap-2.5 mt-1 text-sm text-slate-500 font-medium">
                         <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                         <span className={cn("truncate inline-flex tracking-wider items-center", meta.color)}>
                           {expense.category}
                         </span>
                       </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-slate-900 font-black text-lg sm:text-xl tabular-nums tracking-tight">
                        ${(expense.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          
          {expenses.length > 0 && (
            <div className="bg-slate-50/50 p-4 text-center border-t border-slate-100">
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">End of list</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
