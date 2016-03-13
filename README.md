# D3 Calendar Heatmap
A [d3.js](d3js.org) heatmap representing time series data. Inspired by Github's contribution chart

## TODO's

* Allow developers to enable/disable tooltip
* Allow editing of tooltip text
* Allow editing of the cell gradient colours
* Allow editing of the start/end dates

# D3 Sparkline Chart

![Reusable D3.js Calendar Heatmao chart](https://raw.githubusercontent.com/DKirwan/calendar-heatmap/develop/example/thumbnail.png)

## Configuration

|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Path to data to render on the chart | none | yes |
| selector | DOM selector to attach the chart to | body | no |

## Usage

1: Include the calendar-heatmap.js code after d3.js and moment.js
`<script src="path/to/calendar-heatmap.js"></script>`

2: Format the data so each array item has a `date` and `count` property.
As long as `new Date()` can parse the date string it's ok. Note - there all data should be rolled up into daily bucket granularity.

3: Configure the chart and render it
```javascript
// chart data example
var chartData = [{
  date: valid Javascript date object,
  count: Number
}];
var chart1 = calendarHeatmap()
              .data(chartData)
              .selector('#chart-one');
chart1();  // render the chart
```

## Pull Requests and issues

...are very welcome!
