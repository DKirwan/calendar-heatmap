import './styles.css';
import '@goujon/calendar-heatmap/calendar-heatmap.css';
import * as d3 from 'd3';
import calendarHeatmap from '@goujon/calendar-heatmap';

const now = new Date();

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const daysInMonth = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

const addYears = (date: Date, years: number) => {
  const year = date.getFullYear() + years;
  const month = date.getMonth();
  const day = date.getDate();
  const clampedDay = Math.min(day, daysInMonth(year, month));
  return new Date(
    year,
    month,
    clampedDay,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
};

const buildData = (scale = 1) => {
  const end = endOfDay(now);
  const start = startOfDay(addYears(now, -1));
  const dateRange = d3.timeDays(start, end);
  return dateRange.map((dateElement, index) => {
    const weekend = dateElement.getDay() === 0 || dateElement.getDay() === 6;
    const seasonal = 18 + Math.sin(index / 8) * 9;
    const noise = Math.random() * 10;
    const base = Math.max(0, Math.round((seasonal + noise) * scale));
    return {
      date: dateElement,
      count: weekend ? Math.round(base * 0.4) : base
    };
  });
};

const CHART_MARGIN_X = 40;
const getLegendWidth = (width: number) => Math.min(170, Math.max(110, Math.round(width * 0.22)));

const getChartWidth = (selector: string, fallback = 860) => {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) {
    return fallback;
  }
  const rect = container.getBoundingClientRect();
  return Math.max(320, Math.round(rect.width - CHART_MARGIN_X));
};

const dataSets = {
  steady: buildData(0.8),
  growing: buildData(1.1),
  sprint: buildData(1.4)
};

const updateStats = (data: { date: Date; count: number }[]) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const best = Math.max(...data.map((item) => item.count));
  const days = data.filter((item) => item.count > 0).length;
  const avg = Math.round(total / data.length);

  const totalEl = document.querySelector('[data-stat="total"]');
  const bestEl = document.querySelector('[data-stat="best"]');
  const daysEl = document.querySelector('[data-stat="days"]');
  const avgEl = document.querySelector('[data-stat="avg"]');

  if (totalEl) totalEl.textContent = total.toLocaleString();
  if (bestEl) bestEl.textContent = String(best);
  if (daysEl) daysEl.textContent = String(days);
  if (avgEl) avgEl.textContent = String(avg);
};

const renderDefault = (data: { date: Date; count: number }[]) => {
  const width = getChartWidth('#heatmap-default');
  const legendWidth = getLegendWidth(width);

  calendarHeatmap()
    .data(data)
    .selector('#heatmap-default')
    .width(width)
    .legendWidth(legendWidth)
    .fitWidth(true)
    .minCellSize(5)
    .maxCellSize(12)
    .tooltipEnabled(true)
    .colorRange(['#edf4f4', '#4c8c8d'])
    .formatters({
      tooltip: (date, count) => {
        const label = date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const unit = count === 1 ? 'contribution' : 'contributions';
        return `${count} ${unit} on ${label}`;
      }
    })
    .onClick((payload) => {
      const label = payload.date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const el = document.getElementById('log-default');
      if (el) {
        el.textContent = `${label}: ${payload.count} contributions`;
      }
    })();
};

const renderFocus = (data: { date: Date; count: number }[]) => {
  const width = getChartWidth('#heatmap-focus');
  const legendWidth = getLegendWidth(width);

  calendarHeatmap()
    .data(data)
    .selector('#heatmap-focus')
    .width(width)
    .weekStart('monday')
    .legendWidth(legendWidth)
    .fitWidth(true)
    .minCellSize(5)
    .maxCellSize(12)
    .ariaLabel('Focus mode heatmap')
    .ariaDescription('Calendar heatmap showing sessions per day for the last year.')
    .colorRange(['#f7f1ea', '#c1743d'])
    .formatters({
      tooltip: (date, count) => {
        const label = date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const unit = count === 1 ? 'session' : 'sessions';
        return `${count} ${unit} on ${label}`;
      },
      legend: { less: 'Low', more: 'High' },
      dayLabel: (weekdayIndex) => {
        const baseDate = new Date(2020, 5, 7 + weekdayIndex);
        return new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(baseDate);
      }
    })
    .labels({ day: { interval: 1, start: 0 }, month: { padding: 14 } })
    .onClick((payload) => {
      const label = payload.date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const el = document.getElementById('log-focus');
      if (el) {
        el.textContent = `${label}: ${payload.count} sessions`;
      }
    })();
};

const renderStory = (data: { date: Date; count: number }[]) => {
  const width = getChartWidth('#heatmap-story');
  const legendWidth = getLegendWidth(width);

  calendarHeatmap()
    .data(data)
    .selector('#heatmap-story')
    .width(width)
    .height(160)
    .legendWidth(legendWidth)
    .fitWidth(true)
    .minCellSize(6)
    .maxCellSize(14)
    .tooltipEnabled(true)
    .colorRange(['#e9eef2', '#1f2a37'])
    .formatters({
      tooltip: (date, count) => {
        const label = date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        return `${count} deploys on ${label}`;
      },
      legend: { less: 'Quiet', more: 'Peak' }
    })();
};

let currentData = dataSets.steady;
updateStats(currentData);
renderDefault(currentData);
renderFocus(currentData);
renderStory(currentData);

const buttons = document.querySelectorAll<HTMLButtonElement>('button.toggle');
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    buttons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const key = button.dataset.set as keyof typeof dataSets;
    currentData = dataSets[key];
    updateStats(currentData);
    renderDefault(currentData);
    renderFocus(currentData);
    renderStory(currentData);
  });
});

window.addEventListener('resize', () => {
  renderDefault(currentData);
  renderFocus(currentData);
  renderStory(currentData);
});
