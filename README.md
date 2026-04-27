# Expense Tracker

## Overview
This is a minimal full-stack Personal Expense Tracker built as an assessment.

The app allows users to:
1. Record new expenses with an amount, category, description, and date.
2. View a list of their previously recorded expenses.
3. Filter expenses by predefined categories.
4. Sort expenses by date (newest/oldest).
5. See the total amount of currently visible expenses.

## Key Design Decisions
- **Next.js & React:** Used the Next.js App Router to build both the frontend and the backend API within the same repository. This keeps the stack simple and minimizes context-switching.
- **Tailwind CSS:** Used for quick, clean, and responsive UI components.
- **Money Handling:** Amounts are collected as decimals (e.g. .50) but converted and stored as integer cents (e.g. 1050) in the database. This prevents floating-point precision errors during sums and aggregations, which is a standard pattern in financial applications.
- **Database (Prisma + SQLite):** Given the requirements to choose a reasonable persistence mechanism, SQLite via Prisma was selected. It is a lightweight, file-based SQL database that requires zero configuration overhead, runs locally out of the box, and perfectly models a relational dataset.
- **Idempotency for Retries:** The frontend generates an Idempotency-Key (a UUID4) right before the POST request and includes it in the headers. The backend ensures that an expense with the same idempotency key is only created once and immediately returns the existing record if duplicated. This makes the API safe against network retries or double-clicking.

## Trade-offs & What Was Not Done
- **Pagination:** For the sake of the timebox, the GET /expenses endpoint returns the full list of expenses, and the UI displays them all at once. In a production app with thousands of expenses, server-side pagination or infinite scrolling would be necessary.
- **Authentication & Multi-Tenant:** For simplicity, the tool currently assumes a single user. There is no login, and all expenses exist globally.
- **Comprehensive Validation:** While basic requirements are met (amount > 0, required fields, date parsing), further validation could be done on exact length constraints and strict enum boundaries for categories on the backend.
- **Automated Tests:** In the interest of delivering the core functionality within the time limit, unit or integration tests (e.g., using Jest or Playwright) were omitted.

## Running the Application
1. Navigate into the Next.js app directory: \cd expense-tracker\`n2. Install dependencies: \
pm install\`n3. Ensure Prisma generates its client correctly: \
px prisma db push\ and \
px prisma generate\`n4. Start the development server: \
pm run dev\`n5. Open [http://localhost:3000](http://localhost:3000) with your browser.
