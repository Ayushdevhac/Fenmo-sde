import { describe, it, expect } from "vitest";
import {
  isValidCategory,
  toCents,
  sortExpensesByDate,
  calculateExpenseStats,
  parseCreateExpenseBody,
} from "../../src/lib/expense-utils";

describe("expense-utils", () => {
  describe("isValidCategory", () => {
    it("returns true for valid categories", () => {
      expect(isValidCategory("Food")).toBe(true);
      expect(isValidCategory("Housing")).toBe(true);
    });

    it("returns false for invalid categories", () => {
      expect(isValidCategory("Groceries")).toBe(false);
      expect(isValidCategory("")).toBe(false);
      expect(isValidCategory(String(null))).toBe(false);
    });
  });

  describe("toCents", () => {
    it("converts dollars to cents correctly", () => {
      expect(toCents(10.5)).toBe(1050);
      expect(toCents(10)).toBe(1000);
      expect(toCents(0.01)).toBe(1);
    });

    it("handles floating point parsing safely", () => {
      expect(toCents(19.99)).toBe(1999);
      expect(toCents(4.95)).toBe(495);
    });
  });

  describe("sortExpensesByDate", () => {
    const expenses = [
      { id: 1, date: "2024-01-01", amount: 1000 },
      { id: 2, date: "2024-02-01", amount: 2000 },
      { id: 3, date: "2023-12-01", amount: 3000 },
    ];

    it("sorts descending by default", () => {
      const sorted = sortExpensesByDate(expenses, "date_desc");
      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(3);
    });

    it("sorts ascending", () => {
      const sorted = sortExpensesByDate(expenses, "date_asc");
      expect(sorted[0].id).toBe(3);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(2);
    });
  });

  describe("calculateExpenseStats", () => {
    it("calculates totals, averages, and monthly correctly", () => {
      const expenses = [
        { amount: 1000, date: "2024-05-15T12:00:00Z" }, // 10.00
        { amount: 2550, date: "2024-05-20T12:00:00Z" }, // 25.50
        { amount: 500, date: "2024-04-10T12:00:00Z" },  // 5.00
      ];
      
      const now = new Date("2024-05-25T12:00:00Z");
      const stats = calculateExpenseStats(expenses, now);
      
      expect(stats.expenseCount).toBe(3);
      expect(stats.totalAmount).toBe(40.50);
      expect(stats.averageExpense).toBe(13.50);
      expect(stats.currentMonthTotal).toBe(35.50); // only May expenses
    });

    it("returns zeros safely for empty lists", () => {
      const stats = calculateExpenseStats([], new Date());
      expect(stats.expenseCount).toBe(0);
      expect(stats.totalAmount).toBe(0);
      expect(stats.averageExpense).toBe(0);
      expect(stats.currentMonthTotal).toBe(0);
    });
  });

  describe("parseCreateExpenseBody", () => {
    it("returns error for invalid body", () => {
      expect(parseCreateExpenseBody(null).ok).toBe(false);
      expect(parseCreateExpenseBody("string").ok).toBe(false);
    });

    it("validates amount", () => {
      const payload = { amount: -5, category: "Food", description: "Food", date: "2024-01-01" };
      const res = parseCreateExpenseBody(payload);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error).toMatch(/positive number/i);
    });
    
    it("validates category", () => {
      const payload = { amount: 10, category: "NotValid", description: "Food", date: "2024-01-01" };
      const res = parseCreateExpenseBody(payload);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error).toMatch(/category/i);
    });

    it("validates successful payload", () => {
      const payload = { amount: "10.50", category: "Food", description: "  Some food  ", date: "2024-01-01" };
      const res = parseCreateExpenseBody(payload);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.amountCents).toBe(1050);
        expect(res.data.category).toBe("Food");
        expect(res.data.description).toBe("Some food");
        expect(res.data.date).toBeInstanceOf(Date);
      }
    });
  });
});
