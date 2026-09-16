"use client";

import { useState, useMemo } from "react";
import { LedgerState } from "@/types/ledger";
import { getReportForRange, RangeReportSummary } from "@/lib/ledger";
import { formatDate, parseDate } from "@/lib/date";
import { exportToCSV, downloadCSV } from "@/lib/backup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Calendar,
  X,
  Printer,
  Download,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

type PresetRange = "this-week" | "last-week" | "this-month" | "last-month" | "ytd" | "custom";

interface ReportsViewProps {
  ledger: LedgerState;
  onClose: () => void;
}

export default function ReportsView({ ledger, onClose }: ReportsViewProps) {
  const [preset, setPreset] = useState<PresetRange>("this-month");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "notes-only" | "service-only" | "emergency-only">("all");

  const today = useMemo(() => new Date(), []);

  // Compute dates based on preset
  const defaultDates = useMemo(() => {
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = d.getMonth();

    // Start & End of Month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    return {
      start: formatDate(startOfMonth),
      end: formatDate(endOfMonth > d ? d : endOfMonth),
    };
  }, []);

  const [startDateStr, setStartDateStr] = useState<string>(defaultDates.start);
  const [endDateStr, setEndDateStr] = useState<string>(defaultDates.end);

  const handlePresetChange = (newPreset: PresetRange) => {
    setPreset(newPreset);
    const now = new Date();

    if (newPreset === "this-week") {
      const currentDay = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - currentDay); // Sunday start or Monday start
      setStartDateStr(formatDate(start));
      setEndDateStr(formatDate(now));
    } else if (newPreset === "last-week") {
      const currentDay = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - currentDay - 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setStartDateStr(formatDate(start));
      setEndDateStr(formatDate(end));
    } else if (newPreset === "this-month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDateStr(formatDate(start));
      setEndDateStr(formatDate(now));
    } else if (newPreset === "last-month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDateStr(formatDate(start));
      setEndDateStr(formatDate(end));
    } else if (newPreset === "ytd") {
      const start = new Date(now.getFullYear(), 0, 1);
      setStartDateStr(formatDate(start));
      setEndDateStr(formatDate(now));
    }
  };

  const report: RangeReportSummary = useMemo(() => {
    const start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return getReportForRange(ledger, start, start);
    }
    return getReportForRange(ledger, start, end);
  }, [ledger, startDateStr, endDateStr]);

  // Filter items for display
  const filteredItems = useMemo(() => {
    return report.items.filter((item) => {
      // Type filtering
      if (filterType === "notes-only" && item.notes.length === 0) return false;
      if (filterType === "service-only" && !item.hasServiceDay && item.outflow === 0) return false;
      if (filterType === "emergency-only" && !item.hasEmergency) return false;

      // Text search in notes or reference code or date
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDate = item.date.includes(query);
        const matchesNotes = item.notes.some((n) => n.toLowerCase().includes(query));
        const matchesRef = item.payments.some((p) => p.referenceCode?.toLowerCase().includes(query));
        if (!matchesDate && !matchesNotes && !matchesRef) return false;
      }

      return true;
    });
  }, [report.items, filterType, searchQuery]);

  const handleExportCSV = () => {
    const csvData = exportToCSV(ledger, startDateStr, endDateStr);
    downloadCSV(`ledger-report-${startDateStr}-to-${endDateStr}.csv`, csvData);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-border/70">
        {/* Header */}
        <CardHeader className="p-4 sm:p-6 border-b shrink-0 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  Financial Reports & Analytics
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Track inflows, outflows, service expenses, and detailed day notes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm">
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {(
              [
                { id: "this-week", label: "This Week" },
                { id: "last-week", label: "Last Week" },
                { id: "this-month", label: "This Month" },
                { id: "last-month", label: "Last Month" },
                { id: "ytd", label: "Year-to-Date" },
                { id: "custom", label: "Custom Dates" },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.id}
                variant={preset === tab.id ? "default" : "secondary"}
                size="sm"
                onClick={() => handlePresetChange(tab.id)}
                className="text-xs h-8 px-3 rounded-lg"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {preset === "custom" && (
            <div className="flex flex-wrap items-center gap-3 pt-3 bg-muted/40 p-3 rounded-lg mt-2 border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">From:</span>
                <Input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">To:</span>
                <Input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
              <Badge variant="outline" className="text-xs">
                {report.totalDays} Days Selected
              </Badge>
            </div>
          )}
        </CardHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Inflows */}
            <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Inflow</span>
                <div className="p-1.5 rounded-lg bg-green-500/10 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                KSh {report.totalInflow.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">Daily charge & emergency</p>
            </div>

            {/* Outflows */}
            <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Outflow</span>
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">
                KSh {report.totalOutflow.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">Service & repairs</p>
            </div>

            {/* Net Cashflow */}
            <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Net Cashflow</span>
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-lg sm:text-2xl font-bold ${report.netCashflow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                KSh {report.netCashflow.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">Inflows minus Outflows</p>
            </div>

            {/* Charged / Balance */}
            <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Period Contract Due</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                KSh {report.totalCharged.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {report.chargeableDays} chargeable days @ KSh {ledger.dailyCharge}
              </p>
            </div>
          </div>

          {/* Operational Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-3 bg-muted/40 rounded-xl border text-center">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Chargeable</p>
              <p className="text-sm sm:text-base font-bold">{report.chargeableDays} days</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-green-600 font-medium">Fully Paid</p>
              <p className="text-sm sm:text-base font-bold text-green-600">{report.paidDaysCount} days</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-yellow-600 font-medium">Partial Paid</p>
              <p className="text-sm sm:text-base font-bold text-yellow-600">{report.partialDaysCount} days</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-red-600 font-medium">Overdue/Unpaid</p>
              <p className="text-sm sm:text-base font-bold text-red-600">{report.unpaidDaysCount} days</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-sky-600 font-medium">Service Days</p>
              <p className="text-sm sm:text-base font-bold text-sky-600">{report.serviceDaysCount} days</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-amber-600 font-medium">Emergency Days</p>
              <p className="text-sm sm:text-base font-bold text-amber-600">{report.emergencyDaysCount} days</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes, refs, or dates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="text-xs h-8 px-2.5"
              >
                All Days
              </Button>
              <Button
                variant={filterType === "notes-only" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("notes-only")}
                className="text-xs h-8 px-2.5"
              >
                With Notes
              </Button>
              <Button
                variant={filterType === "service-only" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("service-only")}
                className="text-xs h-8 px-2.5"
              >
                Service Records
              </Button>
              <Button
                variant={filterType === "emergency-only" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("emergency-only")}
                className="text-xs h-8 px-2.5"
              >
                Emergency Days
              </Button>
            </div>
          </div>

          {/* Detailed Itemized List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>Day & Details ({filteredItems.length})</span>
              <span>Financial Impact</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center border rounded-xl bg-muted/10 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No records match your selected date range and filters.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const dateObj = parseDate(item.date);
                const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const dateFormatted = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={item.date}
                    className={`rounded-xl border p-3.5 transition-all space-y-2 ${
                      item.isSunday
                        ? "bg-muted/30 opacity-70"
                        : item.hasEmergency
                        ? "bg-amber-500/5 border-amber-500/30"
                        : item.hasServiceDay
                        ? "bg-sky-500/5 border-sky-500/30"
                        : item.outflow > 0
                        ? "bg-orange-500/5 border-orange-500/30"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base">
                            {dayName}, {dateFormatted}
                          </span>
                          {item.isSunday && (
                            <Badge variant="secondary" className="text-[10px] py-0">
                              Sunday Off
                            </Badge>
                          )}
                          {item.hasServiceDay && (
                            <Badge className="bg-sky-500 hover:bg-sky-600 text-[10px] py-0 gap-1 border-0">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Service Day (Excused)
                            </Badge>
                          )}
                          {item.hasEmergency && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] py-0 gap-1 border-0">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Emergency Day
                            </Badge>
                          )}
                          {!item.isSunday && !item.hasServiceDay && (
                            item.inflow >= item.dailyChargeDue ? (
                              <Badge className="bg-green-500 hover:bg-green-600 text-[10px] py-0 gap-1 border-0">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Paid
                              </Badge>
                            ) : item.inflow > 0 ? (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-[10px] py-0 gap-1 border-0">
                                <Clock className="w-2.5 h-2.5" />
                                Partial
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] py-0">
                                Unpaid
                              </Badge>
                            )
                          )}
                        </div>

                        {/* Payment Breakdown / Reference info */}
                        {item.payments.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {item.payments.map((p) => (
                              <span key={p.id} className="bg-muted px-2 py-0.5 rounded-md font-mono text-[11px]">
                                {p.type === "service" ? "Service" : p.type === "daily-charge" ? "Charge" : p.type}: KSh {p.amount.toLocaleString()}
                                {p.referenceCode && ` • Ref: ${p.referenceCode}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Amounts */}
                      <div className="text-right shrink-0">
                        {item.inflow > 0 && (
                          <p className="text-sm sm:text-base font-bold text-green-600">
                            +KSh {item.inflow.toLocaleString()}
                          </p>
                        )}
                        {item.outflow > 0 && (
                          <p className="text-sm sm:text-base font-bold text-orange-600">
                            -KSh {item.outflow.toLocaleString()}
                          </p>
                        )}
                        {item.inflow === 0 && item.outflow === 0 && (
                          <p className="text-xs text-muted-foreground font-medium">
                            {item.isSunday ? "No charge" : item.hasServiceDay ? "Excused" : "KSh 0"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Notes Callout Box */}
                    {item.notes.length > 0 && (
                      <div className="rounded-lg bg-muted/60 border border-border/50 p-2 text-xs text-foreground/90 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-muted-foreground text-[11px]">
                          <FileText className="w-3 h-3 text-primary" />
                          <span>Notes & Explanations:</span>
                        </div>
                        {item.notes.map((note, idx) => (
                          <p key={idx} className="italic pl-4 text-xs font-normal">
                            &ldquo;{note}&rdquo;
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Period: <span className="font-semibold text-foreground">{startDateStr}</span> to{" "}
            <span className="font-semibold text-foreground">{endDateStr}</span> • Net Balance Impact:{" "}
            <span className="font-semibold text-foreground">KSh {report.balanceForPeriod.toLocaleString()}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Report
          </Button>
        </div>
      </Card>
    </div>
  );
}
