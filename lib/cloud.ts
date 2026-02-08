import { LedgerState } from "@/types/ledger";

const CLOUD_KEY_STORAGE = "daily-ledger-cloud-key";

export function loadCloudKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CLOUD_KEY_STORAGE) ?? "";
}

export function saveCloudKey(key: string) {
  if (typeof window === "undefined") return;
  if (!key) {
    localStorage.removeItem(CLOUD_KEY_STORAGE);
    return;
  }
  localStorage.setItem(CLOUD_KEY_STORAGE, key);
}

export async function fetchLedgerFromCloud(params: {
  year: number;
  cloudKey: string;
}): Promise<LedgerState> {
  const res = await fetch(`/api/ledger?year=${params.year}`, {
    headers: {
      "x-ledger-secret": params.cloudKey,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Cloud load failed (${res.status})`);
  }
  const json = (await res.json()) as { state?: LedgerState };
  if (!json.state) throw new Error("Cloud response missing state");
  return json.state;
}

export async function saveLedgerToCloud(params: {
  year: number;
  cloudKey: string;
  state: LedgerState;
}): Promise<void> {
  const res = await fetch(`/api/ledger?year=${params.year}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-ledger-secret": params.cloudKey,
    },
    body: JSON.stringify(params.state),
  });
  if (!res.ok) {
    throw new Error(`Cloud save failed (${res.status})`);
  }
}
