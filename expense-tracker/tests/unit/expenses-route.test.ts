import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    expense: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({
  default: prismaMock,
}));

import { GET, POST } from "../../src/app/api/expenses/route";

describe("/api/expenses route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create payloads", async () => {
    const request = new NextRequest("http://localhost:3000/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        amount: -1,
        category: "Food",
        description: "Lunch",
        date: "2024-01-01",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/positive number/i);
    expect(prismaMock.expense.create).not.toHaveBeenCalled();
  });

  it("returns an existing idempotent expense without creating another row", async () => {
    const existingExpense = {
      id: "existing",
      amount: 1299,
      category: "Food",
      description: "Lunch",
      date: new Date("2024-01-01T00:00:00.000Z"),
    };
    prismaMock.expense.findUnique.mockResolvedValueOnce(existingExpense);

    const request = new NextRequest("http://localhost:3000/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        amount: 12.99,
        category: "Food",
        description: "Lunch",
        date: "2024-01-01",
      }),
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "abc-123",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("existing");
    expect(prismaMock.expense.create).not.toHaveBeenCalled();
  });

  it("applies validated filters and sorting when listing expenses", async () => {
    prismaMock.expense.findMany.mockResolvedValueOnce([]);

    const request = new NextRequest(
      "http://localhost:3000/api/expenses?category=Food&sort=date_asc"
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(prismaMock.expense.findMany).toHaveBeenCalledWith({
      where: { category: "Food" },
      orderBy: { date: "asc" },
    });
  });

  it("rejects invalid categories in list filters", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/expenses?category=InvalidCategory"
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/invalid category/i);
    expect(prismaMock.expense.findMany).not.toHaveBeenCalled();
  });
});
