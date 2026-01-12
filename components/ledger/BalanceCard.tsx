import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LedgerState } from "@/types/ledger";
import { balance } from "@/lib/ledger";
import { formatDate } from "@/lib/date";
import { ArrowUp, ArrowDown, Wallet, Shield } from "lucide-react";

export default function BalanceCard({ ledger }: { ledger: LedgerState }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = formatDate(new Date());
  const currentBalance = balance(ledger, today);
  const businessOwes = currentBalance < 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="py-6 sm:py-8 text-center relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            businessOwes
              ? "from-red-500/10 to-red-500/5"
              : "from-green-500/10 to-green-500/5"
          }`}
        />
        <div className="relative z-10 space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div
              className={`p-2.5 sm:p-3 rounded-full ${
                businessOwes
                  ? "bg-red-500/10 text-red-600"
                  : "bg-green-500/10 text-green-600"
              }`}
            >
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Current Balance
            </p>
            {mounted ? (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {businessOwes ? (
                  <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                ) : (
                  <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                )}
                <p
                  className={`text-2xl sm:text-4xl font-bold tracking-tight ${
                    businessOwes ? "text-red-600" : "text-green-600"
                  }`}
                >
                  KSh {Math.abs(currentBalance).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-2xl sm:text-4xl font-bold text-muted-foreground">...</p>
            )}
            {mounted && (
              <p
                className={`text-xs sm:text-sm font-medium ${
                  businessOwes ? "text-red-600/80" : "text-green-600/80"
                }`}
              >
                {businessOwes ? "Business Owes You" : "You Owe Business"}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Stored locally in your browser</span>
            <span className="sm:hidden">Local storage</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
