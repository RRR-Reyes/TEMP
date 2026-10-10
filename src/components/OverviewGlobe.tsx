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

export default function OverviewGlobe({ onUSClick, height = '500px' }: OverviewGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number | null>(null);
  const userInteractingRef = useRef(false);
  const onUSClickRef = useRef(onUSClick);
  onUSClickRef.current = onUSClick;

  useEffect(() => {
    if (!containerRef.current) return;

    const root = am5.Root.new(containerRef.current);

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

    // Auto rotation
    let lastInteractionTime = 0;

    const startRotation = () => {
      if (rotationRef.current) return;
      rotationRef.current = setInterval(() => {
        if (!userInteractingRef.current && Date.now() - lastInteractionTime > 3000) {
          chart.set('rotationX', (chart.get('rotationX') || 0) + 0.3);
        }
      }, 50) as unknown as number;
    };

    chart.events.on('panstarted' as any, () => {
      userInteractingRef.current = true;
      lastInteractionTime = Date.now();
    });
    chart.events.on('panended' as any, () => {
      lastInteractionTime = Date.now();
      userInteractingRef.current = false;
    });

    containerRef.current?.addEventListener('wheel', () => {
      lastInteractionTime = Date.now();
      userInteractingRef.current = true;
      setTimeout(() => {
        userInteractingRef.current = false;
      }, 2000);
    }, { passive: true });

    startRotation();

    return () => {
      if (rotationRef.current) {
        clearInterval(rotationRef.current);
        rotationRef.current = null;
      }
      root.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full globe-container rounded-lg" style={{ height }} />;
}
