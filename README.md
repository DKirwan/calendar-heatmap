# D3 Calendar Heatmap
A [d3.js](https://d3js.org/) heatmap representing time series data. Inspired by Github's contribution chart

![Reusable D3.js Calendar Heatmap chart](https://raw.githubusercontent.com/DKirwan/calendar-heatmap/develop/example/thumbnail.png)

## TODO

* ~~Enable/disable tooltip~~
* Editing of tooltip text
* ~~Editing of the cell gradient colours~~
* Configuration of the start/end dates
* Add optional callback for click events on the day cells
* Add project to bower
* Remove example and vendor folders to separate `gh-pages` branch

## Configuration

|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Path to data to render on the chart | none | yes |
| selector | DOM selector to attach the chart to | body | no |
| colorRange | Array of colors to use as a gradient in the chart | ['#D8E6E7', '#218380'] | no |
| tooltipEnabled | Whether it shows a tooltip or not | true | no |

## Dependencies

* [d3.js](https://d3js.org/)
* [moment.js](http://momentjs.com/)

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
              .selector('#chart-one')
              .colorRange(['#D8E6E7', '#218380'])
              .tooltipEnabled(true);
chart1();  // render the chart
```

## Pull Requests and issues

...are very welcome!
