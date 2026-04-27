import { formatVietnamWeekday } from "../../lib/format";

type Props = {
  days: { dateKey: string; completed?: boolean }[];
  onUnmark?: (dateKey: string) => void;
};

export default function WeekGrid({ days, onUnmark }: Props) {
  return (
    <div className="week">
      {days.map((day) => (
        <div className={`day ${day.completed ? "done" : ""}`} key={day.dateKey}>
          <span>{formatVietnamWeekday(day.dateKey)}</span>
          <b>{day.dateKey.slice(8)}</b>
          {day.completed && onUnmark ? (
            <button className="small" onClick={() => onUnmark(day.dateKey)}>
              Unmark
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
