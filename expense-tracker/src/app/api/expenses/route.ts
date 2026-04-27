import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  getOrderBy,
  isValidCategory,
  parseCreateExpenseBody,
} from "@/lib/expense-utils";

export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await prisma.expense.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return NextResponse.json(existing, { status: 200 });
      }
    }

    const json = await req.json();
    const parsed = parseCreateExpenseBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parsed.data.amountCents,
        category: parsed.data.category,
        description: parsed.data.description,
        date: parsed.data.date,
        idempotencyKey: idempotencyKey || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Failed to create expense", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");

    if (category && category !== "All" && !isValidCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const where = category && category !== "All" ? { category } : {};
    const orderBy = getOrderBy(sort);

    const expenses = await prisma.expense.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve expenses", error);
    return NextResponse.json(
      { error: "Failed to retrieve expenses" },
      { status: 500 }
    );
  }
}
