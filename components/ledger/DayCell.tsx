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
          <Badge className="bg-green-500 hover:bg-green-600 gap-0.5 border-0 text-[9px] sm:text-[10px] md:text-xs px-0.5 sm:px-1 md:px-2 py-0">
            <CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
            <span className="hidden md:inline">Paid</span>
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 gap-0.5 border-0 text-[9px] sm:text-[10px] md:text-xs px-0.5 sm:px-1 md:px-2 py-0">
            <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
            <span className="hidden md:inline">Partial</span>
          </Badge>
        );
      case "unpaid":
        return (
          <Badge variant="outline" className="gap-0.5 text-[9px] sm:text-[10px] md:text-xs px-0.5 sm:px-1 md:px-2 py-0">
            <span className="hidden md:inline">Unpaid</span>
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
      className={`h-16 sm:h-24 md:h-28 w-full aspect-square flex-col space-y-0.5 sm:space-y-1.5 md:space-y-2 relative transition-all duration-200 hover:scale-105 rounded-md md:rounded-lg ${
        today
          ? "border-2 border-primary bg-primary/5 shadow-md"
          : "hover:bg-muted/50"
      } ${isSunday ? "opacity-40 cursor-not-allowed bg-muted" : ""}`}
      onClick={!isSunday ? onClick : undefined}
    >
      <div className="flex items-center justify-between w-full px-0.5 sm:px-1">
        <span className="text-sm sm:text-base md:text-sm font-semibold leading-none">{date.getDate()}</span>
        {isSunday ? (
          <Badge variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs gap-0.5 sm:gap-1 px-0.5 sm:px-1 md:px-2 py-0">
            <Coffee className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
            <span className="hidden md:inline">Off</span>
          </Badge>
        ) : mounted ? (
          <div className="text-[9px] sm:text-[10px] md:text-xs">
            {getStatusBadge(status)}
          </div>
        ) : null}
      </div>
      {mounted && paymentAmount > 0 && (
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground leading-tight">
          <span className="hidden sm:inline">KSh</span>
          <span className="truncate">{paymentAmount.toLocaleString()}</span>
        </div>
      )}
    </Button>
  );
}
