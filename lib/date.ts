export function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function getMonthName(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function getPreviousMonth(year: number, month: number): [number, number] {
  const date = new Date(year, month, 1);
  date.setMonth(date.getMonth() - 1);
  return [date.getFullYear(), date.getMonth()];
}

export function getNextMonth(year: number, month: number): [number, number] {
  const date = new Date(year, month, 1);
  date.setMonth(date.getMonth() + 1);
  return [date.getFullYear(), date.getMonth()];
}
