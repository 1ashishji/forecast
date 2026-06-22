import { CalendarDays } from 'lucide-react';

function formatTemp(value) {
  if (value === null || value === undefined || value === '') return '--';
  return `${Math.round(Number(value))}\u00b0F`;
}

/**
 * @param {{ date: string, high_temperature: number, low_temperature: number, condition: string }} day
 */
function DailyTile({ day }) {
  // Force noon local time to avoid date-shifting due to UTC midnight parsing.
  const label = new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="daily-tile">
      <div className="daily-date">{label}</div>
      <div className="daily-condition">{day.condition}</div>
      <div className="daily-range">
        <strong>{formatTemp(day.high_temperature)}</strong>
        <span>{formatTemp(day.low_temperature)}</span>
      </div>
    </div>
  );
}

/**
 * @param {{ days: Array }} props
 */
export function DailyForecastCard({ days }) {
  return (
    <article className="card daily-card">
      <div className="daily-header">
        <div>
          <div className="card-kicker">5-Day Outlook</div>
          <h3>Daily forecast</h3>
        </div>
        <CalendarDays size={20} />
      </div>

      <div className="daily-grid">
        {days.map((day) => (
          <DailyTile key={day.date} day={day} />
        ))}
      </div>
    </article>
  );
}
