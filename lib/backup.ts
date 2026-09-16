import { LedgerState } from "@/types/ledger";
import { loadLedger, saveLedger } from "@/lib/storage";

export function exportToJSON(): string {
  const ledger = loadLedger();
  return JSON.stringify(ledger, null, 2);
}

export function importFromJSON(jsonString: string): LedgerState {
  try {
    const ledger = JSON.parse(jsonString);
    if (!isValidLedgerState(ledger)) {
      throw new Error("Invalid ledger data");
    }
    saveLedger(ledger);
    return ledger;
  } catch {
    throw new Error("Failed to import ledger data");
  }
}

function isValidLedgerState(data: unknown): data is LedgerState {
  if (!data || typeof data !== "object") {
    return false;
  }

  const ledgerData = data as Record<string, unknown>;

  if (
    typeof ledgerData.dailyCharge !== "number" ||
    !Array.isArray(ledgerData.payments)
  ) {
    return false;
  }

  return ledgerData.payments.every(
    (p: unknown) =>
      typeof p === "object" &&
      p !== null &&
      typeof (p as Record<string, unknown>).id === "string" &&
      typeof (p as Record<string, unknown>).date === "string" &&
      typeof (p as Record<string, unknown>).amount === "number"
  );
}

export function downloadJSON(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCSV(ledger: LedgerState, startDate?: string, endDate?: string): string {
  let payments = [...ledger.payments].sort((a, b) => a.date.localeCompare(b.date));

  if (startDate) {
    payments = payments.filter((p) => p.date >= startDate);
  }
  if (endDate) {
    payments = payments.filter((p) => p.date <= endDate);
  }

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = ["Date", "Type", "Inflow (KSh)", "Outflow (KSh)", "Reference Code", "Notes"];
  const rows = payments.map((p) => {
    const isInflow = p.type === "daily-charge" || p.type === "emergency";
    const isOutflow = p.type === "service";
    const inflow = isInflow ? (p.type === "emergency" && p.amount === 0 ? ledger.dailyCharge : p.amount) : 0;
    const outflow = isOutflow ? p.amount : 0;

    return [
      escapeCSV(p.date),
      escapeCSV(p.type),
      escapeCSV(inflow),
      escapeCSV(outflow),
      escapeCSV(p.referenceCode || ""),
      escapeCSV(p.notes || ""),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

