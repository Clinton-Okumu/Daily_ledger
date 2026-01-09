export type Payment = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
};

export type LedgerState = {
  dailyCharge: number;
  payments: Payment[];
};
