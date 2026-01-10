import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LedgerState, PaymentType } from "@/types/ledger";
import { formatDate } from "@/lib/date";
import { Wallet2, Trash2, X, CheckCircle2, Calendar, Briefcase } from "lucide-react";

interface PaymentEditorProps {
  date: Date;
  ledger: LedgerState;
  onSave: (ledger: LedgerState) => void;
  onCancel: () => void;
}

export default function PaymentEditor({
  date,
  ledger,
  onSave,
  onCancel,
}: PaymentEditorProps) {
  const dateStr = formatDate(date);
  const existingPayment = ledger.payments.find((p) => p.date === dateStr);
  const [amount, setAmount] = useState<string>(
    existingPayment && existingPayment.amount > 0 ? String(existingPayment.amount) : ""
  );
  const [type, setType] = useState<PaymentType>(
    existingPayment?.type || "daily-charge"
  );

  if (!date) return null;

  const handleSave = () => {
    const dateStr = formatDate(date);
    const numAmount = parseFloat(amount) || 0;

    const existingPaymentIndex = ledger.payments.findIndex(
      (p) => p.date === dateStr
    );

    let updatedPayments: typeof ledger.payments;

    if (numAmount === 0) {
      updatedPayments = ledger.payments.filter((p) => p.date !== dateStr);
    } else if (existingPaymentIndex >= 0) {
      updatedPayments = [...ledger.payments];
      updatedPayments[existingPaymentIndex] = {
        id: ledger.payments[existingPaymentIndex].id,
        date: dateStr,
        amount: numAmount,
        type,
      };
    } else {
      updatedPayments = [
        ...ledger.payments,
        {
          id: crypto.randomUUID(),
          date: dateStr,
          amount: numAmount,
          type,
        },
      ];
    }

    onSave({ ...ledger, payments: updatedPayments });
    setAmount("");
    setType("daily-charge");
  };

  const handleDelete = () => {
    const updatedPayments = ledger.payments.filter((p) => p.date !== dateStr);
    onSave({ ...ledger, payments: updatedPayments });
    setAmount("");
    setType("daily-charge");
  };

  const hasPayment = existingPayment && existingPayment.amount > 0;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <Card
        className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet2 className="w-5 h-5 text-primary" />
              <CardTitle>Edit Payment</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base font-medium">
              Payment Type
            </Label>
            <Select value={type} onValueChange={(value) => setType(value as PaymentType)}>
              <SelectTrigger id="type" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily-charge">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>Daily Charge (Business pays YOU)</span>
                  </div>
                </SelectItem>
                <SelectItem value="service">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-orange-600" />
                    <span>Service (YOU pay for service)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">
              Amount (KSh)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="text-lg h-12 pl-4 pr-12"
              />
              {amount && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  KSh
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1 gap-2 h-12">
              <CheckCircle2 className="w-5 h-5" />
              Save Payment
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={!hasPayment}
              className="h-12 px-4"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
