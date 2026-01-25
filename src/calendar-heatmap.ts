import * as d3 from 'd3';
import * as moment from 'moment';

export default function calendarHeatmap() {
  // defaults
  let width = 750;
  let height = 110;
  const legendWidth = 150;
  let selector = 'body';
  const SQUARE_LENGTH = 11;
  const SQUARE_PADDING = 2;
  const MONTH_LABEL_PADDING = 6;
  let now = moment().endOf('day').toDate();
  let yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
  let startDate = null;
  let counterMap = new Map();
  let data = [];
  let max = null;
  let colorRange = ['#D8E6E7', '#218380'];
  let tooltipEnabled = true;
  let tooltipUnit = 'contribution';
  let legendEnabled = true;
  let onClick = null;
  let weekStart = 0; //0 for Sunday, 1 for Monday
  let locale = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    No: 'No',
    on: 'on',
    Less: 'Less',
    More: 'More'
  };
  const dateKey = (date) => moment(date).format('YYYY-MM-DD');

  // setters and getters
  chart.data = function (value) {
    if (!arguments.length) { return data; }
    data = value || [];

    counterMap = new Map();

    data.forEach(function (element) {
      const key = dateKey(element.date);
      const counter = counterMap.get(key) || 0;
      counterMap.set(key, counter + element.count);
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
    yearAgo = value;
    now = moment(value).endOf('day').add(1, 'year').toDate();
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
    if (!arguments.length) { return onClick; }
    onClick = value;
    return chart;
  };

  chart.locale = function (value) {
    if (!arguments.length) { return locale; }
    locale = value;
    return chart;
  };

  function chart() {

    d3.select(chart.selector()).selectAll('svg.calendar-heatmap').remove(); // remove the existing chart, if it exists

    const dateRange = d3.timeDays(yearAgo, now); // generates an array of date objects within the specified range
    const monthRange = d3.timeMonths(moment(yearAgo).startOf('month').toDate(), now); // it ignores the first month if the 1st date is after the start of the month
    const firstDate = moment(dateRange[0]);
    if (chart.data().length === 0) {
      max = 0;
    } else if (max === null) {
      max = d3.max(chart.data(), function (d) { return d.count; }); // max data value
    }

    // color range
    const color = d3.scaleLinear()
      .range(chart.colorRange())
      .domain([0, max]);

    let tooltip;
    let dayRects;

    drawChart();

    function drawChart() {
      const svg = d3.select(chart.selector())
        .style('position', 'relative')
        .append('svg')
        .attr('width', width)
        .attr('class', 'calendar-heatmap')
        .attr('height', height)
        .style('padding', '36px');

      dayRects = svg.selectAll('.day-cell')
        .data(dateRange);  //  array of days for the last yr

      const enterSelection = dayRects.enter().append('rect')
        .attr('class', 'day-cell')
        .attr('width', SQUARE_LENGTH)
        .attr('height', SQUARE_LENGTH)
        .attr('fill', function(d) { return color(countForDate(d)); })
        .attr('x', function (d, i) {
          const cellDate = moment(d);
          const result = cellDate.week() - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
          return result * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr('y', function (d, i) {
          return MONTH_LABEL_PADDING + formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING);
        });

      const mergedSelection = enterSelection.merge(dayRects);

      if (typeof onClick === 'function') {
        mergedSelection.on('click', function(d) {
          const count = countForDate(d);
          onClick({ date: d, count: count});
        });
      }

      if (chart.tooltipEnabled()) {
        mergedSelection.on('mouseover', function(d, i) {
          if (tooltip) {
            tooltip.remove();
          }
          tooltip = d3.select(chart.selector())
            .append('div')
            .attr('class', 'day-cell-tooltip')
            .html(tooltipHTMLForDate(d))
            .style('left', function () { return Math.floor(i / 7) * SQUARE_LENGTH + 'px'; })
            .style('top', function () {
              return formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING) + MONTH_LABEL_PADDING * 2 + 'px';
            });
        })
        .on('mouseout', function (d, i) {
          if (tooltip) {
            tooltip.remove();
            tooltip = null;
          }
        });
      }

      if (chart.legendEnabled()) {
        const legendColors = [color(0)];
        for (let i = 3; i > 0; i--) {
          legendColors.push(color(max / i));
        }

        const legendGroup = svg.append('g');
        legendGroup.selectAll('.calendar-heatmap-legend')
            .data(legendColors)
            .enter()
          .append('rect')
            .attr('class', 'calendar-heatmap-legend')
            .attr('width', SQUARE_LENGTH)
            .attr('height', SQUARE_LENGTH)
            .attr('x', function (d, i) { return (width - legendWidth) + (i + 1) * 13; })
            .attr('y', height + SQUARE_PADDING)
            .attr('fill', function (d) { return d; });

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-less')
          .attr('x', width - legendWidth - 13)
          .attr('y', height + SQUARE_LENGTH)
          .text(locale.Less);

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-more')
          .attr('x', (width - legendWidth + SQUARE_PADDING) + (legendColors.length + 1) * 13)
          .attr('y', height + SQUARE_LENGTH)
          .text(locale.More);
      }

      dayRects.exit().remove();
      svg.selectAll('.month')
          .data(monthRange)
          .enter().append('text')
          .attr('class', 'month-name')
          .text(function (d) {
            return locale.months[d.getMonth()];
          })
          .attr('x', function (d, i) {
            let matchIndex = 0;
            dateRange.find(function (element, index) {
              matchIndex = index;
              return moment(d).isSame(element, 'month') && moment(d).isSame(element, 'year');
            });

            return Math.floor(matchIndex / 7) * (SQUARE_LENGTH + SQUARE_PADDING);
          })
          .attr('y', 0);  // fix these to the top

      locale.days.forEach(function (day, index) {
        index = formatWeekday(index);
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

    function pluralizedTooltipUnit (count) {
      if (typeof tooltipUnit === 'string') {
        return (tooltipUnit + (count === 1 ? '' : 's'));
      }
      for (const i in tooltipUnit) {
        const _rule = tooltipUnit[i];
        const _min = _rule.min;
        let _max = _rule.max || _rule.min;
        _max = _max === 'Infinity' ? Infinity : _max;
        if (count >= _min && count <= _max) {
          return _rule.unit;
        }
      }
    }

    function tooltipHTMLForDate(d) {
      const dateStr = moment(d).format('ddd, MMM Do YYYY');
      const count = countForDate(d);
      return '<span><strong>' + (count ? count : locale.No) + ' ' + pluralizedTooltipUnit(count) + '</strong> ' + locale.on + ' ' + dateStr + '</span>';
    }

    function countForDate(d) {
      const key = dateKey(d);
      return counterMap.get(key) || 0;
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
