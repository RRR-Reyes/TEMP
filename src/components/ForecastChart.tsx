import { useEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import type { ForecastDay } from '@/types';
import { RISK_COLORS_FILL } from '@/data/theme';

interface ForecastChartProps {
  data: ForecastDay[];
  height?: string;
}

export default function ForecastChart({ data, height = '360px' }: ForecastChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const root = am5.Root.new(containerRef.current);
    rootRef.current = root;

    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
        paddingTop: 20,
        paddingBottom: 10,
        paddingLeft: 0,
        paddingRight: 10,
        background: am5.color(0xf7f4ec),
      } as any)
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'dayLabel',
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 40 } as any),
        tooltip: am5.Tooltip.new(root, {} as any),
      } as any)
    );

    xAxis.get('renderer').labels.template.setAll({
      fill: am5.color(0x2a2a2a),
      fontSize: '13px',
      fontFamily: 'Inter, sans-serif',
    });

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        renderer: am5xy.AxisRendererY.new(root, {} as any),
      } as any)
    );

    yAxis.get('renderer').labels.template.setAll({
      fill: am5.color(0x666666),
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
    });

    // Series - risk index line
    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: 'Risk Index',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'riskIndex',
        categoryXField: 'dayLabel',
        fill: am5.color(0x3d6b30),
        stroke: am5.color(0x3d6b30),
        strokeWidth: 2.5,
        tension: 0.4,
        tooltip: am5.Tooltip.new(root, {
          labelHTML: `<div style="padding:6px 10px;">
            <div style="font-weight:600;color:#f7f4ec;font-size:13px;">{dayLabel}</div>
            <div style="color:#8ba87a;font-size:12px;margin-top:2px;">Risk Index: <b>{riskIndex}</b></div>
            <div style="color:#c8d5b9;font-size:11px;margin-top:2px;">Temp: {temperature}°F · Hum: {humidity}%</div>
            <div style="color:#a8916b;font-size:11px;">Precip: {precipitation}mm · {riskLabel}</div>
          </div>`,
        } as any),
      } as any)
    );

    series.data.setAll(
      data.map((d) => ({
        ...d,
        riskLabel: d.riskLevel.charAt(0).toUpperCase() + d.riskLevel.slice(1),
      }))
    );

    // Bullets colored by risk level
    series.bullets.push(() => {
      const circle = am5.Circle.new(root, {
        radius: 6,
        stroke: am5.color(0x3d6b30),
        strokeWidth: 2,
        fill: am5.color(0xf7f4ec),
      } as any);
      circle.adapters.add('fill', (fill: any, target: any) => {
        const dataItem = target.dataItem;
        if (dataItem && dataItem.dataContext) {
          const level = dataItem.dataContext.riskLevel as keyof typeof RISK_COLORS_FILL;
          const colorHex = RISK_COLORS_FILL[level];
          if (colorHex) {
            return am5.color(parseInt(colorHex.replace('#', ''), 16));
          }
        }
        return fill;
      });
      return am5.Bullet.new(root, { sprite: circle } as any);
    });

    // Add observed vs forecast divider
    const firstForecastIndex = data.findIndex((d) => d.isForecast);
    if (firstForecastIndex > 0 && firstForecastIndex < data.length) {
      const dividerRange = xAxis.createAxisRange(xAxis.dataItems[firstForecastIndex]);
      dividerRange.get('grid')?.setAll({
        stroke: am5.color(0xa8916b),
        strokeOpacity: 0.5,
        strokeDasharray: [3, 3],
        strokeWidth: 1.5,
        visible: true,
      });
      dividerRange.get('label')?.setAll({
        text: '← Observed  │  Forecast →',
        fill: am5.color(0xa8916b),
        fontSize: '10px',
        fontWeight: '500',
        paddingTop: 25,
      });
    }

    // Legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 10,
      } as any)
    );
    legend.labels.template.setAll({
      fill: am5.color(0x666666),
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
    });
    legend.data.setAll(chart.series.values);

    chart.appear(800, 100);

    return () => {
      root.dispose();
      rootRef.current = null;
    };
  }, [data]);

  return <div ref={containerRef} style={{ height }} className="w-full" />;
}
