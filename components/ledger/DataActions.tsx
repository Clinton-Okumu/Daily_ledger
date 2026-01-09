import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LedgerState } from "@/types/ledger";
import { exportToJSON, importFromJSON, downloadJSON } from "@/lib/backup";
import { FileDown, FileUp, Database, ShieldCheck } from "lucide-react";

interface DataActionsProps {
  onLedgerChange: (ledger: LedgerState) => void;
}

export default function DataActions({
  onLedgerChange,
}: DataActionsProps) {
  const handleExport = () => {
    const data = exportToJSON();
    const date = new Date().toISOString().split("T")[0];
    downloadJSON(`ledger-backup-${date}.json`, data);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleExport} className="flex-1 gap-2 h-12">
            <FileDown className="w-5 h-5" />
            Export Backup
          </Button>
          <Button onClick={handleImport} variant="outline" className="flex-1 gap-2 h-12">
            <FileUp className="w-5 h-5" />
            Import Backup
          </Button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Export your data regularly to prevent loss</span>
        </div>
      </CardContent>
    </Card>
  );
}
