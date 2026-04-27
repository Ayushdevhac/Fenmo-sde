import ExpenseDashboard from "@/components/ExpenseDashboard";
import { BadgeDollarSign, Sparkles, WalletIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="app-shell min-h-screen font-sans text-slate-900">
      {/* Floating background elements */}
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />

      <header className="sticky top-0 z-20 border-b border-slate-200/50 bg-white/40 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 group">
            <div className="card-3d rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 shadow-md shadow-blue-600/30 group-hover:shadow-lg transition-shadow">
              <WalletIcon className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                Fenmo Finance
              </h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Personal expense cockpit
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200/60 bg-gradient-to-r from-white/90 to-emerald-50/60 px-3 py-1.5 shadow-sm sm:flex hover:shadow-md transition-shadow">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Reliable saves with idempotency
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="glass-panel card-3d-deep soft-shine hero-fade-up rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-emerald-50/20 rounded-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="card-3d-pop inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-700 shadow-sm">
                <BadgeDollarSign className="h-3.5 w-3.5" />
                Budget clarity starts here
              </p>
              <h2 className="card-3d-pop text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Understand spending patterns at a glance.
              </h2>
              <p className="reveal text-sm font-medium text-slate-600 sm:text-base">
                Add expenses quickly, filter by category, and review totals in one clean workspace designed for real-world usage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="card-3d-deep rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm hover:shadow-md hover:border-blue-300/50 hover:bg-gradient-to-br hover:from-blue-50/40 hover:to-white">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Speed</p>
                <p className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">Fast entry</p>
              </div>
              <div className="card-3d-deep rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm hover:shadow-md hover:border-emerald-300/50 hover:bg-gradient-to-br hover:from-emerald-50/40 hover:to-white">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Safety</p>
                <p className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">Retry-safe</p>
              </div>
            </div>
          </div>
        </section>

        <ExpenseDashboard />
      </main>

      <footer className="mx-auto mt-auto w-full max-w-6xl border-t border-slate-200/80 px-4 py-8 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Built with Next.js, Prisma, and Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
