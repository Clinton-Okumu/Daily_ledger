"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DayCell from "@/components/ledger/DayCell";
import PaymentEditor from "@/components/ledger/PaymentEditor";
import { LedgerState } from "@/types/ledger";
import {
  getDaysInMonth,
  getMonthName,
  getPreviousMonth,
  getNextMonth,
} from "@/lib/date";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function CalendarView({
  ledger,
  onChange,
}: {
  ledger: LedgerState;
  onChange: (ledger: LedgerState) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const days = getDaysInMonth(currentYear, currentMonth);

  const getEmptySlots = (): number => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    return firstDay;
  };

  const emptySlots = getEmptySlots();

  const handlePreviousMonth = () => {
    const [prevYear, prevMonth] = getPreviousMonth(currentYear, currentMonth);
    setCurrentYear(prevYear);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const [nextYear, nextMonth] = getNextMonth(currentYear, currentMonth);
    setCurrentYear(nextYear);
    setCurrentMonth(nextMonth);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Loading...
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Calendar className="w-5 h-5 text-primary" />
              {getMonthName(currentYear, currentMonth)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="gap-1 text-xs sm:text-sm"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
                className="shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5 md:gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map(
              (day, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground py-1 sm:py-2 uppercase tracking-wide"
                >
                  {day}
                </div>
              )
            )}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((date) => (
              <DayCell
                key={date.toISOString()}
                date={date}
                ledger={ledger}
                onClick={() => setSelectedDate(date)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <PaymentEditor
          date={selectedDate}
          ledger={ledger}
          onSave={onChange}
          onCancel={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
