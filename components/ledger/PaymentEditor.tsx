import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LedgerState, PaymentType } from "@/types/ledger";
import { formatDate } from "@/lib/date";
import { Wallet2, Trash2, X, CheckCircle2, Calendar, Briefcase, AlertTriangle } from "lucide-react";

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
  const dayPayments = ledger.payments.filter((p) => p.date === dateStr);
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<PaymentType>(
    "daily-charge"
  );

  if (!date) return null;

  const handleSave = () => {
    const dateStr = formatDate(date);
    const isPaidDayType = type === "service-day" || type === "emergency";
    const numAmount = isPaidDayType ? 0 : parseFloat(amount) || 0;

    if (!isPaidDayType && numAmount === 0) {
      return;
    }

    const updatedPayments = [
      ...ledger.payments,
      {
        id: crypto.randomUUID(),
        date: dateStr,
        amount: numAmount,
        type,
      },
    ];

    onSave({ ...ledger, payments: updatedPayments });
    setAmount("");
    setType("daily-charge");
  };

  const handleDelete = (id: string) => {
    const updatedPayments = ledger.payments.filter((p) => p.id !== id);
    onSave({ ...ledger, payments: updatedPayments });
    setAmount("");
    setType("daily-charge");
  };

  const handleDeleteDay = () => {
    const updatedPayments = ledger.payments.filter((p) => p.date !== dateStr);
    onSave({ ...ledger, payments: updatedPayments });
    setAmount("");
    setType("daily-charge");
  };

  const hasPayments = dayPayments.length > 0;
  const isPaidDayType = type === "service-day" || type === "emergency";
  const handleTypeChange = (value: string) => {
    const nextType = value as PaymentType;
    setType(nextType);
    if (nextType === "service-day" || nextType === "emergency") {
      setAmount("0");
    } else if (amount === "0") {
      setAmount("");
    }
  };

  const formatTypeLabel = (paymentType: PaymentType) => {
    switch (paymentType) {
      case "daily-charge":
        return "Daily Charge";
      case "service":
        return "Service";
      case "service-day":
        return "Service Day";
      case "emergency":
        return "Emergency Day";
      default:
        return "Payment";
    }
  };

  const formatAmountLabel = (payment: { amount: number; type: PaymentType }) => {
    if (payment.type === "service-day") {
      return "Service day";
    }
    if (payment.type === "emergency") {
      return "Paid day";
    }

    const sign = payment.type === "service" ? "-" : "+";
    return `${sign}KSh ${payment.amount.toLocaleString()}`;
  };

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
            <Select value={type} onValueChange={handleTypeChange}>
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
                <SelectItem value="service-day">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Service Day (marker)</span>
                  </div>
                </SelectItem>
                <SelectItem value="emergency">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Emergency Day (Paid)</span>
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
                disabled={isPaidDayType}
                className="text-lg h-12 pl-4 pr-12"
              />
              {amount && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  KSh
                </span>
              )}
            </div>
          </div>
          {dayPayments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Entries for this day
              </p>
              <div className="space-y-2">
                {dayPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatTypeLabel(payment.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAmountLabel(payment)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(payment.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1 gap-2 h-12">
              <CheckCircle2 className="w-5 h-5" />
              Save Payment
            </Button>
            <Button
              onClick={handleDeleteDay}
              variant="destructive"
              disabled={!hasPayments}
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
