import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LedgerState } from "@/types/ledger";
import { exportToJSON, importFromJSON, downloadJSON, exportToCSV, downloadCSV } from "@/lib/backup";
import { FileDown, FileUp, Database, ShieldCheck, Printer, Cloud, RefreshCw, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import PaymentPrintView from "./PaymentPrintView";

interface DataActionsProps {
  onLedgerChange: (ledger: LedgerState) => void;
  ledger: LedgerState;
  cloudKey: string;
  cloudStatus: "off" | "loading" | "ready" | "saving" | "error";
  onCloudKeyChange: (key: string) => void;
  onCloudSyncNow: () => void;
  onOpenReports?: () => void;
}


export default function DataActions({
  onLedgerChange,
  ledger,
  cloudKey,
  cloudStatus,
  onCloudKeyChange,
  onCloudSyncNow,
  onOpenReports,
}: DataActionsProps) {
  const [showPrintView, setShowPrintView] = useState(false);

  const handleExport = () => {
    const data = exportToJSON();
    const date = new Date().toISOString().split("T")[0];
    downloadJSON(`ledger-backup-${date}.json`, data);
  };

  const handleExportCSV = () => {
    const data = exportToCSV(ledger);
    const date = new Date().toISOString().split("T")[0];
    downloadCSV(`ledger-export-${date}.csv`, data);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedLedger = importFromJSON(content);
          onLedgerChange(importedLedger);
          alert("Ledger imported successfully!");
        } catch {
          alert("Failed to import ledger. Please check the file format.");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handlePrint = () => {
    setShowPrintView(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Cloud className="w-4 h-4 text-primary" />
              Cloud Sync
            </div>
            <div className="space-y-2">
              <Label htmlFor="cloudKey" className="text-xs text-muted-foreground">
                Cloud key
              </Label>
              <Input
                id="cloudKey"
                value={cloudKey}
                onChange={(e) => onCloudKeyChange(e.target.value)}
                placeholder="Paste shared secret"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  {cloudStatus === "off"
                    ? "Cloud off"
                    : cloudStatus === "loading"
                      ? "Loading..."
                      : cloudStatus === "saving"
                        ? "Saving..."
                        : cloudStatus === "ready"
                          ? "Synced"
                          : "Error"}
                </div>
                <Button
                  onClick={onCloudSyncNow}
                  variant="outline"
                  size="sm"
                  disabled={!cloudKey || cloudStatus === "loading"}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync now
                </Button>
              </div>
            </div>
          </div>

          {onOpenReports && (
            <Button onClick={onOpenReports} className="w-full gap-2 h-12 shadow-sm font-medium">
              <FileText className="w-5 h-5" />
              Weekly / Monthly Reports
            </Button>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExport} variant="outline" className="flex-1 gap-2 h-11">
              <FileDown className="w-4 h-4" />
              Backup JSON
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="flex-1 gap-2 h-11">
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleImport} variant="outline" className="flex-1 gap-2 h-11">
              <FileUp className="w-4 h-4" />
              Restore Backup
            </Button>
            <Button onClick={handlePrint} variant="secondary" className="flex-1 gap-2 h-11">
              <Printer className="w-4 h-4" />
              Statement
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Export your data regularly to prevent loss</span>
          </div>
        </CardContent>
      </Card>

      {showPrintView && (
        <PaymentPrintView
          ledger={ledger}
          onClose={() => setShowPrintView(false)}
          onPrint={() => setShowPrintView(false)}
        />
      )}
    </>
  );
}

