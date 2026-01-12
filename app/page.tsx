"use client";

import { useEffect, useState } from "react";
import { LedgerState } from "@/types/ledger";
import { loadLedger, saveLedger } from "@/lib/storage";

import LedgerHeader from "@/components/ledger/LedgerHeader";
import BalanceCard from "@/components/ledger/BalanceCard";
import CalendarView from "@/components/ledger/CalendarView";
import SummaryCard from "@/components/ledger/SummaryCard";
import DataActions from "@/components/ledger/DataActions";

export default function Page() {
  const [ledger, setLedger] = useState<LedgerState>(() => loadLedger());

  useEffect(() => {
    saveLedger(ledger);
  }, [ledger]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6 sm:space-y-8 py-6 sm:py-10">
        <LedgerHeader />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <BalanceCard ledger={ledger} />
          </div>
          <div className="md:col-span-2">
            <CalendarView ledger={ledger} onChange={setLedger} />
          </div>
          <SummaryCard ledger={ledger} />
          <DataActions onLedgerChange={setLedger} ledger={ledger} />
        </div>
      </div>
    </main>
  );
}

