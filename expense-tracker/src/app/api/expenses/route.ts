import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

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
    const { amount, category, description, date } = json;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    if (!category || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        amount: Math.round(Number(amount) * 100), // Convert to cents
        category: String(category),
        description: String(description),
        date: new Date(date),
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

    const where = category && category !== "All" ? { category: String(category) } : {};

    let orderBy: { date: "asc" | "desc" } | undefined = undefined;
    if (sort === "date_desc") {
      orderBy = { date: "desc" };
    } else if (sort === "date_asc") {
      orderBy = { date: "asc" };
    } else {
      orderBy = { date: "desc" }; // default
    }

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
