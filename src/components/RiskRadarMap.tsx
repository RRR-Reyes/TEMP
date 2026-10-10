import { useEffect, useRef, useCallback } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import worldLow from '@amcharts/amcharts5-geodata/worldLow';
import usaLow from '@amcharts/amcharts5-geodata/usaLow';
import { CONTIGUOUS_STATES, STATE_CODE_TO_ID } from '@/data/states';
import { getCountyRiskLevel } from '@/data/demoData';
import { RISK_COLORS_FILL } from '@/data/theme';
import { loadStateGeodata } from '@/data/stateGeodata';
import type { RiskLevel } from '@/types';

export type ViewLevel = 'us' | 'state' | 'county';

export interface RadarMapCallbacks {
  onStateClick: (stateCode: string, stateName: string) => void;
  onCountyClick: (fips: string, countyName: string) => void;
  onReady?: () => void;
}

interface RiskRadarMapProps {
  selectedState: string | null;
  selectedCounty: string | null;
  callbacks: RadarMapCallbacks;
}

const CONTIGUOUS_STATE_IDS = CONTIGUOUS_STATES.map((s) => s.id);

function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export default function RiskRadarMap({ selectedState, selectedCounty, callbacks }: RiskRadarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5map.MapChart | null>(null);
  const usStatesSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const stateCountiesSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const rotationRef = useRef<number | null>(null);
  const userInteractingRef = useRef(false);
  const currentViewLevelRef = useRef<ViewLevel>('us');

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const selectedStateRef = useRef(selectedState);
  selectedStateRef.current = selectedState;

  const selectedCountyRef = useRef(selectedCounty);
  selectedCountyRef.current = selectedCounty;

  // Initialize chart
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
        background: am5.Rectangle.new(root, { fill: am5.color(0x0a1a10), fillOpacity: 1 }),
        minZoomLevel: 0.8,
        maxZoomLevel: 64,
        homeGeoPoint: { latitude: 38, longitude: -97 },
        homeZoomLevel: 3,
        wheelY: 'zoom',
      } as any)
    );
    chartRef.current = chart;

    // World countries (muted)
    const worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: worldLow as any,
        exclude: ['US'],
      } as any)
    );
    worldSeries.mapPolygons.template.setAll({
      fill: am5.color(0x2a2a2a),
      stroke: am5.color(0x444444),
      strokeWidth: 0.5,
      strokeOpacity: 0.5,
      fillOpacity: 0.7,
      tooltipText: '{name}',
    });

    // US states series
    const usStatesSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: usaLow as any,
        include: CONTIGUOUS_STATE_IDS,
      } as any)
    );
    usStatesSeries.mapPolygons.template.setAll({
      fill: am5.color(0x3d6b30),
      stroke: am5.color(0x8ba87a),
      strokeWidth: 0.8,
      strokeOpacity: 0.8,
      fillOpacity: 0.4,
      tooltipText: '{name}',
      templateField: 'settings',
    });

    usStatesSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(0x5a8f54),
      fillOpacity: 0.7,
    });

    usStatesSeries.mapPolygons.template.events.on('click', (e: any) => {
      const dataItem = e.target.dataItem;
      if (!dataItem) return;
      const id = dataItem.get('id' as any) as string;
      const name = (dataItem.dataContext as any)?.name as string;
      if (id && name) {
        const stateCode = id.replace('US-', '');
        if (CONTIGUOUS_STATES.some((s) => s.code === stateCode)) {
          callbacksRef.current.onStateClick(stateCode, name);
        }
      }
    });

    usStatesSeriesRef.current = usStatesSeries;

    // State counties series
    const stateCountiesSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, { visible: false } as any)
    );
    stateCountiesSeries.mapPolygons.template.setAll({
      stroke: am5.color(0xc8d5b9),
      strokeWidth: 0.8,
      strokeOpacity: 0.7,
      fillOpacity: 0.7,
      tooltipText: '{name} County',
      templateField: 'settings',
    });

    stateCountiesSeries.mapPolygons.template.states.create('hover', {
      stroke: am5.color(0xf7f4ec),
      strokeWidth: 1.5,
      strokeOpacity: 1,
      fillOpacity: 0.85,
    });

    stateCountiesSeries.mapPolygons.template.events.on('click', (e: any) => {
      const dataItem = e.target.dataItem;
      if (!dataItem) return;
      const id = dataItem.get('id' as any) as string;
      const name = (dataItem.dataContext as any)?.name as string;
      if (id && name) {
        callbacksRef.current.onCountyClick(id, name);
      }
    });

    stateCountiesSeriesRef.current = stateCountiesSeries;

    // Graticule
    const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {} as any));
    graticuleSeries.mapLines.template.setAll({
      stroke: am5.color(0x1b3a2b),
      strokeOpacity: 0.3,
      strokeWidth: 0.3,
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
        if (
          !userInteractingRef.current &&
          Date.now() - lastInteractionTime > 4000 &&
          currentViewLevelRef.current === 'us'
        ) {
          chart.set('rotationX', (chart.get('rotationX') || 0) + 0.15);
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

    // Apply initial risk coloring
    applyStateRiskColors();

    if (callbacksRef.current.onReady) {
      callbacksRef.current.onReady();
    }

    return () => {
      if (rotationRef.current) {
        clearInterval(rotationRef.current);
        rotationRef.current = null;
      }
      root.dispose();
      rootRef.current = null;
      chartRef.current = null;
      usStatesSeriesRef.current = null;
      stateCountiesSeriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyStateRiskColors() {
    const series = usStatesSeriesRef.current;
    if (!series) return;
    const data: any[] = [];
    series.dataItems.forEach((di) => {
      const id = di.get('id' as any) as string;
      if (!id) return;
      const riskLevel: RiskLevel = getCountyRiskLevel(id);
      data.push({
        id,
        name: (di.dataContext as any)?.name,
        settings: {
          fill: am5.color(hexToNum(RISK_COLORS_FILL[riskLevel])),
          fillOpacity: 0.55,
        },
      });
    });
    series.data.setAll(data);
  }

  function applyCountyRiskColors(series: am5map.MapPolygonSeries) {
    const data: any[] = [];
    series.dataItems.forEach((di) => {
      const id = di.get('id' as any) as string;
      if (!id) return;
      const riskLevel = getCountyRiskLevel(id);
      const name = (di.dataContext as any)?.name as string;
      const isCountySelected = id === selectedCountyRef.current;
      data.push({
        id,
        name,
        settings: {
          fill: am5.color(isCountySelected ? 0xf7f4ec : hexToNum(RISK_COLORS_FILL[riskLevel])),
          fillOpacity: isCountySelected ? 0.9 : 0.65,
          stroke: am5.color(isCountySelected ? 0xf7f4ec : 0x8ba87a),
          strokeWidth: isCountySelected ? 2 : 0.5,
        },
      });
    });
    series.data.setAll(data);
  }

  const goToUSView = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    currentViewLevelRef.current = 'us';
    stateCountiesSeriesRef.current?.set('visible', false);
    usStatesSeriesRef.current?.set('visible', true);
    chart.animate({ key: 'rotationX', to: -97, duration: 1200, easing: am5.ease.inOut(am5.ease.cubic) });
    chart.animate({ key: 'rotationY', to: 0, duration: 1200, easing: am5.ease.inOut(am5.ease.cubic) });
    setTimeout(() => chart.goHome(), 100);
  }, []);

  const goToStateView = useCallback(async (stateCode: string) => {
    const chart = chartRef.current;
    if (!chart) return;

    currentViewLevelRef.current = 'state';
    const stateId = STATE_CODE_TO_ID[stateCode];
    if (!stateId) return;

    const statesSeries = usStatesSeriesRef.current;
    if (!statesSeries) return;

    const stateDataItem = statesSeries.getDataItemById(stateId);
    if (!stateDataItem) return;

    const polygon = stateDataItem.get('mapPolygon');
    if (!polygon) return;

    const centroid = polygon.geoCentroid();
    if (!centroid) return;

    // Highlight selected state, dim others
    statesSeries.mapPolygons.each((poly) => {
      const did = poly.dataItem;
      const polyId = did?.get('id' as any) as string;
      if (polyId === stateId) {
        poly.setAll({
          fill: am5.color(0x3d6b30),
          fillOpacity: 0.3,
          stroke: am5.color(0xf7f4ec),
          strokeWidth: 1.5,
        });
      } else if (polyId) {
        const riskLevel = getCountyRiskLevel(polyId);
        poly.setAll({
          fill: am5.color(hexToNum(RISK_COLORS_FILL[riskLevel])),
          fillOpacity: 0.25,
          stroke: am5.color(0x8ba87a),
          strokeWidth: 0.5,
        });
      }
    });

    chart.animate({ key: 'rotationX', to: -centroid.longitude, duration: 1200, easing: am5.ease.inOut(am5.ease.cubic) });
    chart.animate({ key: 'rotationY', to: -centroid.latitude, duration: 1200, easing: am5.ease.inOut(am5.ease.cubic) });

    // Load county data
    try {
      const stateGeoData = await loadStateGeodata(stateCode);

      const countySeries = stateCountiesSeriesRef.current;
      if (countySeries) {
        countySeries.set('visible', false);
        countySeries.set('geodata' as any, stateGeoData);
        countySeries.events.once('datavalidated', () => {
          countySeries.set('visible', true);
          applyCountyRiskColors(countySeries);
          countySeries.zoomToDataItems({} as any);
          usStatesSeriesRef.current?.set('visible', false);
        });
      }
    } catch (err) {
      console.error('Failed to load state geodata:', err);
    }
  }, []);

  const goToCountyView = useCallback((fips: string) => {
    const chart = chartRef.current;
    const countySeries = stateCountiesSeriesRef.current;
    if (!chart || !countySeries) return;

    currentViewLevelRef.current = 'county';
    applyCountyRiskColors(countySeries);

    const dataItem = countySeries.getDataItemById(fips);
    if (dataItem) {
      const polygon = dataItem.get('mapPolygon');
      if (polygon) {
        const centroid = polygon.geoCentroid();
        if (centroid) {
          chart.animate({ key: 'rotationX', to: -centroid.longitude, duration: 800, easing: am5.ease.inOut(am5.ease.cubic) });
          chart.animate({ key: 'rotationY', to: -centroid.latitude, duration: 800, easing: am5.ease.inOut(am5.ease.cubic) });
        }
      }
      countySeries.zoomToDataItem(dataItem);
    }
  }, []);

  // Handle state changes
  useEffect(() => {
    if (!chartRef.current) return;
    if (selectedState) {
      goToStateView(selectedState);
    } else {
      goToUSView();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  // Handle county changes
  useEffect(() => {
    if (!chartRef.current) return;
    if (selectedState && selectedCounty) {
      goToCountyView(selectedCounty);
    } else if (selectedState && !selectedCounty) {
      currentViewLevelRef.current = 'state';
      const countySeries = stateCountiesSeriesRef.current;
      if (countySeries) {
        applyCountyRiskColors(countySeries);
        countySeries.zoomToDataItems({} as any);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCounty]);

  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).__radarNav = { goToUSView, goToStateView, goToCountyView };
    }
  }, [goToUSView, goToStateView, goToCountyView]);

  return <div ref={containerRef} className="w-full h-full globe-container" />;
}
