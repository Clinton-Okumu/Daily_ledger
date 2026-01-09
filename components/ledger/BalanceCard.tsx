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
  const isOwed = currentBalance < 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="py-8 text-center relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            isOwed
              ? "from-destructive/10 to-destructive/5"
              : "from-primary/10 to-primary/5"
          }`}
        />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-center">
            <div
              className={`p-3 rounded-full ${
                isOwed
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              Current Balance
            </p>
            {mounted ? (
              <div className="flex items-center justify-center gap-2">
                {isOwed ? (
                  <ArrowDown className="w-6 h-6 text-destructive" />
                ) : (
                  <ArrowUp className="w-6 h-6 text-primary" />
                )}
                <p
                  className={`text-4xl font-bold tracking-tight ${
                    isOwed ? "text-destructive" : "text-primary"
                  }`}
                >
                  KSh {Math.abs(currentBalance).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-4xl font-bold text-muted-foreground">...</p>
            )}
            {mounted && (
              <p
                className={`text-sm font-medium ${
                  isOwed ? "text-destructive/80" : "text-primary/80"
                }`}
              >
                {isOwed ? "Amount Owed" : "Credit Available"}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Stored locally in your browser</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
