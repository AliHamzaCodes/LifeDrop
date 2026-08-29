import { useState, useMemo } from 'react';
import './CustomCalendar.scss';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Returns 'YYYY-MM-DD' string in local time (not UTC) */
const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Parses 'YYYY-MM-DD' string as a local Date (avoids UTC off-by-one) */
const parseLocalDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
};

/** Formats a Date for the trigger label, e.g. "Jun 16, 2026" */
export const formatDisplayDate = (str) => {
  const d = parseLocalDate(str);
  if (!d) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

// ─── CustomCalendar component ─────────────────────────────────────────────────
/**
 * Props:
 *  value     {string}   — selected date as 'YYYY-MM-DD' or ''
 *  maxDate   {string}   — max selectable date as 'YYYY-MM-DD' (optional)
 *  onChange  {fn}       — called with 'YYYY-MM-DD' string when a date is chosen
 *  onClose   {fn}       — called when the user wants to dismiss the calendar
 */
const CustomCalendar = ({ value, maxDate, onChange, onClose }) => {
  const today = useMemo(() => new Date(), []);
  const selectedDate = useMemo(() => parseLocalDate(value), [value]);

  // Start the view on the selected month, or current month
  const [currentDate, setCurrentDate] = useState(() => {
    const base = selectedDate ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // ── Month label ────────────────────────────────────────────────────────────
  const monthYearLabel = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // ── Build calendar grid (42 cells = 6 rows × 7 cols) ──────────────────────
  const calendarCells = useMemo(() => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay       = new Date(year, month, 1).getDay();
    const daysInMonth    = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];

    // ── Trailing days from prev month ──
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        currentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }

    // ── Current month days ──
    for (let d = 1; d <= daysInMonth; d++) {
      const date    = new Date(year, month, d);
      const dateStr = toLocalDateString(date);
      const isDisabled = maxDate ? dateStr > maxDate : false;

      cells.push({
        day: d,
        currentMonth: true,
        isToday:    date.toDateString() === today.toDateString(),
        isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
        isDisabled,
        date,
      });
    }

    // ── Leading days from next month (pad to 42) ──
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        currentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
        date: new Date(year, month + 1, d),
      });
    }

    return cells;
  }, [currentDate, selectedDate, maxDate, today]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // ── Select a day ──────────────────────────────────────────────────────────
  const selectDate = (cell) => {
    if (!cell.currentMonth || cell.isDisabled) return;
    onChange(toLocalDateString(cell.date));
    onClose();
  };

  // ── Today shortcut ─────────────────────────────────────────────────────────
  const goToday = () => {
    const str = toLocalDateString(today);
    if (!maxDate || str <= maxDate) {
      onChange(str);
      onClose();
    }
  };

  // ── Clear ──────────────────────────────────────────────────────────────────
  const clearDate = () => {
    onChange('');
    onClose();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="cust-cal" role="dialog" aria-label="Date picker" id="custom-calendar">

      {/* ── Header ── */}
      <div className="cust-cal__header">
        <button
          type="button"
          className="cust-cal__nav"
          onClick={prevMonth}
          aria-label="Previous month"
          id="cal-prev-month"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <span className="cust-cal__month" id="cal-month-label">{monthYearLabel}</span>

        <button
          type="button"
          className="cust-cal__nav"
          onClick={nextMonth}
          aria-label="Next month"
          id="cal-next-month"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>

      {/* ── Day labels (Su Mo … Sa) ── */}
      <div className="cust-cal__grid" role="grid" aria-label="Calendar">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="cust-cal__day-label"
            role="columnheader"
            aria-label={label}
          >
            {label}
          </div>
        ))}

        {/* ── Day cells ── */}
        {calendarCells.map((cell, i) => {
          const classes = [
            'cust-cal__day',
            !cell.currentMonth  && 'cust-cal__day--other',
            cell.isToday        && 'cust-cal__day--today',
            cell.isSelected     && 'cust-cal__day--selected',
            cell.isDisabled     && 'cust-cal__day--disabled',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={i}
              className={classes}
              role={cell.currentMonth && !cell.isDisabled ? 'button' : 'gridcell'}
              tabIndex={cell.currentMonth && !cell.isDisabled ? 0 : -1}
              aria-label={cell.currentMonth ? toLocalDateString(cell.date) : undefined}
              aria-selected={cell.isSelected}
              aria-disabled={cell.isDisabled}
              onClick={() => selectDate(cell)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectDate(cell);
                }
              }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      {/* ── Footer actions ── */}
      <div className="cust-cal__footer">
        <button
          type="button"
          className="cust-cal__footer-btn cust-cal__footer-btn--today"
          id="cal-today-btn"
          onClick={goToday}
          disabled={!!maxDate && toLocalDateString(today) > maxDate}
        >
          Today
        </button>
        <button
          type="button"
          className="cust-cal__footer-btn cust-cal__footer-btn--clear"
          id="cal-clear-btn"
          onClick={clearDate}
          disabled={!value}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default CustomCalendar;
