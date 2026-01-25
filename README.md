## This project is not actively maintained

# D3 Calendar Heatmap
A [d3.js](https://d3js.org/) heatmap representing time series data. Inspired by Github's contribution chart

![Reusable D3.js Calendar Heatmap chart](https://raw.githubusercontent.com/DKirwan/calendar-heatmap/develop/example/thumbnail.png)

## Configuration

|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Chart data | none | yes |
| selector | DOM selector to attach the chart to | body | no |
| max | Maximum count | max found in data | no |
| startDate | Date to start heatmap at | 1 year ago | no |
| colorRange | Minimum and maximum chart gradient colors | ['#D8E6E7', '#218380'] | no |
| tooltipEnabled | Option to render a tooltip | true | no |
| tooltipUnit | Unit to render on the tooltip, can be object for pluralization control | 'contributions' | no |
| legendEnabled | Option to render a legend | true | no |
| onClick | callback function on day click events (see example below) | null | no |
| locale | Object to translate every word used, except for tooltipUnit | see below | no |

### Default locale object

```javascript
{
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    No: 'No',
    on: 'on',
    Less: 'Less',
    More: 'More'
}
```

## Dependencies

* [d3.js](https://d3js.org/) (v7+)
* [moment.js](http://momentjs.com/)

## Installation

```bash
npm install @goujon/calendar-heatmap
```

## Usage

1: Add d3.js and moment.js

2: Import calendar-heatmap and its styles
```javascript
import calendarHeatmap from '@goujon/calendar-heatmap';
import '@goujon/calendar-heatmap/src/calendar-heatmap.css';
```

3: Format the data so each array item has a `date` and `count` property.
As long as `new Date()` can parse the date string it's ok. Note - there all data should be rolled up into daily bucket granularity.

4: Configure the chart and render it
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

### control unit pluralization

```javascript
var chart1 = calendarHeatmap()
              .data(chartData)
              .tooltipUnit(
                [
                  {min: 0, unit: 'contribution'},
                  {min: 1, max: 1, unit: 'contribution'},
                  {min: 2, max: 'Infinity', unit: 'contributions'}
                ]
              );
chart1();  // render the chart
```

## Pull Requests and issues

...are very welcome!

## Build (TypeScript)

```bash
npm run build
```

## Demo

Open `example/index.html` after running `npm install` and `npm run build`. The demo uses import maps to load D3 and Moment from a CDN. 
