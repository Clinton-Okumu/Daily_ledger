
import { LedgerState } from "@/types/ledger"

const KEY = "daily-ledger"

export function loadLedger(): LedgerState {
  if (typeof window === "undefined") {
    return { dailyCharge: 300, payments: [] }
  }

  const raw = localStorage.getItem(KEY)
  return raw
    ? JSON.parse(raw)
    : { dailyCharge: 300, payments: [] }
}

export function saveLedger(state: LedgerState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}
