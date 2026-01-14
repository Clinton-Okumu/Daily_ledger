import { LedgerState } from "@/types/ledger";
import { formatDate } from "@/lib/date";

export type DayStatus = "paid" | "partial" | "unpaid" | "overdue" | "none";

export function getDayStatus(
  ledger: LedgerState,
  date: string,
  today: string = formatDate(new Date())
): DayStatus {
  const payment = ledger.payments.find((p) => p.date === date);
  const isPast = date < today;
  const isFuture = date > today;

  if (!payment) {
    if (isFuture) return "none";
    if (isPast) return "overdue";
    return "unpaid";
  }
  if (payment.amount >= ledger.dailyCharge) return "paid";
  if (payment.amount > 0) return isPast ? "overdue" : "partial";
  return isPast ? "overdue" : "unpaid";
}

export function getDayPayment(ledger: LedgerState, date: string) {
  return ledger.payments.find((p) => p.date === date)?.amount ?? 0;
}
