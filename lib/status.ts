import { LedgerState, PaymentType } from "@/types/ledger";
import { formatDate } from "@/lib/date";

export type DayStatus = "paid" | "partial" | "unpaid" | "overdue" | "none";

export function getDayStatus(
  ledger: LedgerState,
  date: string,
  today: string = formatDate(new Date())
): DayStatus {
  const payments = ledger.payments.filter((p) => p.date === date);
  const isPast = date < today;
  const isFuture = date > today;
  const hasPaidDayOverride = payments.some(
    (payment) => payment.type === "service-day" || payment.type === "emergency"
  );
  const dailyChargeTotal = payments
    .filter((payment) => payment.type === "daily-charge")
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (payments.length === 0) {
    if (isFuture) return "none";
    if (isPast) return "overdue";
    return "unpaid";
  }
  if (hasPaidDayOverride) return "paid";
  if (dailyChargeTotal >= ledger.dailyCharge) return "paid";
  if (dailyChargeTotal > 0) return isPast ? "overdue" : "partial";
  return isPast ? "overdue" : "unpaid";
}

export function getDayPayments(ledger: LedgerState, date: string) {
  return ledger.payments.filter((p) => p.date === date);
}

export function getDayPayment(ledger: LedgerState, date: string) {
  return ledger.payments
    .filter((p) => p.date === date)
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function getDayPaymentTypes(
  ledger: LedgerState,
  date: string
): PaymentType[] {
  const types = ledger.payments
    .filter((p) => p.date === date)
    .map((p) => p.type);
  return Array.from(new Set(types));
}
