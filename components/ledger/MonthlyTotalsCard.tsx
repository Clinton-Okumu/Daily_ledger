import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LedgerState } from "@/types/ledger";
import { totalChargedInRange, totalPaidInRange, totalServiceInRange } from "@/lib/ledger";
import { AlertTriangle, Briefcase, CalendarDays, Wallet2 } from "lucide-react";

export default function MonthlyTotalsCard({ ledger }: { ledger: LedgerState }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLabel = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const due = totalChargedInRange(ledger, startOfMonth, today);
  const paid = totalPaidInRange(ledger, startOfMonth, today);
  const service = totalServiceInRange(ledger, startOfMonth, today);
  const outstanding = Math.max(0, due - paid - service);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          This Month
          <span className="text-xs sm:text-sm text-muted-foreground font-normal">
            {monthLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {mounted ? (
          <>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                  <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Due to Date</p>
                  <p className="text-sm sm:text-lg font-bold">KSh {due.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                  <Wallet2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Paid to Date</p>
                  <p className="text-sm sm:text-lg font-bold">KSh {paid.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-500/10 rounded-lg">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
                <div>
                   <p className="text-[10px] sm:text-xs text-muted-foreground">Service Fees</p>
                   <p className="text-sm sm:text-lg font-bold">KSh {service.toLocaleString()}</p>
                 </div>
               </div>
             </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Outstanding (after service)</p>
                  <p className="text-sm sm:text-lg font-bold">KSh {outstanding.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4 text-sm">Loading...</div>
        )}
      </CardContent>
    </Card>
  );
}
