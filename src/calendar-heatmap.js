
function calendarHeatmap() {
  // defaults
  var SQUARE_LENGTH = 10;
  var width = 750;
  width = SQUARE_LENGTH * (52+12);
  var height = 110;
  var legendWidth = 150;
  var dayNumbersFontSz = 8;
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var selector = 'body';
  
  var SQUARE_PADDING = 2;
  var MONTH_LABEL_PADDING = 6;
  var now = moment().endOf('day').toDate();
  var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
  var data = [];
  var colorRange = ['#D8E6E7', '#218380'];
  var tooltipEnabled = true;
  var allWeekdayNames = true;
  var dayNumbersInBox = true;
  var monthSpace = true;
  var tooltipUnit = 'contribution';
  var legendEnabled = true;
  var onClick = null;

  // setters and getters
  chart.data = function (value) {
    if (!arguments.length) { return data; }
    data = value;
    return chart;
  };

  chart.selector = function (value) {
    if (!arguments.length) { return selector; }
    selector = value;
    return chart;
  };

  chart.colorRange = function (value) {
    if (!arguments.length) { return colorRange; }
    colorRange = value;
    return chart;
  };

  chart.tooltipEnabled = function (value) {
    if (!arguments.length) { return tooltipEnabled; }
    tooltipEnabled = value;
    return chart;
  };

  chart.allWeekdayNames = function (value) {
    if (!arguments.length) { return allWeekdayNames; }
    allWeekdayNames = value;
    return chart;
  };

  chart.dayNumbersInBox = function (value) {
    if (!arguments.length) { return dayNumbersInBox; }
    dayNumbersInBox = value;
    return chart;
  };

  chart.monthSpace = function (value) {
    if (!arguments.length) { return monthSpace; }
    monthSpace = value;
    return chart;
  };

  chart.tooltipUnit = function (value) {
    if (!arguments.length) { return tooltipUnit; }
    tooltipUnit = value;
    return chart;
  };

  chart.legendEnabled = function (value) {
    if (!arguments.length) { return legendEnabled; }
    legendEnabled = value;
    return chart;
  };

  chart.onClick = function (value) {
    if (!arguments.length) { return onClick(); }
    onClick = value;
    return chart;
  };

  function chart() {

    d3.select(chart.selector()).selectAll('svg.calendar-heatmap').remove(); // remove the existing chart, if it exists

    var dateRange = d3.time.days(yearAgo, now); // generates an array of date objects within the specified range
    var monthRange = d3.time.months(moment(yearAgo).startOf('month').toDate(), now); // it ignores the first month if the 1st date is after the start of the month
    var firstDate = moment(dateRange[0]);
    var max = d3.max(chart.data(), function (d) { return d.count; }); // max data value
    // color range
    var color = d3.scale.linear()
      .range(chart.colorRange())
      .domain([0, max]);

    var tooltip;
    var dayRects;
    if (monthSpace){
      width =  width + (12 * (SQUARE_LENGTH + SQUARE_PADDING));
    }

    drawChart();

    function drawChart() {
      var svg = d3.select(chart.selector())
        .append('svg')
        .attr('width', width)
        .attr('class', 'calendar-heatmap')
        .attr('height', height)
        .style('padding', '23px');

      dayRects = svg.selectAll('.day-cell')
        .data(dateRange);  //  array of days for the last yr

      dayRects.enter().append('rect')
        .attr('class', 'day-cell')
        .attr('width', SQUARE_LENGTH)
        .attr('height', SQUARE_LENGTH)
        .attr('fill', 'gray')
        .attr('x', function (d, i) {
          var cellDate = moment(d);
          var monthSpacing =  0;
          if (monthSpace){//moment(startDate).endOf('month')
            monthSpacing = cellDate.diff((firstDate).startOf('month'), 'months');
          }
          var result = (cellDate.week() + monthSpacing) - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
          return result * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr('y', function (d, i) { return MONTH_LABEL_PADDING + d.getDay() * (SQUARE_LENGTH + SQUARE_PADDING); });

      if (typeof onClick === 'function') {
        dayRects.on('click', function (d) {
          var count = countForDate(d);
          onClick({ date: d, count: count});
        });
      }

      if (dayNumbersInBox){
        dayNumbers = svg.selectAll('.day-numbers')
        .data(dateRange);  //  array of days for the last yr
        
        dayNumbers.enter().append('text')
        .attr('class', 'day-numbers')
        .attr("font-size", dayNumbersFontSz+"px")
        .attr('x', function (d, i) {
          var cellDate = moment(d);
          var numSzBlank = 0;
          if(d.getDate()>9){
            numSzBlank = 1; 
          }else{
            numSzBlank = 3;
          }
          var monthSpacing =  0;
          if (monthSpace){
            monthSpacing = cellDate.diff((firstDate).startOf('month'), 'months');
          }
          var result = (cellDate.week() + monthSpacing) - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
          return (result * (SQUARE_LENGTH + SQUARE_PADDING)) + (((SQUARE_LENGTH-dayNumbersFontSz)/4) * (numSzBlank));
        })
        .attr('y', function (d, i) { return MONTH_LABEL_PADDING + dayNumbersFontSz + d.getDay() * (SQUARE_LENGTH + SQUARE_PADDING); })
        .text(function (d) { return d.getDate() ; });
      }

      if (chart.tooltipEnabled()) {
        dayRects.on('mouseover', function (d, i) {
          var monthSpacing =  0;
            if (monthSpace){
              monthSpacing = moment(d).diff((firstDate).startOf('month'), 'months');
            }
          tooltip = d3.select(chart.selector())
            .append('div')
            .attr('class', 'day-cell-tooltip')
            .html(tooltipHTMLForDate(d))
            .style('left', function () { return (Math.floor(i / 7)+monthSpacing) * SQUARE_LENGTH + 'px'; })
            .style('top', function () { return d.getDay() * (SQUARE_LENGTH + SQUARE_PADDING) + (MONTH_LABEL_PADDING - 5) * 3 + 'px'; });
        })
        .on('mouseout', function (d, i) {
          tooltip.remove();
        });
        if (dayNumbersInBox){
          dayNumbers.on('mouseover', function (d, i) {
            var monthSpacing =  0;
            if (monthSpace){
              monthSpacing = moment(d).diff((firstDate).startOf('month'), 'months');
            }
            tooltip = d3.select(chart.selector())
              .append('div')
              .attr('class', 'day-cell-tooltip')
              .html(tooltipHTMLForDate(d))
              .style('left', function () { return (Math.floor(i / 7)+monthSpacing) * SQUARE_LENGTH + 'px'; })
              .style('top', function () { return d.getDay() * (SQUARE_LENGTH + SQUARE_PADDING) + (MONTH_LABEL_PADDING - 5) * 3 + 'px'; });
          })
          .on('mouseout', function (d, i) {
            tooltip.remove();
          });
        }
      }

      if (chart.legendEnabled()) {
        var colorRange = [color(0)];
        for (var i = 4; i > 0; i--) {
          colorRange.push(color(max / i));
        }

        var legendGroup = svg.append('g');
        legendGroup.selectAll('.calendar-heatmap-legend')
            .data(colorRange)
            .enter()
            .append('rect')
            .attr('class', 'calendar-heatmap-legend')
            .attr('width', SQUARE_LENGTH)
            .attr('height', SQUARE_LENGTH)
            .attr('x', function (d, i) { return (width - legendWidth) + (i + 1) * 13; })
            .attr('y', height + SQUARE_PADDING)
            .attr('fill', function (d) { return d; });

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text')
          .attr('x', width - legendWidth - 13)
          .attr('y', height + SQUARE_LENGTH)
          .text('Less');

      legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text')
          .attr('x', (width - legendWidth + SQUARE_PADDING) + (colorRange.length + 1) * 13)
          .attr('y', height + SQUARE_LENGTH)
          .text('More');
      }

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
            var monthSpacing =  0;
            if (monthSpace){
              monthSpacing = moment(d).diff((firstDate).startOf('month'), 'months');
            }
            dateRange.find(function (element, index) {
              matchIndex = index;
              return moment(d).isSame(element, 'month') && moment(d).isSame(element, 'year');
            });
            return ((Math.floor(matchIndex / 7)+monthSpacing) * (SQUARE_LENGTH + SQUARE_PADDING));
          })
          .attr('y', 0);  // fix these to the top

      days.forEach(function (day, index) {
        if(allWeekdayNames){
          svg.append('text')
            .attr('class', 'day-initial')
            .attr('transform', 'translate(-14,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
            .style('text-anchor', 'middle')
            .attr('dy', '2')
            .text(day);
        }else{
          if (index % 2) {
            svg.append('text')
              .attr('class', 'day-initial')
              .attr('transform', 'translate(-14,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
              .style('text-anchor', 'middle')
              .attr('dy', '2')
              .text(day);
          }
        }
      });
    }

    function tooltipHTMLForDate(d) {
      var dateStr = moment(d).format('ddd, MMM Do YYYY');
      var count = countForDate(d);
      return '<span><strong>' + (count ? count : 'No') + ' ' + tooltipUnit + (count === 1 ? '' : 's') + '</strong> on ' + dateStr + '</span>';
    }

    function countForDate(d) {
      var count = 0;
      var match = chart.data().find(function (element, index) {
        return moment(element.date).isSame(d, 'day');
      });
      if (match) {
        count = match.count;
      }
      return count;
    }

    var daysOfChart = chart.data().map(function (day) {
      return day.date.toDateString();
    });

    dayRects.filter(function (d) {
      return daysOfChart.indexOf(d.toDateString()) > -1;
    }).attr('fill', function (d, i) {
      return color(chart.data()[i].count);
    });
  }

  return chart;
}


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
