export type PaymentType = "daily-charge" | "service" | "service-day" | "emergency";

export type ServiceImpact = "none" | "add" | "deduct";

export type Payment = {
  id: string;
  date: string;
  amount: number;
  type: PaymentType;
  notes?: string;
  referenceCode?: string;
  serviceImpact?: ServiceImpact;
};

export type LedgerState = {
  dailyCharge: number;
  payments: Payment[];
};

