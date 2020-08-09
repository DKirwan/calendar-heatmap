
function calendarHeatmap() {
  // defaults
  var width = null;
  var height = null;
  var legendWidth = 30;
  var selector = 'body';
  var SQUARE_LENGTH = 11;
  var SQUARE_PADDING = 2;
  var MONTH_LABEL_PADDING = 17;
  var DAY_LABEL_PADDING = 17;
  var startDate = null;
  var endDate = null;
  var counterMap = {};
  var data = [];
  var max = null;
  var colorRange = ['#D8E6E7', '#218380'];
  var tooltipEnabled = true;
  var tooltipUnit = 'contribution';
  var monthOutlineEnabled = true;
  var legendEnabled = true;
  var onClick = null;
  var weekStart = 0; //0 for Sunday, 1 for Monday
  var locale = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    No: 'No',
    on: 'on',
    Less: 'Less',
    More: 'More'
  };
  var today = moment();
  var v = Number(d3.version.split('.')[0]);
  var day = ((d3.time && d3.time.format) || d3.timeFormat)("%w");
  var week = ((d3.time && d3.time.format) || d3.timeFormat)("%U");

  // setters and getters
  chart.data = function (value) {
    if (!arguments.length) { return data; }
    data = value;

    counterMap= {};

    data.forEach(function (element, index) {
        var key= moment(element.date).format( 'YYYY-MM-DD' );
        var counter= counterMap[key] || 0;
        counterMap[key]= counter + element.count;
    });

    return chart;
  };

  chart.max = function (value) {
    if (!arguments.length) { return max; }
    max = value;
    return chart;
  };

  chart.selector = function (value) {
    if (!arguments.length) { return selector; }
    selector = value;
    return chart;
  };

  chart.startDate = function (value) {
    if (!arguments.length) { return startDate; }
    startDate = value;
    return chart;
  };

  chart.endDate = function (value) {
    if (!arguments.length) { return endDate; }
    endDate = value;
    return chart;
  };

  chart.today = function (value) {
    if (!arguments.length) { return today; }
    today = value;
    return chart;
  };

  chart.colorRange = function (value) {
    if (!arguments.length) { return colorRange; }
    colorRange = value;
    return chart;
  };

  chart.monthOutlineEnabled = function (value) {
    if (!arguments.length) { return monthOutlineEnabled; }
    monthOutlineEnabled = value;
    return chart;
  };

  chart.tooltipEnabled = function (value) {
    if (!arguments.length) { return tooltipEnabled; }
    tooltipEnabled = value;
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

  chart.locale = function (value) {
    if (!arguments.length) { return locale; }
    locale = value;
    return chart;
  };

  var week_shift = 0
  function monthStartEndProps(t0, i) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
    var d0 = +day(t0);
    var w0 = +week(t0);
    if (i == 0) {
      week_shift = -1 * w0;
    } else if (t0.getMonth() == 0) {
      // shift weeks by a year
      week_shift += 52;
    }
    var d1 = +day(t1);
    var w1 = +week(t1);
    w0 += week_shift;
    w1 += week_shift;

    return {
      'w0': w0,
      'd0': d0,
      'w1': w1,
      'd1': d1
    }
  }

  var z = SQUARE_PADDING + SQUARE_LENGTH;
  function monthPath({w0, d0, w1, d1}) {
    // the idea and implementation for month oulines was adapted from
    // http://mbostock.github.io/d3/talk/20111018/calendar.html
    /*  Month outlines
      8________7    2_________7
       |      |      | 81     |
     __|      |      |        |
    2|  1     |      | EDGE   |
     |        |      | CASE   |
     |     5__|6     | see    |
     |      |        | feb1998|
    3|______|4      3|________|
                           45 6
    2 is at w0, d0
    6 is at w1, d1
    */
    return "M" + (((w0 + 1) * z) + DAY_LABEL_PADDING - 1)  // position 1 (horizontal)
        + "," + ((d0 * z) + MONTH_LABEL_PADDING - 1)       // position 1 (vertical)
        + "h" + (-1 * z) + "v" + (7 - d0) * z              // positions 2, 3
        + "h" + ((w1 - w0) * z) + "v" + (d1 - 6) * z       // positions 4, 5
        + "h" + z + "v" + (-1 * (d1 + 1) * z)              // positions 6, 7
        + "h" + ((w0 - w1) * z) + "Z";                     // positions 8, 1
  }

  function monthLabelHorizontalPosition({w0, w1}) {
    return DAY_LABEL_PADDING + (((w1 + 1) + w0) / 2) * z
  }

  function chart() {

    d3.select(chart.selector()).selectAll('svg.calendar-heatmap').remove(); // remove the existing chart, if it exists
    // get earliest date from data
    var earliestDate, latestDate;
    if (chart.data().length == 0) {
      max = 0;
      latestDate = moment();
      earliestDate = moment(latestDate).startOf('day').subtract(1, 'year').toDate();
    } else if (max === null) {
      max = d3.max(chart.data(), function (d) { return d.count; }); // max data value
      latestDate = d3.max(chart.data(), function (d) { return moment(d.date)});
      earliestDate = d3.min(chart.data(), function (d) { return moment(d.date)});
    }
    // resolve date range if missing
    if (endDate === null) {
      endDate = latestDate;
    }
    if (startDate === null) {
      yearBeforeLatest = moment(endDate).subtract(1, 'year').toDate();
      startDate = earliestDate;
      // constrain startDate to be within year of endDate to protect width of graph
      if (earliestDate < yearBeforeLatest) {
        startDate = yearBeforeLatest;
      }
    }
    // only show full months
    endDate = moment(endDate).endOf('month').toDate();
    startDate = moment(startDate).startOf('month').toDate();
    var dateRange = ((d3.time && d3.time.days) || d3.timeDays)(startDate, endDate); // generates an array of date objects within the specified range
    var monthRange = ((d3.time && d3.time.months) || d3.timeMonths)(startDate, endDate); // it ignores the first month if the 1st date is after the start of the month
    var firstDate = moment(dateRange[0]);

    // color range
    var color = ((d3.scale && d3.scale.linear) || d3.scaleLinear)()
      .range(chart.colorRange())
      .domain([0, max]);

    var tooltip;
    var dayRects;

    width = Math.ceil((DAY_LABEL_PADDING * 2) + ((dateRange.length / 7) + 1) * (SQUARE_PADDING + SQUARE_LENGTH));
    height = Math.ceil((MONTH_LABEL_PADDING) + 7 * (SQUARE_LENGTH + SQUARE_PADDING));
    if (chart.legendEnabled()) {
      height += SQUARE_LENGTH + 3 * SQUARE_PADDING;
    }
    drawChart();

    function drawChart() {
      var svg = d3.select(chart.selector())
        .style('position', 'relative')
        .append('svg')
        .attr('width', width)
        .attr('class', 'calendar-heatmap')
        .attr('height', height)
        .style('padding', '36px');

      dayRects = svg.selectAll('.day-cell')
        .data(dateRange);  //  array of days for the last yr

      var enterSelection = dayRects.enter().append('rect')
        .attr('class', function (d) {
          ret = 'day-cell';
          var day = moment(d);
          if (day.year() == today.year() && day.dayOfYear() == today.dayOfYear()) {
            ret += ' today-cell'
          }
          return ret
        })
        .attr('width', SQUARE_LENGTH)
        .attr('height', SQUARE_LENGTH)
        .attr('fill', function(d) { return color(countForDate(d)); })
        .attr('x', function (d, i) {
          var cellDate = moment(d);
          var result = cellDate.week() - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
          return DAY_LABEL_PADDING + (result * (SQUARE_LENGTH + SQUARE_PADDING));
        })
        .attr('y', function (d, i) {
          return MONTH_LABEL_PADDING + formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING);
        });

      if (chart.monthOutlineEnabled()) {
        svg.selectAll(".month-outline")
            .data(monthRange)
          .enter().append("path")
            .attr("class", "month-outline")
            .attr("d", (d, i) => monthPath(monthStartEndProps(d, i)));
      }

      if (typeof onClick === 'function') {
        (v === 3 ? enterSelection : enterSelection.merge(dayRects)).on('click', function(d) {
          var count = countForDate(d);
          onClick({ date: d, count: count});
        });
      }

      if (chart.tooltipEnabled()) {
        (v === 3 ? enterSelection : enterSelection.merge(dayRects)).on('mouseover', function(d, i) {
          tooltip = d3.select(chart.selector())
            .append('div')
            .attr('class', 'day-cell-tooltip')
            .html(tooltipHTMLForDate(d))
            .style('left', function () { return Math.floor(i / 7) * SQUARE_LENGTH + 'px'; })
            .style('top', function () {
              return formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING) + MONTH_LABEL_PADDING + 'px';
            });
        })
        .on('mouseout', function (d, i) {
          tooltip.remove();
        });
      }

      if (chart.legendEnabled()) {
        var colorRange = [color(0)];
        for (var i = 3; i > 0; i--) {
          colorRange.push(color(max / i));
        }

        var legendBaseLine = MONTH_LABEL_PADDING + 7 * (SQUARE_LENGTH + SQUARE_PADDING) + 2 * SQUARE_PADDING;
        var legendGroup = svg.append('g');
        legendGroup.selectAll('.calendar-heatmap-legend')
            .data(colorRange)
            .enter()
          .append('rect')
            .attr('class', 'calendar-heatmap-legend')
            .attr('width', SQUARE_LENGTH)
            .attr('height', SQUARE_LENGTH)
            .attr('x', function (d, i) { return legendWidth + (i + 1) * 13; })
            .attr('y', legendBaseLine)
            .attr('fill', function (d) { return d; });

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-less')
          .attr('x', legendWidth - 13)
          .attr('y', legendBaseLine + 9)
          .text(locale.Less);

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-more')
          .attr('x', (legendWidth + SQUARE_PADDING) + (colorRange.length + 1) * 13)
          .attr('y', legendBaseLine + 9)
          .text(locale.More);
      }

      dayRects.exit().remove();
      var monthLabels = svg.selectAll('.month')
          .data(monthRange)
          .enter().append('text')
          .style('text-anchor', 'middle')
          .attr('class', 'month-name')
          .text(function (d, i, all) {
            return locale.months[d.getMonth()] + " '" + moment(d).format("YY");
          })
          .attr('x', function (d, i) {
            return monthLabelHorizontalPosition(monthStartEndProps(d, i));
          })
          .attr('y', MONTH_LABEL_PADDING - 5);

      locale.days.forEach(function (day, index) {
        index = formatWeekday(index);
        if (index % 2) {
          svg.append('text')
            .attr('class', 'day-initial')
            .attr('y', (MONTH_LABEL_PADDING - 7 + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1)))
            .attr('x', DAY_LABEL_PADDING - 9)
            // .attr('transform', 'translate(-8,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
            .style('text-anchor', 'middle')
            .attr('dy', '2')
            .text(day);
        }
      });
    }

    function pluralizedTooltipUnit (count) {
      if ('string' === typeof tooltipUnit) {
        return (tooltipUnit + (count === 1 ? '' : 's'));
      }
      for (var i in tooltipUnit) {
        var _rule = tooltipUnit[i];
        var _min = _rule.min;
        var _max = _rule.max || _rule.min;
        _max = _max === 'Infinity' ? Infinity : _max;
        if (count >= _min && count <= _max) {
          return _rule.unit;
        }
      }
    }

    function tooltipHTMLForDate(d) {
      var dateStr = moment(d).format('ddd, MMM Do YYYY');
      var count = countForDate(d);
      return '<span><strong>' + (count ? count : locale.No) + ' ' + pluralizedTooltipUnit(count) + '</strong> ' + locale.on + ' ' + dateStr + '</span>';
    }

    function countForDate(d) {
        var key= moment(d).format( 'YYYY-MM-DD' );
        return counterMap[key] || 0;
    }

    function formatWeekday(weekDay) {
      if (weekStart === 1) {
        if (weekDay === 0) {
          return 6;
        } else {
          return weekDay - 1;
        }
      }
      return weekDay;
    }
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
