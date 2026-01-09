import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, isToday } from "@/lib/date";
import { getDayStatus, DayStatus, getDayPayment } from "@/lib/status";
import { LedgerState } from "@/types/ledger";
import { CheckCircle2, Clock, Coffee } from "lucide-react";

export default function DayCell({
  date,
  ledger,
  onClick,
}: {
  date: Date;
  ledger: LedgerState;
  onClick: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateStr = formatDate(date);
  const status = getDayStatus(ledger, dateStr);
  const paymentAmount = getDayPayment(ledger, dateStr);
  const today = isToday(date);
  const isSunday = date.getDay() === 0;

  const getStatusBadge = (status: DayStatus) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 gap-1 border-0">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 gap-1 border-0">
            <Clock className="w-3 h-3" />
            Partial
          </Badge>
        );
      case "unpaid":
        return (
          <Badge variant="outline" className="gap-1">
            Unpaid
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Button
      variant="ghost"
      disabled={isSunday}
      className={`h-28 flex-col space-y-2 relative transition-all duration-200 hover:scale-105 ${
        today
          ? "border-2 border-primary bg-primary/5 shadow-md"
          : "hover:bg-muted/50"
      } ${isSunday ? "opacity-40 cursor-not-allowed bg-muted" : ""}`}
      onClick={!isSunday ? onClick : undefined}
    >
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-sm font-semibold">{date.getDate()}</span>
        {isSunday ? (
          <Badge variant="secondary" className="text-xs gap-1">
            <Coffee className="w-3 h-3" />
            Off
          </Badge>
        ) : mounted ? (
          getStatusBadge(status)
        ) : null}
      </div>
      {mounted && paymentAmount > 0 && (
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <span>KSh</span>
          <span>{paymentAmount.toLocaleString()}</span>
        </div>
      )}
    </Button>
  );
}
