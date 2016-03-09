if (!window.d3 || !window.moment) {
  throw new Error('d3.js and Moment.js are required.');
}

var width = 750;
var height = 310;
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

var SQUARE_LENGTH = 11;
var SQUARE_PADDING = 2;
var MONTH_LABEL_PADDING = 6;
var now = moment().endOf('day').toDate();
var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();

var chartData = d3.time.days(yearAgo, now).map(function (dateElement) {
  return {
    date: dateElement,
    count: (dateElement.getDay() !== 0 && dateElement.getDay() !== 6) ? Math.floor(Math.random() * 60) : Math.floor(Math.random() * 10)
  };
});

var dateRange = d3.time.days(yearAgo, now);
var monthRange = d3.time.months(moment(yearAgo).startOf('month').toDate(), now); // it ignores the first month if the 1st date is after the start of the month

var firstDate = moment(dateRange[0]);

var max = d3.max(chartData, function (d) { return d.count; });

// TODO: add legend
var color = d3.scale.linear().range(['#D8E6E7', '#218380'])
  .domain([0, max]);

var tooltip;
var dayRects;

function drawChart() {
  var svg = d3.select('.container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('padding', '36px');

  dayRects = svg.selectAll('.day-cell')
    .data(dateRange);  //  array of days for the last yr

  dayRects.enter().append('rect')
    .attr('class', 'day-cell')
    .attr('width', SQUARE_LENGTH)
    .attr('height', SQUARE_LENGTH)
    .attr('fill', 'gray')
    .attr('x', function (d, i) {
      var cellDate = moment(d);
      var result = cellDate.week() - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
      return result * (SQUARE_LENGTH + SQUARE_PADDING);
    })
    .attr('y', function (d, i) { return MONTH_LABEL_PADDING + d.getDay() * (SQUARE_LENGTH + SQUARE_PADDING); })
    .on('mouseover', function (d, i) {
      tooltip = d3.select('body')
        .append('div')
        .attr('class', 'cell-tooltip')
        .html(tooltipHTMLForDate(d))
        .style('left', function () { return Math.floor(i / 7) * SQUARE_LENGTH; })
        .style('top', function () { return d.getDay() * (SQUARE_LENGTH + SQUARE_PADDING * 3); });
    })
    .on('mouseout', function (d, i) {
      tooltip.remove();
    });

  dayRects.exit().remove();
  var monthLabels = svg.selectAll('.month')
      .data(monthRange)
      .enter().append('text')
      .attr('class', 'month-name')
      .style()
      .text(function (d) {
        return months[d.getMonth()];
      })
      .attr('x', function (d, i) {
        var matchIndex = 0;
        dateRange.find(function (element, index) {
          matchIndex = index;
          return moment(d).isSame(element, 'month') && moment(d).isSame(element, 'year');
        });

        return Math.floor(matchIndex / 7) * (SQUARE_LENGTH + SQUARE_PADDING);
      })
      .attr('y', 0);  // fix these to the top

  days.forEach(function (day, index) {
    if (index % 2) {
      svg.append('text')
        .attr('class', 'day-initial')
        .attr('transform', 'translate(-8,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
        .style('text-anchor', 'middle')
        .attr('dy', '2')
        .text(day);
    }
  });
}

drawChart();

function tooltipHTMLForDate(d) {
  var dateStr = moment(d).format('ddd, MMM Do YYYY');
  var count = 0;
  var match = chartData.find(function (element, index) {
    return moment(element.date).isSame(d);
  });
  if (match) {
    count = match.count;
  }
  return '<span><strong>' + (count ? count : 'No') + ' interactions</strong> on ' + dateStr + '</span>';
}

dayRects.filter(function (d) {
  var hasItem = chartData.some(function (element, index) {
    return moment(d).isSame(element.date, 'day');
  });
  return hasItem;
}).attr('fill', function (d, i) {
  return color(chartData[i].count);
});


// polyfill for Array.find() method
/* jshint ignore:start */
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
/* jshint ignore:end */
