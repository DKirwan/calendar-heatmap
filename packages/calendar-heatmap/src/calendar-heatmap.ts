import * as d3 from 'd3';

type DateLike = Date | string | number;

type CalendarHeatmapDatum = {
  date: DateLike;
  count: number;
};

type DateParser = (value: DateLike) => Date;

type Formatters = {
  dayLabel?: (weekdayIndex: number) => string;
  monthLabel?: (monthIndex: number) => string;
  tooltip?: (date: Date, count: number) => string;
  legend?: {
    less?: string;
    more?: string;
  };
  ariaLabel?: (date: Date, count: number) => string;
};

type LabelOptions = {
  day?: {
    enabled?: boolean;
    interval?: number;
    start?: number;
    offsetX?: number;
    offsetY?: number;
  };
  month?: {
    enabled?: boolean;
    padding?: number;
    offsetX?: number;
    offsetY?: number;
  };
};

type ChartEventHandler = (data: { date: Date; count: number }, event: Event) => void;
type ChartOnClick = ChartEventHandler;
type ChartOnHover = ChartEventHandler;
type ChartOnLeave = ChartEventHandler;
type ChartOnFocus = ChartEventHandler;
type ChartOnBlur = ChartEventHandler;

type Chart = {
  (): void;
  data(): CalendarHeatmapDatum[];
  data(value: CalendarHeatmapDatum[]): Chart;
  max(): number | null;
  max(value: number | null): Chart;
  width(): number;
  width(value: number): Chart;
  height(): number;
  height(value: number): Chart;
  cellSize(): number;
  cellSize(value: number): Chart;
  cellPadding(): number;
  cellPadding(value: number): Chart;
  fitWidth(): boolean;
  fitWidth(value: boolean): Chart;
  minCellSize(): number;
  minCellSize(value: number): Chart;
  maxCellSize(): number;
  maxCellSize(value: number): Chart;
  legendWidth(): number;
  legendWidth(value: number): Chart;
  legendSteps(): number;
  legendSteps(value: number): Chart;
  legendGap(): number;
  legendGap(value: number): Chart;
  legendOffset(): number;
  legendOffset(value: number): Chart;
  selector(): string;
  selector(value: string): Chart;
  startDate(): Date | null;
  startDate(value: DateLike): Chart;
  dateParser(): DateParser;
  dateParser(value: DateParser): Chart;
  weekStart(): 'sunday' | 'monday';
  weekStart(value: 'sunday' | 'monday'): Chart;
  colorRange(): string[];
  colorRange(value: string[]): Chart;
  tooltipEnabled(): boolean;
  tooltipEnabled(value: boolean): Chart;
  formatters(): Formatters;
  formatters(value: Formatters): Chart;
  labels(): LabelOptions;
  labels(value: LabelOptions): Chart;
  legendEnabled(): boolean;
  legendEnabled(value: boolean): Chart;
  onClick(): ChartOnClick | null;
  onClick(value: ChartOnClick | null): Chart;
  onHover(): ChartOnHover | null;
  onHover(value: ChartOnHover | null): Chart;
  onLeave(): ChartOnLeave | null;
  onLeave(value: ChartOnLeave | null): Chart;
  onFocus(): ChartOnFocus | null;
  onFocus(value: ChartOnFocus | null): Chart;
  onBlur(): ChartOnBlur | null;
  onBlur(value: ChartOnBlur | null): Chart;
  accessibilityTable(): boolean;
  accessibilityTable(value: boolean): Chart;
  ariaLabel(): string;
  ariaLabel(value: string): Chart;
  ariaDescription(): string | null;
  ariaDescription(value: string | null): Chart;
};

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addYears(date: Date, years: number) {
  const year = date.getFullYear() + years;
  const month = date.getMonth();
  const day = date.getDate();
  const clampedDay = Math.min(day, daysInMonth(year, month));
  return new Date(
    year,
    month,
    clampedDay,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });
const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' });
const tooltipDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

let instanceCounter = 0;

