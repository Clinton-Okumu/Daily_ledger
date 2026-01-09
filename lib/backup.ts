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
