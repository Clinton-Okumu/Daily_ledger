"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LedgerState } from "@/types/ledger";
import { balance, totalPaid, totalService, totalCharged } from "@/lib/ledger";
import { formatDate } from "@/lib/date";
import { Printer, X, CheckCircle, Clock, Wallet, FileText, Briefcase } from "lucide-react";
import { getDayStatus } from "@/lib/status";
import { useRef, useEffect } from "react";

interface PaymentPrintViewProps {
  ledger: LedgerState;
  onClose: () => void;
  onPrint: () => void;
}

export default function PaymentPrintView({
  ledger,
  onClose,
  onPrint,
}: PaymentPrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const today = formatDate(new Date());
  const currentBalance = balance(ledger, today);
  const businessOwes = currentBalance < 0;
  const paid = totalPaid(ledger);
  const service = totalService(ledger);
  const charged = totalCharged(ledger, today);

  const sortedPayments = [...ledger.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handlePrint = () => {
    const printContent = document.getElementById("printable-content");
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Statement</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              margin-bottom: 5px;
            }
            .date {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .summary-item {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .summary-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
            }
            .daily-charge {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 30px;
            }
            .payment-history h2 {
              margin-bottom: 15px;
            }
            .payment-item {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .outstanding {
              background: #fee2e2;
              border: 1px solid #fca5a5;
              border-radius: 8px;
              padding: 15px;
              margin-top: 30px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    onPrint();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-lg shadow-2xl flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Payment Statement</h2>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6" ref={printRef}>
          <div id="printable-content">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Payment Statement</h1>
                <p className="text-muted-foreground">
                  Generated on {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className={`text-2xl font-bold ${businessOwes ? "text-red-600" : "text-green-600"}`}>
                    KSh {Math.abs(currentBalance).toLocaleString()}
                  </p>
                  <p className={`text-xs mt-1 ${businessOwes ? "text-red-600" : "text-green-600"}`}>
                    {businessOwes ? "Business Owes You" : "You Owe Business"}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Paid (In)</p>
                  <p className="text-2xl font-bold text-green-600">
                    KSh {paid.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Service (Out)</p>
                  <p className="text-2xl font-bold text-orange-600">
                    KSh {service.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Charged</p>
                  <p className="text-2xl font-bold text-blue-600">
                    KSh {charged.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Daily Charge</h3>
                  <Badge variant="outline">KSh {ledger.dailyCharge.toLocaleString()}/day</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Payment History
                </h3>

                {sortedPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedPayments.map((payment) => {
                      const status = getDayStatus(ledger, payment.date);
                      const date = new Date(payment.date);
                      const isService = payment.type === "service";

                      return (
                        <div
                          key={payment.id}
                          className="p-4 border rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {isService ? (
                              <div className="p-1.5 bg-orange-100 rounded-full">
                                <Briefcase className="w-5 h-5 text-orange-600" />
                              </div>
                            ) : status === "paid" && (
                              <div className="p-1.5 bg-green-100 rounded-full">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                            )}
                            {!isService && status === "partial" && (
                              <div className="p-1.5 bg-yellow-100 rounded-full">
                                <Clock className="w-5 h-5 text-yellow-600" />
                              </div>
                            )}
                            {!isService && status === "none" && (
                              <div className="p-1.5 bg-blue-100 rounded-full">
                                <Wallet className="w-5 h-5 text-blue-600" />
                              </div>
                            )}

                            <div>
                              <p className="font-medium">
                                {date.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {date.toLocaleDateString("en-US", {
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`font-bold text-lg ${isService ? "text-orange-600" : "text-green-600"}`}>
                              {isService ? "-" : "+"}KSh {payment.amount.toLocaleString()}
                            </p>
                            <Badge variant={isService ? "destructive" : status === "paid" ? "default" : "secondary"} className="text-xs">
                              {isService ? "Service Payment" : status === "paid" ? "Paid in Full" : status === "partial" ? "Partial" : "Recorded"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {businessOwes && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive font-medium">
                    Outstanding Balance
                  </div>
                  <p className="text-2xl font-bold text-destructive mt-2">
                    KSh {Math.abs(currentBalance).toLocaleString()}
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">
                    Please clear the outstanding balance at your earliest convenience.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t text-center text-sm text-muted-foreground">
          Print or close to return to the ledger
        </div>
      </div>
    </div>
  );
}
