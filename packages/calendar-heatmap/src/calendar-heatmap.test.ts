import * as d3 from 'd3';
import { afterEach, describe, expect, it, vi } from 'vitest';
import calendarHeatmap from './calendar-heatmap';

const buildContainer = () => {
  const container = document.createElement('div');
  container.id = 'chart';
  document.body.appendChild(container);
  return container;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('calendarHeatmap', () => {
  it('renders the expected number of day cells and month labels', () => {
    buildContainer();
    const startDate = new Date('2021-01-01T00:00:00');
    const endDate = new Date('2022-01-01T23:59:59.999');
    const dateRange = d3.timeDays(startDate, endDate);
    const monthRange = d3.timeMonths(new Date('2021-01-01T00:00:00'), endDate);

    calendarHeatmap()
      .selector('#chart')
      .startDate(startDate)
      .data([{ date: new Date('2021-01-01'), count: 2 }])();

    expect(document.querySelectorAll('svg.calendar-heatmap').length).toBe(1);
    expect(document.querySelectorAll('rect.day-cell').length).toBe(dateRange.length);
    expect(document.querySelectorAll('text.month-name').length).toBe(monthRange.length);
  });

  it('honors legendEnabled(false)', () => {
    buildContainer();
    calendarHeatmap()
      .selector('#chart')
      .startDate(new Date('2021-01-01'))
      .data([{ date: new Date('2021-01-01'), count: 2 }])
      .legendEnabled(false)();

    expect(document.querySelectorAll('rect.calendar-heatmap-legend').length).toBe(0);
  });

  it('invokes onClick when a cell is clicked', () => {
    buildContainer();
    const onClick = vi.fn();
    calendarHeatmap()
      .selector('#chart')
      .startDate(new Date('2021-01-01'))
      .data([{ date: new Date('2021-01-01'), count: 2 }])
      .onClick(onClick)();

    const firstCell = document.querySelector('rect.day-cell');
    if (!firstCell) {
      throw new Error('No day cells rendered');
    }
    firstCell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not create a tooltip when tooltipEnabled is false', () => {
    buildContainer();
    calendarHeatmap()
      .selector('#chart')
      .startDate(new Date('2021-01-01'))
      .data([{ date: new Date('2021-01-01'), count: 2 }])
      .tooltipEnabled(false)();

    const firstCell = document.querySelector('rect.day-cell');
    if (!firstCell) {
      throw new Error('No day cells rendered');
    }
    firstCell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(document.querySelectorAll('.day-cell-tooltip').length).toBe(0);
  });

  it('uses the provided dateParser for data ingestion', () => {
    buildContainer();
    const parser = vi.fn((value: string | number | Date) => new Date(value));
    calendarHeatmap()
      .selector('#chart')
      .dateParser(parser)
      .data([{ date: '2021-01-02', count: 5 }])();

    expect(parser).toHaveBeenCalled();
  });

  it('respects label toggles', () => {
    buildContainer();
    calendarHeatmap()
      .selector('#chart')
      .labels({ day: { enabled: false }, month: { enabled: false } })
      .data([{ date: new Date('2021-01-01'), count: 2 }])();

    expect(document.querySelectorAll('text.day-initial').length).toBe(0);
    expect(document.querySelectorAll('text.month-name').length).toBe(0);
  });

  it('invokes hover and focus callbacks', () => {
    buildContainer();
    const onHover = vi.fn();
    const onLeave = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    calendarHeatmap()
      .selector('#chart')
      .startDate(new Date('2021-01-01'))
      .data([{ date: new Date('2021-01-01'), count: 2 }])
      .onHover(onHover)
      .onLeave(onLeave)
      .onFocus(onFocus)
      .onBlur(onBlur)();

    const firstCell = document.querySelector('rect.day-cell');
    if (!firstCell) {
      throw new Error('No day cells rendered');
    }
    firstCell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    firstCell.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    firstCell.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    firstCell.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    expect(onHover).toHaveBeenCalled();
    expect(onLeave).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });
});
