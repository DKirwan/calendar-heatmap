# @goujon/calendar-heatmap

Reusable D3 calendar heatmap component inspired by GitHub contributions.

## Install

```bash
npm install @goujon/calendar-heatmap
```

## Usage

```js
import calendarHeatmap from '@goujon/calendar-heatmap';
import '@goujon/calendar-heatmap/calendar-heatmap.css';

const data = [{ date: new Date(), count: 3 }];

const chart = calendarHeatmap()
  .data(data)
  .selector('#heatmap')
  .width(700)
  .fitWidth(true);

chart();
```

## Notes

- Bundles d3. No additional install required.
- Accessibility is on by default; use `accessibilityTable(false)` to disable the hidden table.

For full API docs and examples, see the root `README.md`.
