import { useEffect, useId, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import calendarHeatmap from '@goujon/calendar-heatmap';

type DateLike = Date | string | number;
type DateParser = (value: DateLike) => Date;

export type CalendarHeatmapDatum = {
  date: DateLike;
  count: number;
};

export type Formatters = {
  dayLabel?: (weekdayIndex: number) => string;
  monthLabel?: (monthIndex: number) => string;
  tooltip?: (date: Date, count: number) => string;
  legend?: {
    less?: string;
    more?: string;
  };
  ariaLabel?: (date: Date, count: number) => string;
};

export type CalendarHeatmapProps = {
  data: CalendarHeatmapDatum[];
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
  cellSize?: number;
  cellPadding?: number;
  fitWidth?: boolean;
  minCellSize?: number;
  maxCellSize?: number;
  legendWidth?: number;
  legendSteps?: number;
  legendGap?: number;
  legendOffset?: number;
  max?: number | null;
  startDate?: DateLike;
  dateParser?: DateParser;
  weekStart?: 'sunday' | 'monday';
  colorRange?: string[];
  tooltipEnabled?: boolean;
  formatters?: Formatters;
  labels?: {
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
  legendEnabled?: boolean;
  onClick?: (data: { date: Date; count: number }, event: Event) => void;
  onHover?: (data: { date: Date; count: number }, event: Event) => void;
  onLeave?: (data: { date: Date; count: number }, event: Event) => void;
  onFocus?: (data: { date: Date; count: number }, event: Event) => void;
  onBlur?: (data: { date: Date; count: number }, event: Event) => void;
  accessibilityTable?: boolean;
  ariaLabel?: string;
  ariaDescription?: string | null;
};

export type UseCalendarHeatmapOptions = Omit<CalendarHeatmapProps, 'className' | 'style'>;

export function useCalendarHeatmap({
  data,
  width,
  height,
  cellSize,
  cellPadding,
  fitWidth,
  minCellSize,
  maxCellSize,
  legendWidth,
  legendSteps,
  legendGap,
  legendOffset,
  max,
  startDate,
  dateParser,
  weekStart,
  colorRange,
  tooltipEnabled,
  formatters,
  labels,
  legendEnabled,
  onClick,
  onHover,
  onLeave,
  onFocus,
  onBlur,
  accessibilityTable,
  ariaLabel,
  ariaDescription
}: UseCalendarHeatmapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const safeId = useMemo(
    () => `calendar-heatmap-${reactId.replace(/[:]/g, '')}`,
    [reactId]
  );
  const chartRef = useRef<ReturnType<typeof calendarHeatmap> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const selector = `#${safeId}`;
    const chart = chartRef.current ?? calendarHeatmap();
    chartRef.current = chart;
    chart.data(data).selector(selector);

    if (typeof width === 'number') {
      chart.width(width);
    }
    if (typeof height === 'number') {
      chart.height(height);
    }
    if (typeof cellSize === 'number') {
      chart.cellSize(cellSize);
    }
    if (typeof cellPadding === 'number') {
      chart.cellPadding(cellPadding);
    }
    if (typeof fitWidth === 'boolean') {
      chart.fitWidth(fitWidth);
    }
    if (typeof minCellSize === 'number') {
      chart.minCellSize(minCellSize);
    }
    if (typeof maxCellSize === 'number') {
      chart.maxCellSize(maxCellSize);
    }
    if (typeof legendWidth === 'number') {
      chart.legendWidth(legendWidth);
    }
    if (typeof legendSteps === 'number') {
      chart.legendSteps(legendSteps);
    }
    if (typeof legendGap === 'number') {
      chart.legendGap(legendGap);
    }
    if (typeof legendOffset === 'number') {
      chart.legendOffset(legendOffset);
    }
    if (typeof max === 'number' || max === null) {
      chart.max(max);
    }
    if (startDate) {
      chart.startDate(startDate);
    }
    if (dateParser) {
      chart.dateParser(dateParser);
    }
    if (weekStart === 'sunday' || weekStart === 'monday') {
      chart.weekStart(weekStart);
    }
    if (colorRange) {
      chart.colorRange(colorRange);
    }
    if (typeof tooltipEnabled === 'boolean') {
      chart.tooltipEnabled(tooltipEnabled);
    }
    if (formatters) {
      chart.formatters(formatters);
    }
    if (labels) {
      chart.labels(labels);
    }
    if (typeof legendEnabled === 'boolean') {
      chart.legendEnabled(legendEnabled);
    }
    if (onClick) {
      chart.onClick(onClick);
    }
    if (onHover) {
      chart.onHover(onHover);
    }
    if (onLeave) {
      chart.onLeave(onLeave);
    }
    if (onFocus) {
      chart.onFocus(onFocus);
    }
    if (onBlur) {
      chart.onBlur(onBlur);
    }
    if (typeof accessibilityTable === 'boolean') {
      chart.accessibilityTable(accessibilityTable);
    }
    if (typeof ariaLabel === 'string') {
      chart.ariaLabel(ariaLabel);
    }
    if (typeof ariaDescription !== 'undefined') {
      chart.ariaDescription(ariaDescription ?? null);
    }

    chart();
  }, [
    data,
    safeId,
    width,
    height,
    cellSize,
    cellPadding,
    fitWidth,
    minCellSize,
    maxCellSize,
    legendWidth,
    legendSteps,
    legendGap,
    legendOffset,
    max,
    startDate,
    dateParser,
    weekStart,
    colorRange,
    tooltipEnabled,
    formatters,
    labels,
    legendEnabled,
    onClick,
    onHover,
    onLeave,
    onFocus,
    onBlur,
    accessibilityTable,
    ariaLabel,
    ariaDescription
  ]);

  useEffect(() => {
    return () => {
      if (!containerRef.current) {
        return;
      }
      containerRef.current.innerHTML = '';
    };
  }, []);

  return { containerRef, id: safeId };
}

export function CalendarHeatmap(props: CalendarHeatmapProps) {
  const { className, style, ...options } = props;
  const { containerRef, id } = useCalendarHeatmap(options);
  return <div id={id} ref={containerRef} className={className} style={style} />;
}

export default CalendarHeatmap;
