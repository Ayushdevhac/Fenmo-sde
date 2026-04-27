import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExpenseDashboard from "../../src/components/ExpenseDashboard";
import React from "react";

const mockExpenses = [
  {
    id: "1",
    amount: 1550,
    category: "Food",
    description: "Lunch",
    date: "2024-05-25T12:00:00Z",
  },
  {
    id: "2",
    amount: 5000,
    category: "Transportation",
    description: "Gas",
    date: "2024-05-24T12:00:00Z",
  },
];

type MockFetch = ReturnType<typeof vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>>;
const fetchMock: MockFetch = vi.fn();
global.fetch = fetchMock;

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("ExpenseDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders loading state initially", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(mockExpenses));

    render(<ExpenseDashboard />);
    expect(screen.getByText(/Fetching history/i)).toBeInTheDocument();
  });

  it("renders expenses after loading", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(mockExpenses));

    render(<ExpenseDashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/Fetching history/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("$15.50")).toBeInTheDocument();
    expect(screen.getByText("Gas")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("handles fetch errors gracefully", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network Error"));

    render(<ExpenseDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
    });
  });

  it("submits a new expense successfully", async () => {
    // Initial fetch
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    render(<ExpenseDashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/Fetching history/i)).not.toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "25.00" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Movie" } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "Entertainment" } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: "2024-05-26" } });

    // Mock successful post
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "3",
        amount: 2500,
        category: "Entertainment",
        description: "Movie",
        date: "2024-05-26T00:00:00Z",
      }, { status: 201 })
    );

    fireEvent.click(screen.getByRole("button", { name: /Save Expense/i }));

    await waitFor(() => {
      expect(screen.getByText("Movie")).toBeInTheDocument();
      expect(screen.getAllByText("$25.00")).toHaveLength(2);
    });
  });

  it("handles form validation correctly", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    render(<ExpenseDashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/Fetching history/i)).not.toBeInTheDocument();
    });

    const form = screen.getByRole("button", { name: /Save Expense/i }).closest("form");
    expect(form).not.toBeNull();

    // submit without filling description
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Invalid amount test" } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid amount/i)).toBeInTheDocument();
    });

    // Fix amount but no description
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "10.00" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "" } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Please fill out all required fields/i)).toBeInTheDocument();
    });
  });
});
