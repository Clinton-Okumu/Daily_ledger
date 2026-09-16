import { LedgerState } from "@/types/ledger";
import { formatDate, parseDate } from "@/lib/date";

export function totalPaid(state: LedgerState) {
  return totalPaidInRange(state, new Date(0), new Date(8640000000000000));
}

export function totalPaidYtd(state: LedgerState, upToDate: string) {
  const startStr = getStartOfYearStr(upToDate);
  return totalPaidInRange(state, parseDate(startStr), parseDate(upToDate));
}

export function totalService(state: LedgerState) {
  return state.payments
    .filter((p) => p.type === "service")
    .reduce((sum, p) => sum + p.amount, 0);
}

export function totalServiceYtd(state: LedgerState, upToDate: string) {
  const startStr = getStartOfYearStr(upToDate);
  return totalServiceInRange(state, parseDate(startStr), parseDate(upToDate));
}

export function totalCharged(state: LedgerState, upToDate: string) {
  const start = parseDate(getStartOfYearStr(upToDate));
  const end = parseDate(upToDate);

  return totalChargedInRange(state, start, end);
}

export function balance(state: LedgerState, upToDate: string) {
  const charged = totalCharged(state, upToDate);
  const paid = totalPaidYtd(state, upToDate);
  const service = totalServiceYtd(state, upToDate);
  // Outstanding amount: what the business still owes you (can go negative if you are ahead).
  return charged - paid - service;
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

function isDateInRange(dateStr: string, startTime: number, endTime: number) {
  const t = parseDate(dateStr).getTime();
  return Number.isFinite(t) && t >= startTime && t <= endTime;
}

function dailyIncomeForDate(state: LedgerState, dateStr: string) {
  let dailyChargePaid = 0;
  let hasEmergencyPaidDay = false;

  for (const p of state.payments) {
    if (p.date !== dateStr) continue;
    if (p.type === "daily-charge") dailyChargePaid += p.amount;
    if (p.type === "emergency") hasEmergencyPaidDay = true;
  }

  if (hasEmergencyPaidDay) {
    return Math.max(dailyChargePaid, state.dailyCharge);
  }
  return dailyChargePaid;
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
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  const dates = new Set<string>();
  for (const p of state.payments) {
    if (p.type !== "daily-charge" && p.type !== "emergency") continue;
    if (!isDateInRange(p.date, startTime, endTime)) continue;
    dates.add(p.date);
  }

  let sum = 0;
  for (const dateStr of dates) {
    sum += dailyIncomeForDate(state, dateStr);
  }
  return sum;
}

export function totalServiceInRange(
  state: LedgerState,
  startDate: Date,
  endDate: Date
) {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  return state.payments
    .filter(
      (payment) =>
        payment.type === "service" &&
        isDateInRange(payment.date, startTime, endTime)
    )
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function dailyIncome(state: LedgerState, dateStr: string) {
  return dailyIncomeForDate(state, dateStr);
}

export type DayReportItem = {
  date: string;
  isSunday: boolean;
  isChargeable: boolean;
  hasServiceDay: boolean;
  hasEmergency: boolean;
  dailyChargeDue: number;
  inflow: number;
  outflow: number;
  payments: LedgerState["payments"];
  notes: string[];
};

export type RangeReportSummary = {
  startDate: string;
  endDate: string;
  totalDays: number;
  chargeableDays: number;
  serviceDaysCount: number;
  emergencyDaysCount: number;
  paidDaysCount: number;
  partialDaysCount: number;
  unpaidDaysCount: number;
  totalCharged: number;
  totalInflow: number;
  totalOutflow: number;
  netCashflow: number;
  balanceForPeriod: number;
  items: DayReportItem[];
};

export function getReportForRange(
  state: LedgerState,
  startDate: Date,
  endDate: Date
): RangeReportSummary {
  const items: DayReportItem[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const endNormalized = new Date(endDate);
  endNormalized.setHours(23, 59, 59, 999);

  let chargeableDays = 0;
  let serviceDaysCount = 0;
  let emergencyDaysCount = 0;
  let paidDaysCount = 0;
  let partialDaysCount = 0;
  let unpaidDaysCount = 0;

  while (current <= endNormalized) {
    const dateStr = formatDate(current);
    const isSunday = current.getDay() === 0;
    const isServiceDay = hasNonChargeOverride(state, current);
    const dayPayments = state.payments.filter((p) => p.date === dateStr);
    const hasEmergency = dayPayments.some((p) => p.type === "emergency");
    const isChargeable = !isSunday && !isServiceDay;

    if (isServiceDay) serviceDaysCount++;
    if (hasEmergency) emergencyDaysCount++;
    if (isChargeable) chargeableDays++;

    const inflow = dailyIncomeForDate(state, dateStr);
    const outflow = dayPayments
      .filter((p) => p.type === "service")
      .reduce((sum, p) => sum + p.amount, 0);

    const notes = dayPayments
      .filter((p) => Boolean(p.notes?.trim()))
      .map((p) => p.notes!.trim());

    if (isChargeable) {
      if (inflow >= state.dailyCharge) {
        paidDaysCount++;
      } else if (inflow > 0) {
        partialDaysCount++;
      } else {
        unpaidDaysCount++;
      }
    }

    items.push({
      date: dateStr,
      isSunday,
      isChargeable,
      hasServiceDay: isServiceDay,
      hasEmergency,
      dailyChargeDue: isChargeable ? state.dailyCharge : 0,
      inflow,
      outflow,
      payments: dayPayments,
      notes,
    });

    current.setDate(current.getDate() + 1);
  }

  const charged = totalChargedInRange(state, startDate, endDate);
  const paid = totalPaidInRange(state, startDate, endDate);
  const service = totalServiceInRange(state, startDate, endDate);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    totalDays: items.length,
    chargeableDays,
    serviceDaysCount,
    emergencyDaysCount,
    paidDaysCount,
    partialDaysCount,
    unpaidDaysCount,
    totalCharged: charged,
    totalInflow: paid,
    totalOutflow: service,
    netCashflow: paid - service,
    balanceForPeriod: charged - paid - service,
    items,
  };
}

