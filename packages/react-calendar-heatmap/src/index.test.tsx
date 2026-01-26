import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CalendarHeatmap } from './index';

type ChartInstance = {
  data: ReturnType<typeof vi.fn>;
  selector: ReturnType<typeof vi.fn>;
  width: ReturnType<typeof vi.fn>;
  height: ReturnType<typeof vi.fn>;
  cellSize: ReturnType<typeof vi.fn>;
  cellPadding: ReturnType<typeof vi.fn>;
  fitWidth: ReturnType<typeof vi.fn>;
  minCellSize: ReturnType<typeof vi.fn>;
  maxCellSize: ReturnType<typeof vi.fn>;
  legendWidth: ReturnType<typeof vi.fn>;
  legendSteps: ReturnType<typeof vi.fn>;
  legendGap: ReturnType<typeof vi.fn>;
  legendOffset: ReturnType<typeof vi.fn>;
  max: ReturnType<typeof vi.fn>;
  startDate: ReturnType<typeof vi.fn>;
  dateParser: ReturnType<typeof vi.fn>;
  weekStart: ReturnType<typeof vi.fn>;
  colorRange: ReturnType<typeof vi.fn>;
  tooltipEnabled: ReturnType<typeof vi.fn>;
  formatters: ReturnType<typeof vi.fn>;
  labels: ReturnType<typeof vi.fn>;
  legendEnabled: ReturnType<typeof vi.fn>;
  onClick: ReturnType<typeof vi.fn>;
  onHover: ReturnType<typeof vi.fn>;
  onLeave: ReturnType<typeof vi.fn>;
  onFocus: ReturnType<typeof vi.fn>;
  onBlur: ReturnType<typeof vi.fn>;
  accessibilityTable: ReturnType<typeof vi.fn>;
  ariaLabel: ReturnType<typeof vi.fn>;
  ariaDescription: ReturnType<typeof vi.fn>;
  (): void;
};

let lastChart: ChartInstance | null = null;

const createChart = () => {
  const chartFn = vi.fn();
    const chainable = {
      data: vi.fn().mockReturnThis(),
      selector: vi.fn().mockReturnThis(),
      width: vi.fn().mockReturnThis(),
      height: vi.fn().mockReturnThis(),
      cellSize: vi.fn().mockReturnThis(),
      cellPadding: vi.fn().mockReturnThis(),
      fitWidth: vi.fn().mockReturnThis(),
      minCellSize: vi.fn().mockReturnThis(),
      maxCellSize: vi.fn().mockReturnThis(),
      legendWidth: vi.fn().mockReturnThis(),
      legendSteps: vi.fn().mockReturnThis(),
      legendGap: vi.fn().mockReturnThis(),
      legendOffset: vi.fn().mockReturnThis(),
      max: vi.fn().mockReturnThis(),
      startDate: vi.fn().mockReturnThis(),
      dateParser: vi.fn().mockReturnThis(),
      weekStart: vi.fn().mockReturnThis(),
      colorRange: vi.fn().mockReturnThis(),
      tooltipEnabled: vi.fn().mockReturnThis(),
      formatters: vi.fn().mockReturnThis(),
      labels: vi.fn().mockReturnThis(),
      legendEnabled: vi.fn().mockReturnThis(),
      onClick: vi.fn().mockReturnThis(),
      onHover: vi.fn().mockReturnThis(),
      onLeave: vi.fn().mockReturnThis(),
      onFocus: vi.fn().mockReturnThis(),
      onBlur: vi.fn().mockReturnThis(),
      accessibilityTable: vi.fn().mockReturnThis(),
      ariaLabel: vi.fn().mockReturnThis(),
      ariaDescription: vi.fn().mockReturnThis()
    };
  return Object.assign(chartFn, chainable);
};

vi.mock('@goujon/calendar-heatmap', () => {
  return {
    default: vi.fn(() => {
      lastChart = createChart();
      return lastChart;
    })
  };
});

afterEach(() => {
  cleanup();
  lastChart = null;
  vi.clearAllMocks();
});

