export type PaymentType = "daily-charge" | "service" | "service-day" | "emergency";

export type Payment = {
  id: string;
  date: string;
  amount: number;
  type: PaymentType;
};

export type LedgerState = {
  dailyCharge: number;
  payments: Payment[];
};
