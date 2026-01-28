"use client";

import { useEffect, useState } from "react";
import { LedgerState } from "@/types/ledger";
import { loadLedger, saveLedger } from "@/lib/storage";

import LedgerHeader from "@/components/ledger/LedgerHeader";
import BalanceCard from "@/components/ledger/BalanceCard";
import CalendarView from "@/components/ledger/CalendarView";
import SummaryCard from "@/components/ledger/SummaryCard";
import DataActions from "@/components/ledger/DataActions";
import MonthlyTotalsCard from "@/components/ledger/MonthlyTotalsCard";

export default function Page() {
  const [ledger, setLedger] = useState<LedgerState>(() => loadLedger());

  useEffect(() => {
    saveLedger(ledger);
  }, [ledger]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-10%] top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-muted/40 blur-2xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 space-y-6 sm:space-y-8 py-8 sm:py-12">
        <LedgerHeader />
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <BalanceCard ledger={ledger} />
          </div>
          <div className="lg:col-span-12">
            <CalendarView ledger={ledger} onChange={setLedger} />
          </div>
          <div className="lg:col-span-4">
            <SummaryCard ledger={ledger} />
          </div>
          <div className="lg:col-span-4">
            <MonthlyTotalsCard ledger={ledger} />
          </div>
          <div className="lg:col-span-4">
            <DataActions onLedgerChange={setLedger} ledger={ledger} />
          </div>
        </div>
      </div>
    </main>
  );
}