export default function calendarHeatmap() {
  // defaults
  let width = 750;
  let height = 110;
  let cellSize = 11;
  let cellPadding = 2;
  let fitWidth = false;
  let minCellSize = 6;
  let maxCellSize = 18;
  let legendWidth = 150;
  let legendSteps = 4;
  let legendGap = 2;
  let legendOffset = 8;
  let selector = 'body';
  const margin = { top: 18, right: 20, bottom: 8, left: 20 };
  let startDate: DateLike | null = null;
  let counterMap = new Map<string, number>();
  let data: CalendarHeatmapDatum[] = [];
  let max: number | null = null;
  let maxOverride: number | null = null;
  let colorRange: string[] = ['#D8E6E7', '#218380'];
  let tooltipEnabled = true;
  let formatters: Formatters = {};
  let labels: LabelOptions = {};
  let legendEnabled = true;
  let onClick: ChartOnClick | null = null;
  let onHover: ChartOnHover | null = null;
  let onLeave: ChartOnLeave | null = null;
  let onFocus: ChartOnFocus | null = null;
  let onBlur: ChartOnBlur | null = null;
  let weekStart: 'sunday' | 'monday' = 'sunday';
  let accessibilityTable = true;
  let ariaLabel = 'Calendar heatmap';
  let ariaDescription: string | null = null;
  const instanceId = ++instanceCounter;
  let dateParser: DateParser = (value) => value instanceof Date ? new Date(value) : new Date(value);
  const parseDate = (value: DateLike) => new Date(dateParser(value));
  const dateKey = (date: DateLike) => formatDateKey(parseDate(date));

  const chart = function () {

    const container = d3.select(chart.selector())
      .style('position', 'relative');

    container.selectAll('svg.calendar-heatmap').remove(); // remove the existing chart, if it exists
    container.selectAll('.calendar-heatmap-accessibility').remove();

    const startDateValue = startDate ? startOfDay(parseDate(startDate)) : startOfDay(addYears(new Date(), -1));
    const endDateValue = endOfDay(addYears(startDateValue, 1));

    if (Number.isNaN(startDateValue.getTime()) || Number.isNaN(endDateValue.getTime())) {
      return;
    }

    const dateRange = d3.timeDays(startDateValue, endDateValue); // generates an array of date objects within the specified range
    const monthRange = d3.timeMonths(startOfMonth(startDateValue), endDateValue); // it ignores the first month if the 1st date is after the start of the month
    if (dateRange.length === 0) {
      return;
    }

    const firstDate = dateRange[0];
    const week = weekStart === 'monday' ? d3.timeMonday : d3.timeSunday;
    const labelConfig = resolveLabels();
    const monthLabelPadding = labelConfig.month.enabled ? labelConfig.month.padding : 0;
    const baseCellSize = cellSize;
    const baseCellPadding = cellPadding;
    const totalWeeks = week.count(week.floor(firstDate), dateRange[dateRange.length - 1]) + 1;
    let computedCellSize = baseCellSize;

    if (fitWidth) {
      const availableWidth = Math.max(
        0,
        width - margin.left - margin.right - (legendEnabled ? legendWidth : 0)
      );
      const targetSpan = availableWidth / totalWeeks;
      const resolvedSize = Math.floor(targetSpan - baseCellPadding);
      computedCellSize = clamp(resolvedSize, minCellSize, maxCellSize);
    }

    const cellSpan = computedCellSize + baseCellPadding;
    const gridWidth = totalWeeks * cellSpan;
    const gridBottom = monthLabelPadding + 7 * cellSpan - baseCellPadding;
    const contentHeight = gridBottom + (legendEnabled ? legendOffset + computedCellSize : 0);
    if (chart.data().length === 0) {
      max = 0;
    } else {
      max = d3.max(chart.data(), function (d) { return d.count; }) ?? 0; // max data value
    }

    // color range
    const maxValue = maxOverride ?? max ?? 0;
    const color = d3.scaleLinear<string>()
      .range(chart.colorRange())
      .domain([0, maxValue]);

    let tooltip;
    let dayRects;

    drawChart();

    function resolveLabels() {
      const day = labels.day ?? {};
      const month = labels.month ?? {};
      const interval = Math.max(1, Math.round(day.interval ?? 2));
      const start = clamp(day.start ?? 1, 0, interval - 1);

      return {
        day: {
          enabled: day.enabled !== false,
          interval,
          start,
          offsetX: day.offsetX ?? -6,
          offsetY: day.offsetY ?? 0
        },
        month: {
          enabled: month.enabled !== false,
          padding: month.padding ?? 12,
          offsetX: month.offsetX ?? 0,
          offsetY: month.offsetY ?? 0
        }
      };
    }

    function drawChart() {
      const svgWidth = width + margin.left + margin.right;
      const svgHeight = Math.max(height, contentHeight) + margin.top + margin.bottom;
      const svg = container
        .append('svg')
        .attr('width', svgWidth)
        .attr('class', 'calendar-heatmap')
        .attr('height', svgHeight);

      const titleId = `calendar-heatmap-title-${instanceId}`;
      const descId = `calendar-heatmap-desc-${instanceId}`;
      svg.attr('role', 'img')
        .attr('aria-labelledby', `${titleId} ${descId}`)
        .attr('focusable', false);

      svg.append('title')
        .attr('id', titleId)
        .text(ariaLabel);

      const defaultDescription = `Daily activity from ${formatTooltipDate(dateRange[0])} to ${formatTooltipDate(dateRange[dateRange.length - 1])}. Color intensity represents activity count.`;
      svg.append('desc')
        .attr('id', descId)
        .text(ariaDescription || defaultDescription);

      const content = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      dayRects = content.selectAll('.day-cell')
        .data(dateRange);  //  array of days for the last yr

      const enterSelection = dayRects.enter().append('rect')
        .attr('class', 'day-cell')
        .attr('width', computedCellSize)
        .attr('height', computedCellSize)
        .attr('fill', function(d) { return color(countForDate(d)); })
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('focusable', true)
        .attr('x', function (d, i) {
          const weekIndex = week.count(week.floor(firstDate), d);
          return weekIndex * cellSpan;
        })
        .attr('y', function (d, i) {
          return monthLabelPadding + formatWeekday(d.getDay()) * cellSpan;
        });

      const mergedSelection = enterSelection.merge(dayRects);
      mergedSelection
        .attr('aria-label', function (d) {
          const count = countForDate(d);
          return formatAriaLabel(d, count);
        });

      if (typeof onClick === 'function') {
        mergedSelection.on('click', function(event, d) {
          const count = countForDate(d);
          onClick({ date: d, count: count}, event);
        });
      }

      mergedSelection.on('mouseover', function(event, d) {
        if (typeof onHover === 'function') {
          const count = countForDate(d);
          onHover({ date: d, count }, event);
        }
        if (!chart.tooltipEnabled()) {
          return;
        }
        if (tooltip) {
          tooltip.remove();
        }
        tooltip = container.append('div')
          .attr('class', 'day-cell-tooltip')
          .attr('role', 'tooltip')
          .attr('id', `calendar-heatmap-tooltip-${instanceId}`);
        renderTooltip(tooltip, d);

        const weekIndex = week.count(week.floor(firstDate), d);
        const x = margin.left + weekIndex * cellSpan;
        const y = margin.top + monthLabelPadding + formatWeekday(d.getDay()) * cellSpan;

        tooltip
          .style('left', `${x}px`)
          .style('top', `${y + computedCellSize + 6}px`);

        d3.select(this).attr('aria-describedby', `calendar-heatmap-tooltip-${instanceId}`);
      })
      .on('mouseout', function (event, d) {
        if (typeof onLeave === 'function') {
          const count = countForDate(d);
          onLeave({ date: d, count }, event);
        }
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }
        d3.select(this).attr('aria-describedby', null);
      });

      mergedSelection
        .on('focus', function(event, d) {
          if (typeof onFocus === 'function') {
            const count = countForDate(d);
            onFocus({ date: d, count }, event);
          }
          if (!chart.tooltipEnabled()) {
            return;
          }
          if (tooltip) {
            tooltip.remove();
          }
          tooltip = container.append('div')
            .attr('class', 'day-cell-tooltip')
            .attr('role', 'tooltip')
            .attr('id', `calendar-heatmap-tooltip-${instanceId}`);
          renderTooltip(tooltip, d);

          const weekIndex = week.count(week.floor(firstDate), d);
          const x = margin.left + weekIndex * cellSpan;
          const y = margin.top + monthLabelPadding + formatWeekday(d.getDay()) * cellSpan;

          tooltip
            .style('left', `${x}px`)
            .style('top', `${y + computedCellSize + 6}px`);

          d3.select(this).attr('aria-describedby', `calendar-heatmap-tooltip-${instanceId}`);
        })
        .on('blur', function (event, d) {
          if (typeof onBlur === 'function') {
            const count = countForDate(d);
            onBlur({ date: d, count }, event);
          }
          if (tooltip) {
            tooltip.remove();
            tooltip = null;
          }
          d3.select(this).attr('aria-describedby', null);
        })
        .on('keydown', function (event, d) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (typeof onClick === 'function') {
              const count = countForDate(d);
              onClick({ date: d, count: count }, event);
            }
          }
        });

      if (chart.legendEnabled()) {
        const steps = Math.max(2, Math.round(legendSteps));
        const legendColors = Array.from({ length: steps }, (_, index) => {
          const ratio = steps === 1 ? 0 : index / (steps - 1);
          return color(maxValue * ratio);
        });

        const legendGroup = content.append('g');
        const legendStartX = Math.max(0, gridWidth - legendWidth);
        const legendY = gridBottom + legendOffset;
        const legendStep = computedCellSize + Math.max(0, legendGap);
        const legendLabelOffset = Math.max(6, Math.round(computedCellSize * 0.7));
        legendGroup.selectAll('.calendar-heatmap-legend')
            .data(legendColors)
            .enter()
          .append('rect')
            .attr('class', 'calendar-heatmap-legend')
            .attr('width', computedCellSize)
            .attr('height', computedCellSize)
            .attr('x', function (d, i) { return legendStartX + (i + 1) * legendStep; })
            .attr('y', legendY)
            .attr('fill', function (d) { return d; });

      const legendLess = formatters.legend?.less ?? 'Less';
      const legendMore = formatters.legend?.more ?? 'More';

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-less')
          .attr('x', legendStartX - legendLabelOffset)
          .attr('y', legendY + computedCellSize / 2)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .text(legendLess);

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-more')
          .attr('x', legendStartX + (legendColors.length + 1) * legendStep)
          .attr('y', legendY + computedCellSize / 2)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .text(legendMore);
      }

      dayRects.exit().remove();

      if (labelConfig.month.enabled) {
        content.selectAll('.month')
            .data(monthRange)
            .enter().append('text')
            .attr('class', 'month-name')
            .text(function (d) {
              return getMonthLabel(d.getMonth());
            })
            .attr('x', function (d, i) {
              let matchIndex = 0;
              dateRange.find(function (element, index) {
                matchIndex = index;
                return d.getMonth() === element.getMonth() && d.getFullYear() === element.getFullYear();
              });

              const matchDate = dateRange[matchIndex];
              const weekIndex = week.count(week.floor(firstDate), matchDate);
              return weekIndex * cellSpan + labelConfig.month.offsetX;
            })
            .attr('y', labelConfig.month.offsetY);  // fix these to the top
      }

      const dayOrder = weekStart === 'monday'
        ? [1, 2, 3, 4, 5, 6, 0]
        : [0, 1, 2, 3, 4, 5, 6];

      if (labelConfig.day.enabled) {
        dayOrder.forEach(function (dayIndex, index) {
          if ((index - labelConfig.day.start) % labelConfig.day.interval === 0 && index >= labelConfig.day.start) {
            content.append('text')
              .attr('class', 'day-initial')
              .attr('x', labelConfig.day.offsetX)
              .attr('y', monthLabelPadding + index * cellSpan + computedCellSize / 2 + labelConfig.day.offsetY)
              .attr('dominant-baseline', 'middle')
              .style('text-anchor', 'end')
              .text(getDayLabel(dayIndex));
          }
        });
      }

      if (accessibilityTable) {
        renderAccessibilityTable();
      }
    }

    function defaultTooltip(date: Date, count: number) {
      const unit = count === 1 ? 'contribution' : 'contributions';
      return `${count} ${unit} on ${formatTooltipDate(date)}`;
    }

    function formatTooltipText(date: Date, count: number) {
      return formatters.tooltip ? formatters.tooltip(date, count) : defaultTooltip(date, count);
    }

    function formatAriaLabel(date: Date, count: number) {
      if (formatters.ariaLabel) {
        return formatters.ariaLabel(date, count);
      }
      return formatTooltipText(date, count);
    }

    function renderTooltip(selection, d) {
      const count = countForDate(d);
      selection.text(formatTooltipText(d, count));
    }

    function formatTooltipDate(date: Date) {
      return tooltipDateFormatter.format(date);
    }

    function countForDate(d) {
      const key = dateKey(d);
      return counterMap.get(key) || 0;
    }

    function formatWeekday(weekDay) {
      if (weekStart === 'monday') {
        if (weekDay === 0) {
          return 6;
        } else {
          return weekDay - 1;
        }
      }
      return weekDay;
    }

    function renderAccessibilityTable() {
      const table = container.append('table')
        .attr('class', 'calendar-heatmap-accessibility');

      table.append('caption').text(`${ariaLabel}. ${ariaDescription || `Daily activity from ${formatTooltipDate(dateRange[0])} to ${formatTooltipDate(dateRange[dateRange.length - 1])}.`}`);

      const tbody = table.append('tbody');
      dateRange.forEach(function (date) {
        const count = countForDate(date);
        const row = tbody.append('tr');
        row.append('th')
          .attr('scope', 'row')
          .text(formatTooltipDate(date));
        row.append('td').text(`${count}`);
      });
    }

    function getDayLabel(weekdayIndex: number) {
      if (formatters.dayLabel) {
        return formatters.dayLabel(weekdayIndex);
      }
      const baseDate = new Date(2020, 5, 7 + weekdayIndex);
      return weekdayFormatter.format(baseDate);
    }

    function getMonthLabel(monthIndex: number) {
      if (formatters.monthLabel) {
        return formatters.monthLabel(monthIndex);
      }
      const baseDate = new Date(2020, monthIndex, 1);
      return monthFormatter.format(baseDate);
    }
  } as Chart;

  // setters and getters
  function dataAccessor(): CalendarHeatmapDatum[];
  function dataAccessor(value: CalendarHeatmapDatum[]): Chart;
  function dataAccessor(value?: CalendarHeatmapDatum[]) {
    if (!arguments.length) { return data; }
    data = value || [];

    counterMap = new Map();

    data.forEach(function (element) {
      const parsed = parseDate(element.date);
      if (Number.isNaN(parsed.getTime())) {
        return;
      }
      const key = formatDateKey(parsed);
      const counter = counterMap.get(key) || 0;
      counterMap.set(key, counter + element.count);
    });

    return chart;
  }

  function maxAccessor(): number | null;
  function maxAccessor(value: number | null): Chart;
  function maxAccessor(value?: number | null) {
    if (!arguments.length) { return maxOverride ?? max; }
    maxOverride = value ?? null;
    return chart;
  }

  function selectorAccessor(): string;
  function selectorAccessor(value: string): Chart;
  function selectorAccessor(value?: string) {
    if (!arguments.length) { return selector; }
    selector = value as string;
    return chart;
  }

  function startDateAccessor(): Date | null;
  function startDateAccessor(value: DateLike): Chart;
  function startDateAccessor(value?: DateLike) {
    if (!arguments.length) { return startDate ? parseDate(startDate) : null; }
    startDate = value ?? null;
    return chart;
  }

  function dateParserAccessor(): DateParser;
  function dateParserAccessor(value: DateParser): Chart;
  function dateParserAccessor(value?: DateParser) {
    if (!arguments.length) { return dateParser; }
    dateParser = value as DateParser;
    dataAccessor(data);
    return chart;
  }

  function widthAccessor(): number;
  function widthAccessor(value: number): Chart;
  function widthAccessor(value?: number) {
    if (!arguments.length) { return width; }
    width = value as number;
    return chart;
  }

  function heightAccessor(): number;
  function heightAccessor(value: number): Chart;
  function heightAccessor(value?: number) {
    if (!arguments.length) { return height; }
    height = value as number;
    return chart;
  }

  function cellSizeAccessor(): number;
  function cellSizeAccessor(value: number): Chart;
  function cellSizeAccessor(value?: number) {
    if (!arguments.length) { return cellSize; }
    cellSize = value as number;
    return chart;
  }

  function cellPaddingAccessor(): number;
  function cellPaddingAccessor(value: number): Chart;
  function cellPaddingAccessor(value?: number) {
    if (!arguments.length) { return cellPadding; }
    cellPadding = value as number;
    return chart;
  }

  function fitWidthAccessor(): boolean;
  function fitWidthAccessor(value: boolean): Chart;
  function fitWidthAccessor(value?: boolean) {
    if (!arguments.length) { return fitWidth; }
    fitWidth = Boolean(value);
    return chart;
  }

  function minCellSizeAccessor(): number;
  function minCellSizeAccessor(value: number): Chart;
  function minCellSizeAccessor(value?: number) {
    if (!arguments.length) { return minCellSize; }
    minCellSize = value as number;
    return chart;
  }

  function maxCellSizeAccessor(): number;
  function maxCellSizeAccessor(value: number): Chart;
  function maxCellSizeAccessor(value?: number) {
    if (!arguments.length) { return maxCellSize; }
    maxCellSize = value as number;
    return chart;
  }

  function legendWidthAccessor(): number;
  function legendWidthAccessor(value: number): Chart;
  function legendWidthAccessor(value?: number) {
    if (!arguments.length) { return legendWidth; }
    legendWidth = value as number;
    return chart;
  }

  function legendStepsAccessor(): number;
  function legendStepsAccessor(value: number): Chart;
  function legendStepsAccessor(value?: number) {
    if (!arguments.length) { return legendSteps; }
    legendSteps = value as number;
    return chart;
  }

  function legendGapAccessor(): number;
  function legendGapAccessor(value: number): Chart;
  function legendGapAccessor(value?: number) {
    if (!arguments.length) { return legendGap; }
    legendGap = value as number;
    return chart;
  }

  function legendOffsetAccessor(): number;
  function legendOffsetAccessor(value: number): Chart;
  function legendOffsetAccessor(value?: number) {
    if (!arguments.length) { return legendOffset; }
    legendOffset = value as number;
    return chart;
  }

  function weekStartAccessor(): 'sunday' | 'monday';
  function weekStartAccessor(value: 'sunday' | 'monday'): Chart;
  function weekStartAccessor(value?: 'sunday' | 'monday') {
    if (!arguments.length) { return weekStart; }
    weekStart = value === 'monday' ? 'monday' : 'sunday';
    return chart;
  }

  function colorRangeAccessor(): string[];
  function colorRangeAccessor(value: string[]): Chart;
  function colorRangeAccessor(value?: string[]) {
    if (!arguments.length) { return colorRange; }
    colorRange = value as string[];
    return chart;
  }

  function tooltipEnabledAccessor(): boolean;
  function tooltipEnabledAccessor(value: boolean): Chart;
  function tooltipEnabledAccessor(value?: boolean) {
    if (!arguments.length) { return tooltipEnabled; }
    tooltipEnabled = value as boolean;
    return chart;
  }

  function formattersAccessor(): Formatters;
  function formattersAccessor(value: Formatters): Chart;
  function formattersAccessor(value?: Formatters) {
    if (!arguments.length) { return formatters; }
    const next = value || {};
    formatters = {
      ...formatters,
      ...next,
      legend: {
        ...formatters.legend,
        ...next.legend
      }
    };
    return chart;
  }

  function labelsAccessor(): LabelOptions;
  function labelsAccessor(value: LabelOptions): Chart;
  function labelsAccessor(value?: LabelOptions) {
    if (!arguments.length) { return labels; }
    const next = value || {};
    labels = {
      ...labels,
      ...next,
      day: {
        ...labels.day,
        ...next.day
      },
      month: {
        ...labels.month,
        ...next.month
      }
    };
    return chart;
  }

  function legendEnabledAccessor(): boolean;
  function legendEnabledAccessor(value: boolean): Chart;
  function legendEnabledAccessor(value?: boolean) {
    if (!arguments.length) { return legendEnabled; }
    legendEnabled = value as boolean;
    return chart;
  }

  function onClickAccessor(): ChartOnClick | null;
  function onClickAccessor(value: ChartOnClick | null): Chart;
  function onClickAccessor(value?: ChartOnClick | null) {
    if (!arguments.length) { return onClick; }
    onClick = value ?? null;
    return chart;
  }

  function onHoverAccessor(): ChartOnHover | null;
  function onHoverAccessor(value: ChartOnHover | null): Chart;
  function onHoverAccessor(value?: ChartOnHover | null) {
    if (!arguments.length) { return onHover; }
    onHover = value ?? null;
    return chart;
  }

  function onLeaveAccessor(): ChartOnLeave | null;
  function onLeaveAccessor(value: ChartOnLeave | null): Chart;
  function onLeaveAccessor(value?: ChartOnLeave | null) {
    if (!arguments.length) { return onLeave; }
    onLeave = value ?? null;
    return chart;
  }

  function onFocusAccessor(): ChartOnFocus | null;
  function onFocusAccessor(value: ChartOnFocus | null): Chart;
  function onFocusAccessor(value?: ChartOnFocus | null) {
    if (!arguments.length) { return onFocus; }
    onFocus = value ?? null;
    return chart;
  }

  function onBlurAccessor(): ChartOnBlur | null;
  function onBlurAccessor(value: ChartOnBlur | null): Chart;
  function onBlurAccessor(value?: ChartOnBlur | null) {
    if (!arguments.length) { return onBlur; }
    onBlur = value ?? null;
    return chart;
  }

  function accessibilityTableAccessor(): boolean;
  function accessibilityTableAccessor(value: boolean): Chart;
  function accessibilityTableAccessor(value?: boolean) {
    if (!arguments.length) { return accessibilityTable; }
    accessibilityTable = Boolean(value);
    return chart;
  }

  function ariaLabelAccessor(): string;
  function ariaLabelAccessor(value: string): Chart;
  function ariaLabelAccessor(value?: string) {
    if (!arguments.length) { return ariaLabel; }
    ariaLabel = value as string;
    return chart;
  }

  function ariaDescriptionAccessor(): string | null;
  function ariaDescriptionAccessor(value: string | null): Chart;
  function ariaDescriptionAccessor(value?: string | null) {
    if (!arguments.length) { return ariaDescription; }
    ariaDescription = value ?? null;
    return chart;
  }

  chart.data = dataAccessor;
  chart.max = maxAccessor;
  chart.width = widthAccessor;
  chart.height = heightAccessor;
  chart.cellSize = cellSizeAccessor;
  chart.cellPadding = cellPaddingAccessor;
  chart.fitWidth = fitWidthAccessor;
  chart.minCellSize = minCellSizeAccessor;
  chart.maxCellSize = maxCellSizeAccessor;
  chart.legendWidth = legendWidthAccessor;
  chart.legendSteps = legendStepsAccessor;
  chart.legendGap = legendGapAccessor;
  chart.legendOffset = legendOffsetAccessor;
  chart.selector = selectorAccessor;
  chart.startDate = startDateAccessor;
  chart.dateParser = dateParserAccessor;
  chart.weekStart = weekStartAccessor;
  chart.colorRange = colorRangeAccessor;
  chart.tooltipEnabled = tooltipEnabledAccessor;
  chart.formatters = formattersAccessor;
  chart.labels = labelsAccessor;
  chart.legendEnabled = legendEnabledAccessor;
  chart.onClick = onClickAccessor;
  chart.onHover = onHoverAccessor;
  chart.onLeave = onLeaveAccessor;
  chart.onFocus = onFocusAccessor;
  chart.onBlur = onBlurAccessor;
  chart.accessibilityTable = accessibilityTableAccessor;
  chart.ariaLabel = ariaLabelAccessor;
  chart.ariaDescription = ariaDescriptionAccessor;

  return chart;
}
