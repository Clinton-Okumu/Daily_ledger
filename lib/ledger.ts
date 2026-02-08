import { LedgerState } from "@/types/ledger";
import { formatDate, parseDate } from "@/lib/date";

export function totalPaid(state: LedgerState) {
  return state.payments
    .filter((p) => p.type === "daily-charge")
    .reduce((sum, p) => sum + p.amount, 0);
}

export function totalPaidYtd(state: LedgerState, upToDate: string) {
  const startStr = getStartOfYearStr(upToDate);
  return state.payments
    .filter(
      (p) =>
        p.type === "daily-charge" &&
        p.date >= startStr &&
        p.date <= upToDate
    )
    .reduce((sum, p) => sum + p.amount, 0);
}

export function totalService(state: LedgerState) {
  return state.payments
    .filter((p) => p.type === "service" || p.type === "emergency")
    .reduce((sum, p) => sum + p.amount, 0);
}

export function totalServiceYtd(state: LedgerState, upToDate: string) {
  const startStr = getStartOfYearStr(upToDate);
  return state.payments
    .filter(
      (p) =>
        (p.type === "service" || p.type === "emergency") &&
        p.date >= startStr &&
        p.date <= upToDate
    )
    .reduce((sum, p) => sum + p.amount, 0);
}

export function totalCharged(state: LedgerState, upToDate: string) {
  const start = parseDate(getStartOfYearStr(upToDate));
  const end = parseDate(upToDate);

  return totalChargedInRange(state, start, end);
}

export function balance(state: LedgerState, upToDate: string) {
  return totalPaidYtd(state, upToDate) - totalServiceYtd(state, upToDate);
}

function getStartOfYearStr(dateStr: string): string {
  const yearFromStr = Number.parseInt(dateStr.slice(0, 4), 10);
  const year = Number.isFinite(yearFromStr) ? yearFromStr : parseDate(dateStr).getFullYear();
  return `${year}-01-01`;
}

function hasNonChargeOverride(state: LedgerState, date: Date) {
  const dateStr = formatDate(date);
  return state.payments.some(
    (payment) =>
      payment.date === dateStr &&
      payment.type === "service-day"
  );
}

function countChargeableDays(state: LedgerState, startDate: Date, endDate: Date) {
  let chargeableDays = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    if (current.getDay() !== 0 && !hasNonChargeOverride(state, current)) {
      chargeableDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  return chargeableDays;
}

export function totalChargedInRange(
  state: LedgerState,
  startDate: Date,
  endDate: Date
) {
  const chargeableDays = countChargeableDays(state, startDate, endDate);
  return chargeableDays * state.dailyCharge;
}

export function totalPaidInRange(
  state: LedgerState,
  startDate: Date,
  endDate: Date
) {
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  return state.payments
    .filter(
      (payment) =>
        payment.type === "daily-charge" &&
        payment.date >= startStr &&
        payment.date <= endStr
    )
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function totalServiceInRange(
  state: LedgerState,
  startDate: Date,
  endDate: Date
) {
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  return state.payments
    .filter(
      (payment) =>
        (payment.type === "service" || payment.type === "emergency") &&
        payment.date >= startStr &&
        payment.date <= endStr
    )
    .reduce((sum, payment) => sum + payment.amount, 0);
}
