import { useEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import worldLow from '@amcharts/amcharts5-geodata/worldLow';
import { BRAND_COLORS } from '@/data/theme';

interface OverviewGlobeProps {
  onUSClick?: () => void;
  height?: string;
}

// Degrees of rotation per second while idle. Time-based, so the speed is the
// same whatever the frame rate.
const IDLE_SPIN_DEG_PER_SEC = 6;
// How long after the user last interacted before idle spin resumes.
const RESUME_AFTER_MS = 3000;

export default function OverviewGlobe({ onUSClick, height = '500px' }: OverviewGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onUSClickRef = useRef(onUSClick);
  onUSClickRef.current = onUSClick;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root = am5.Root.new(container);

    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'rotateX',
        panY: 'rotateY',
        projection: am5map.geoOrthographic(),
        background: am5.Rectangle.new(root, { fill: am5.color(0x0f2818), fillOpacity: 1 }),
        minZoomLevel: 0.8,
        maxZoomLevel: 8,
        homeGeoPoint: { latitude: 35, longitude: -98 },
        homeZoomLevel: 2.5,
      } as any)
    );

    // Background ocean polygon
    const oceanSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        include: ['world'],
      } as any)
    );
    oceanSeries.mapPolygons.template.setAll({
      fill: am5.color(0x0a1a10),
      strokeOpacity: 0,
      fillOpacity: 0.3,
    });

    // World countries - muted gray
    const worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: worldLow as any,
        exclude: ['US'],
      } as any)
    );
    worldSeries.mapPolygons.template.setAll({
      fill: am5.color(0x3a3a3a),
      stroke: am5.color(0x555555),
      strokeWidth: 0.5,
      strokeOpacity: 0.6,
      fillOpacity: 0.85,
      tooltipText: '{name}',
    });

    worldSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(0x555555),
    });

    worldSeries.mapPolygons.template.events.on('click', (e: any) => {
      const dataItem = e.target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id' as any);
        if (id !== 'US') {
          const name = (dataItem.dataContext as any)?.name || 'this country';
          console.log(`Clicked ${name} — county-level monitoring is available for the contiguous United States.`);
        }
      }
    });

    // US highlighted
    const usSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: worldLow as any,
        include: ['US'],
      } as any)
    );
    usSeries.mapPolygons.template.setAll({
      fill: am5.color(parseInt(BRAND_COLORS.accentGreen.replace('#', ''), 16)),
      stroke: am5.color(parseInt(BRAND_COLORS.sageGreen.replace('#', ''), 16)),
      strokeWidth: 1,
      strokeOpacity: 0.9,
      fillOpacity: 0.95,
      tooltipText: 'United States\nClick to explore risk data',
    });

    usSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(parseInt(BRAND_COLORS.sageGreen.replace('#', ''), 16)),
    });

    usSeries.mapPolygons.template.events.on('click', () => {
      if (onUSClickRef.current) {
        onUSClickRef.current();
      }
    });

    // Graticule grid
    const graticuleSeries = chart.series.push(
      am5map.GraticuleSeries.new(root, {} as any)
    );
    graticuleSeries.mapLines.template.setAll({
      stroke: am5.color(0x1b3a2b),
      strokeOpacity: 0.4,
      strokeWidth: 0.5,
    });
    graticuleSeries.set('visible', false);

    // Zoom control
    chart.set('zoomControl', am5map.ZoomControl.new(root, {} as any));
    const zoomControl = chart.get('zoomControl');
    if (zoomControl) {
      zoomControl.homeButton.set('visible', true);
    }

    // Idle spin. Runs on requestAnimationFrame with elapsed-time deltas, so the
    // motion stays smooth at the display's refresh rate instead of stepping at
    // a fixed 50ms interval.
    let lastInteractionAt = 0;
    let interacting = false;
    let lastFrameAt = 0;
    let frameId = 0;

    const spin = (now: number) => {
      const dt = lastFrameAt ? now - lastFrameAt : 0;
      lastFrameAt = now;
      // Skip huge gaps (backgrounded tab) so the globe doesn't jump.
      if (
        dt > 0 &&
        dt < 250 &&
        !interacting &&
        now - lastInteractionAt > RESUME_AFTER_MS
      ) {
        const next = ((chart.get('rotationX') as number) || 0) + (IDLE_SPIN_DEG_PER_SEC * dt) / 1000;
        chart.set('rotationX', next);
      }
      frameId = requestAnimationFrame(spin);
    };
    frameId = requestAnimationFrame(spin);

    const onPanStart = () => {
      interacting = true;
      lastInteractionAt = performance.now();
    };
    const onPanEnd = () => {
      interacting = false;
      lastInteractionAt = performance.now();
    };
    const onWheel = () => {
      lastInteractionAt = performance.now();
    };

    chart.events.on('panstarted' as any, onPanStart);
    chart.events.on('panended' as any, onPanEnd);
    container.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('wheel', onWheel);
      root.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full globe-container rounded-lg" style={{ height }} />;
}
