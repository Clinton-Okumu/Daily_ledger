import { useState } from "react";
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
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {getMonthName(currentYear, currentMonth)}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="gap-1"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wide"
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
