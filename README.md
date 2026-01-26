## This project is not actively maintained

# Calendar Heatmap
A heatmap representing time series data, inspired by GitHub's contribution chart.

![Reusable D3.js Calendar Heatmap chart](https://raw.githubusercontent.com/DKirwan/calendar-heatmap/develop/example/thumbnail.png)

## Configuration

|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Chart data | none | yes |
| selector | DOM selector to attach the chart to | body | no |
| width | Chart width (grid + legend) | 750 | no |
| height | Chart height (grid) | 110 | no |
| cellSize | Day cell size in pixels (before padding) | 11 | no |
| cellPadding | Gap between day cells in pixels | 2 | no |
| fitWidth | Auto-resize cell size to fit the provided width | false | no |
| minCellSize | Minimum cell size when `fitWidth` is true | 6 | no |
| maxCellSize | Maximum cell size when `fitWidth` is true | 18 | no |
| legendWidth | Legend area width | 150 | no |
| legendSteps | Number of legend swatches | 4 | no |
| legendGap | Gap between legend swatches | 2 | no |
| legendOffset | Vertical spacing between grid and legend | 8 | no |
| max | Maximum count | max found in data | no |
| startDate | Date to start heatmap at | 1 year ago | no |
| dateParser | Custom function to parse date inputs | `new Date(...)` | no |
| weekStart | Week start day ('sunday' or 'monday') | 'sunday' | no |
| colorRange | Minimum and maximum chart gradient colors | ['#D8E6E7', '#218380'] | no |
| tooltipEnabled | Option to render a tooltip | true | no |
| formatters | Formatting hooks for labels, tooltip, legend, and aria labels | {} | no |
| labels | Control visibility and spacing for day/month labels | {} | no |
| legendEnabled | Option to render a legend | true | no |
| onClick | callback function on day click events (see example below) | null | no |
| onHover | callback function on day hover events | null | no |
| onLeave | callback function on day mouse leave events | null | no |
| onFocus | callback function on day focus events | null | no |
| onBlur | callback function on day blur events | null | no |
| accessibilityTable | Render an accessible, screen-reader-only table of all values | true | no |
| ariaLabel | Accessible chart label | 'Calendar heatmap' | no |
| ariaDescription | Accessible chart description | auto-generated | no |

## Installation

```bash
npm install @goujon/calendar-heatmap
```

## Usage

1: Import calendar-heatmap and its styles
```javascript
import calendarHeatmap from '@goujon/calendar-heatmap';
import '@goujon/calendar-heatmap/calendar-heatmap.css';
```

2: Format the data so each array item has a `date` and `count` property.
As long as `new Date()` can parse the date string it's ok, or provide a custom `dateParser`. Note - all data should be rolled up into daily bucket granularity.

3: Configure the chart and render it
```javascript
// chart data example
var chartData = [{
  date: valid Javascript date object,
  count: Number
}];
var chart1 = calendarHeatmap()
              .data(chartData)
              .selector('#chart-one')
              .colorRange(['#D8E6E7', '#218380'])
              .tooltipEnabled(true)
              .onClick(function (data) {
                console.log('onClick callback. Data:', data);
              });
chart1();  // render the chart
```

### accessibility (recommended)

```javascript
var chart1 = calendarHeatmap()
              .data(chartData)
              .selector('#chart-one')
              .ariaLabel('Team activity heatmap')
              .ariaDescription('Daily activity for the last 12 months.')
              .formatters({
                ariaLabel: function (date, count) {
                  return date.toDateString() + ': ' + count + ' contributions';
                }
              });
chart1();
```

### custom tooltip formatting

```javascript
var chart1 = calendarHeatmap()
              .data(chartData)
              .formatters({
                tooltip: function (date, count) {
                  var unit = count === 1 ? 'contribution' : 'contributions';
                  return count + ' ' + unit + ' on ' + date.toDateString();
                }
              });
chart1();  // render the chart
```

### responsive sizing + labels

```javascript
var chart1 = calendarHeatmap()
              .data(chartData)
              .width(700)
              .fitWidth(true)
              .minCellSize(7)
              .maxCellSize(12)
              .labels({
                day: { interval: 1, start: 0 },
                month: { padding: 14 }
              });
chart1();
```

## Pull Requests and issues

...are very welcome!

## Build (TypeScript)

```bash
npm run build
```

## Tests

```bash
npm run test
```

## Releases

This repo uses Changesets for versioning and publishing.

```bash
npm run changeset
npm run version
npm run release
```

## Monorepo Layout

This repository is a workspace with two packages:

- `packages/calendar-heatmap` (`@goujon/calendar-heatmap`)
- `packages/react-calendar-heatmap` (`@goujon/react-calendar-heatmap`)

### React Package (Preview)

```bash
npm install @goujon/react-calendar-heatmap
```

```tsx
import { CalendarHeatmap } from '@goujon/react-calendar-heatmap';
import '@goujon/calendar-heatmap/calendar-heatmap.css';
```

## Demo

```bash
npm run demo
```

This starts a local dev server and opens the showcase page.