describe('CalendarHeatmap', () => {
  it('configures and renders the chart', () => {
    const data = [{ date: new Date('2024-01-01'), count: 2 }];
    render(
      <CalendarHeatmap
        data={data}
        width={420}
        height={120}
        cellSize={10}
        cellPadding={2}
        fitWidth
        minCellSize={6}
        maxCellSize={16}
        legendWidth={140}
        legendSteps={5}
        legendGap={3}
        legendOffset={10}
        max={10}
        dateParser={(value) => new Date(value)}
        weekStart="monday"
        colorRange={['#fff', '#000']}
        tooltipEnabled={false}
        formatters={{
          tooltip: () => 'Custom tooltip',
          ariaLabel: () => 'Custom label',
          legend: { less: 'Low', more: 'High' }
        }}
        labels={{ day: { enabled: false }, month: { padding: 16 } }}
        legendEnabled={false}
        onClick={() => undefined}
        onHover={() => undefined}
        onLeave={() => undefined}
        onFocus={() => undefined}
        onBlur={() => undefined}
        accessibilityTable
        ariaLabel="Example heatmap"
        ariaDescription="Example description"
      />
    );

    expect(lastChart).not.toBeNull();
    if (!lastChart) {
      return;
    }
    expect(lastChart.data).toHaveBeenCalledWith(data);
    expect(lastChart.selector).toHaveBeenCalledWith(expect.stringMatching(/^#calendar-heatmap-/));
    expect(lastChart.width).toHaveBeenCalledWith(420);
    expect(lastChart.height).toHaveBeenCalledWith(120);
    expect(lastChart.cellSize).toHaveBeenCalledWith(10);
    expect(lastChart.cellPadding).toHaveBeenCalledWith(2);
    expect(lastChart.fitWidth).toHaveBeenCalledWith(true);
    expect(lastChart.minCellSize).toHaveBeenCalledWith(6);
    expect(lastChart.maxCellSize).toHaveBeenCalledWith(16);
    expect(lastChart.legendWidth).toHaveBeenCalledWith(140);
    expect(lastChart.legendSteps).toHaveBeenCalledWith(5);
    expect(lastChart.legendGap).toHaveBeenCalledWith(3);
    expect(lastChart.legendOffset).toHaveBeenCalledWith(10);
    expect(lastChart.max).toHaveBeenCalledWith(10);
    expect(lastChart.dateParser).toHaveBeenCalled();
    expect(lastChart.weekStart).toHaveBeenCalledWith('monday');
    expect(lastChart.colorRange).toHaveBeenCalledWith(['#fff', '#000']);
    expect(lastChart.tooltipEnabled).toHaveBeenCalledWith(false);
    expect(lastChart.formatters).toHaveBeenCalled();
    expect(lastChart.labels).toHaveBeenCalled();
    expect(lastChart.legendEnabled).toHaveBeenCalledWith(false);
    expect(lastChart.onClick).toHaveBeenCalled();
    expect(lastChart.onHover).toHaveBeenCalled();
    expect(lastChart.onLeave).toHaveBeenCalled();
    expect(lastChart.onFocus).toHaveBeenCalled();
    expect(lastChart.onBlur).toHaveBeenCalled();
    expect(lastChart.accessibilityTable).toHaveBeenCalledWith(true);
    expect(lastChart.ariaLabel).toHaveBeenCalledWith('Example heatmap');
    expect(lastChart.ariaDescription).toHaveBeenCalledWith('Example description');
    expect(lastChart).toHaveBeenCalled();
  });

  it('updates when data changes', () => {
    const initial = [{ date: new Date('2024-01-01'), count: 2 }];
    const updated = [{ date: new Date('2024-01-02'), count: 3 }];
    const { rerender } = render(<CalendarHeatmap data={initial} />);
    if (!lastChart) {
      throw new Error('chart not created');
    }
    expect(lastChart.data).toHaveBeenCalledWith(initial);
    rerender(<CalendarHeatmap data={updated} />);
    expect(lastChart.data).toHaveBeenCalledWith(updated);
  });
});
