import { TrendingUp, CalendarDays } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LedgerHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-[var(--font-display)] bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Daily Ledger
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track daily charges, payments, and service fees in one place.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border/60 rounded-full">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Smart Tracking</span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
