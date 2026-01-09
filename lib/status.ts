import { LedgerState } from "@/types/ledger";

export type DayStatus = "paid" | "partial" | "unpaid" | "none";

export function getDayStatus(
  ledger: LedgerState,
  date: string
): DayStatus {
  const payment = ledger.payments.find((p) => p.date === date);
  if (!payment) return "none";
  if (payment.amount >= ledger.dailyCharge) return "paid";
  if (payment.amount > 0) return "partial";
  return "unpaid";
}

export function getDayPayment(ledger: LedgerState, date: string) {
  return ledger.payments.find((p) => p.date === date)?.amount ?? 0;
}
