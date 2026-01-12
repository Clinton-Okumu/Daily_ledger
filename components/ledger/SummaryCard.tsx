import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LedgerState } from "@/types/ledger";
import { totalPaid, totalService, totalCharged } from "@/lib/ledger";
import { formatDate } from "@/lib/date";
import { TrendingUp, Wallet2, Calendar, Briefcase } from "lucide-react";

export default function SummaryCard({ ledger }: { ledger: LedgerState }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = formatDate(new Date());
  const paid = totalPaid(ledger);
  const service = totalService(ledger);
  const charged = totalCharged(ledger, today);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {mounted ? (
          <>
        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Charged</p>
              <p className="text-sm sm:text-lg font-bold">KSh {charged.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
              <Wallet2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Paid</p>
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
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Service</p>
              <p className="text-sm sm:text-lg font-bold">KSh {service.toLocaleString()}</p>
            </div>
          </div>
        </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Daily Charge</p>
                  <p className="text-sm sm:text-lg font-bold">KSh {ledger.dailyCharge.toLocaleString()}</p>
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
