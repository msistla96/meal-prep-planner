const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function dateForDayIndex(index: number) {
  const date = startOfWeek(new Date());
  date.setDate(date.getDate() + index);
  return toIsoDate(date);
}

export function CalendarStrip({
  selectedDate,
  hasPlanOnDate,
  onSelect
}: {
  selectedDate: string;
  hasPlanOnDate: (date: string) => boolean;
  onSelect: (date: string) => void;
}) {
  return (
    <div className="calendar-strip" aria-label="Calendar">
      {dayLabels.map((label, index) => {
        const date = dateForDayIndex(index);
        return (
          <button
            key={label}
            type="button"
            className={`calendar-day ${date === selectedDate ? "active" : ""}`}
            onClick={() => onSelect(date)}
          >
            <span>{label}</span>
            <strong>{Number(date.slice(-2))}</strong>
            {hasPlanOnDate(date) ? <i aria-label="meal planned" /> : null}
          </button>
        );
      })}
    </div>
  );
}
