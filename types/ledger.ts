export type PaymentType = "daily-charge" | "service" | "service-day" | "emergency";

export type Payment = {
  id: string;
  date: string;
  amount: number;
  type: PaymentType;
  notes?: string;
  referenceCode?: string;
};

export type LedgerState = {
  dailyCharge: number;
  payments: Payment[];
};

