import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { LedgerState } from "@/types/ledger";

type LedgerRow = {
  ledger_year: number;
  state: LedgerState;
  updated_at: string;
};

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getYearFromRequest(request: Request): number {
  const url = new URL(request.url);
  const yearStr = url.searchParams.get("year") ?? String(new Date().getFullYear());
  const year = Number.parseInt(yearStr, 10);
  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    throw new Error("Invalid year");
  }
  return year;
}

function assertAuthorized(request: Request) {
  const sharedSecret = getEnv("LEDGER_SHARED_SECRET");
  const provided = request.headers.get("x-ledger-secret") ?? "";
  if (!provided || provided !== sharedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function getSupabaseAdmin() {
  const url = getEnv("SUPABASE_URL");
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SECRET;
  if (!key) throw new Error("Missing env var: SUPABASE_SECRET_KEY (or SUPABASE_SECRET)");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isValidLedgerState(data: unknown): data is LedgerState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (typeof d.dailyCharge !== "number") return false;
  if (!Array.isArray(d.payments)) return false;
  return d.payments.every((p) => {
    if (!p || typeof p !== "object") return false;
    const r = p as Record<string, unknown>;
    return (
      typeof r.id === "string" &&
      typeof r.date === "string" &&
      typeof r.amount === "number" &&
      typeof r.type === "string"
    );
  });
}

const DEFAULT_STATE: LedgerState = { dailyCharge: 300, payments: [] };

export async function GET(request: Request) {
  try {
    const unauthorized = assertAuthorized(request);
    if (unauthorized) return unauthorized;

    const year = getYearFromRequest(request);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("ledger_years")
      .select("ledger_year,state,updated_at")
      .eq("ledger_year", year)
      .maybeSingle<LedgerRow>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ year, state: data?.state ?? DEFAULT_STATE });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const unauthorized = assertAuthorized(request);
    if (unauthorized) return unauthorized;

    const year = getYearFromRequest(request);
    const body = await request.json();
    if (!isValidLedgerState(body)) {
      return NextResponse.json({ error: "Invalid ledger state" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("ledger_years")
      .upsert({ ledger_year: year, state: body, updated_at: new Date().toISOString() });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 400 }
    );
  }
}
