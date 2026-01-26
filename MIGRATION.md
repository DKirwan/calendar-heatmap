# Migration Guide (v1 -> v2)

This release is a **major version bump** with breaking API changes aimed at simplifying i18n and making accessibility the default.

## Quick Summary of Breaking Changes

1) **`weekStart` now uses strings**  
   - **v1**: `weekStart(0)` or `weekStart(1)`  
   - **v2**: `weekStart('sunday')` or `weekStart('monday')`

2) **`tooltipUnit` removed**  
   - Replace with `formatters.tooltip(date, count)`

3) **`locale` removed**  
   - Replace with `formatters.dayLabel`, `formatters.monthLabel`, and `formatters.legend`

4) **`ariaLabelForDate` removed**  
   - Replace with `formatters.ariaLabel(date, count)`

5) **`accessibilityEnabled` removed**  
   - Accessibility is always on.  
   - You can still disable the hidden table via `accessibilityTable(false)`.

6) **Dependencies**  
   - `@goujon/calendar-heatmap` now **bundles d3**.  
   - `@goujon/react-calendar-heatmap` depends on `@goujon/calendar-heatmap`, so users only install the React package.

---

## API Mapping

| v1 | v2 |
| --- | --- |
| `weekStart(0 | 1)` | `weekStart('sunday' | 'monday')` |
| `tooltipUnit(...)` | `formatters({ tooltip })` |
| `locale.months` | `formatters({ monthLabel })` |
| `locale.days` | `formatters({ dayLabel })` |
| `locale.Less / locale.More` | `formatters({ legend: { less, more } })` |
| `ariaLabelForDate(fn)` | `formatters({ ariaLabel: fn })` |
| `accessibilityEnabled(false)` | **Removed** (a11y always on) |

---

## Example Migration

### v1
```js
calendarHeatmap()
  .weekStart(1)
  .tooltipUnit([
    { min: 0, unit: 'session' },
    { min: 1, max: 1, unit: 'session' },
    { min: 2, max: 'Infinity', unit: 'sessions' }
  ])
  .locale({
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    Less: 'Less',
    More: 'More',
    No: 'No',
    on: 'on'
  })
  .ariaLabelForDate((date, count) => `${date.toDateString()}: ${count} sessions`);
```

### v2
```js
calendarHeatmap()
  .weekStart('monday')
  .formatters({
    tooltip: (date, count) => {
      const unit = count === 1 ? 'session' : 'sessions';
      return `${count} ${unit} on ${date.toDateString()}`;
    },
    dayLabel: (weekdayIndex) => {
      const base = new Date(2020, 5, 7 + weekdayIndex);
      return new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(base);
    },
    monthLabel: (monthIndex) => {
      const base = new Date(2020, monthIndex, 1);
      return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(base);
    },
    legend: { less: 'Less', more: 'More' },
    ariaLabel: (date, count) => `${date.toDateString()}: ${count} sessions`
  });
```

---

## React Package Changes

- Package name: `@goujon/react-calendar-heatmap`
- It **includes** `@goujon/calendar-heatmap` as a dependency.
- You only need to install the React package:
```bash
npm install @goujon/react-calendar-heatmap
```

---
