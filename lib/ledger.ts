import { LedgerState } from "@/types/ledger";

export function totalPaid(state: LedgerState) {
  return state.payments.filter(p => p.type === "daily-charge").reduce((sum, p) => sum + p.amount, 0);
}

export function totalService(state: LedgerState) {
  return state.payments.filter(p => p.type === "service").reduce((sum, p) => sum + p.amount, 0);
}

export function totalCharged(state: LedgerState, upToDate: string) {
  const start = new Date(state.payments[0]?.date ?? upToDate);
  const end = new Date(upToDate);

  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  let chargeableDays = 0;
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    if (date.getDay() !== 0) {
      chargeableDays++;
    }
  }

  return chargeableDays * state.dailyCharge;
}

export function balance(state: LedgerState, upToDate: string) {
  return totalPaid(state) - totalService(state) - totalCharged(state, upToDate);
}
