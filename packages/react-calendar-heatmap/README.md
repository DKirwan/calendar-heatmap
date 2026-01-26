# @goujon/react-calendar-heatmap

React wrapper for `@goujon/calendar-heatmap`.

## Install

```bash
npm install @goujon/react-calendar-heatmap
```

## Usage

```tsx
import { CalendarHeatmap } from '@goujon/react-calendar-heatmap';
import '@goujon/calendar-heatmap/calendar-heatmap.css';

const data = [{ date: new Date(), count: 3 }];

export function Example() {
  return <CalendarHeatmap data={data} width={700} fitWidth />;
}
```

## Notes

- This package depends on `@goujon/calendar-heatmap` so you only install the React package.
- `react` and `react-dom` are peer dependencies.

For full API docs and examples, see the root `README.md`.
