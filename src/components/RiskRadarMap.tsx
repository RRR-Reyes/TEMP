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
        // Start facing the U.S. (rotation is the negative of 38°N, 97°W)
        rotationX: 97,
        rotationY: -38,
        wheelY: 'zoom',
        doubleClickZoom: false,
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

    // The county details panel slides in beside the map (and back out), which
    // changes its size and leaves the view off-center. Re-fit once the size settles.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const countySeries = stateCountiesSeriesRef.current;
        const fips = selectedCountyRef.current;
        if (!countySeries) return;
        if (currentViewLevelRef.current === 'county' && fips) {
          const dataItem = countySeries.getDataItemById(fips);
          if (dataItem) countySeries.zoomToDataItem(dataItem, true);
        } else if (currentViewLevelRef.current === 'state' && countySeries.dataItems.length) {
          countySeries.zoomToDataItems(countySeries.dataItems, true);
        }
      }, 250);
    });
    resizeObserver.observe(containerRef.current);

    // Apply initial risk coloring once the state polygons have been built
    usStatesSeries.events.once('geodataprocessed' as any, () => styleStatePolygons(null));

    if (callbacksRef.current.onReady) {
      callbacksRef.current.onReady();
    }

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
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

  // Colors the county polygons by risk level. Styles the polygons directly
  // (rather than replacing the series data, which would rebuild them).
  function applyCountyRiskColors(series: am5map.MapPolygonSeries) {
    series.mapPolygons.each((poly) => {
      const id = poly.dataItem?.get('id' as any) as string;
      if (!id) return;
      const isCountySelected = id === selectedCountyRef.current;
      const riskLevel = getCountyRiskLevel(id);
      poly.setAll({
        fill: am5.color(isCountySelected ? 0xf7f4ec : hexToNum(RISK_COLORS_FILL[riskLevel])),
        fillOpacity: isCountySelected ? 0.9 : 0.65,
        stroke: am5.color(isCountySelected ? 0xf7f4ec : 0x8ba87a),
        strokeWidth: isCountySelected ? 2 : 0.5,
      });
    });
  }

  // Styles the US state polygons. With no selection every state gets its risk
  // color; with a selection the other states are dimmed (still clickable) and
  // the selected one is outlined.
  function styleStatePolygons(selectedId: string | null) {
    const series = usStatesSeriesRef.current;
    if (!series) return;
    series.mapPolygons.each((poly) => {
      const polyId = poly.dataItem?.get('id' as any) as string;
      if (!polyId) return;
      const riskFill = am5.color(hexToNum(RISK_COLORS_FILL[getCountyRiskLevel(polyId)]));
      poly.set('visible', true);
      if (!selectedId) {
        poly.setAll({
          fill: riskFill,
          fillOpacity: 0.55,
          stroke: am5.color(0x8ba87a),
          strokeWidth: 0.8,
        });
      } else if (polyId === selectedId) {
        poly.setAll({
          fill: am5.color(0x3d6b30),
          fillOpacity: 0.3,
          stroke: am5.color(0xf7f4ec),
          strokeWidth: 1.5,
        });
      } else {
        poly.setAll({
          fill: riskFill,
          fillOpacity: 0.25,
          stroke: am5.color(0x8ba87a),
          strokeWidth: 0.5,
        });
      }
    });
  }

  const goToUSView = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    currentViewLevelRef.current = 'us';
    stateCountiesSeriesRef.current?.set('visible', false);
    usStatesSeriesRef.current?.set('visible', true);
    styleStatePolygons(null);
    // Rotation is the negative of the point to face: center on 38°N, 97°W.
    chart.animate({ key: 'rotationX', to: 97, duration: 1200, easing: am5.ease.inOut(am5.ease.cubic) });
    chart.animate({ key: 'rotationY', to: -38, duration: 1200, easing: am5.ease.inOut(am5.ease.cubic) });
    chart.zoomToGeoPoint({ latitude: 38, longitude: -97 }, 3, true, 1200);
  }, []);

  const goToStateView = useCallback(async (stateCode: string) => {
    const chart = chartRef.current;
    if (!chart) return;

    currentViewLevelRef.current = 'state';
    const stateId = STATE_CODE_TO_ID[stateCode];
    if (!stateId) return;

    const statesSeries = usStatesSeriesRef.current;
    const countySeries = stateCountiesSeriesRef.current;
    if (!statesSeries || !countySeries) return;

    const stateDataItem = statesSeries.getDataItemById(stateId);
    if (!stateDataItem) return;

    // Highlight the selected state, dim the others, and bring it into view
    // right away while the county data loads.
    countySeries.set('visible', false);
    statesSeries.set('visible', true);
    styleStatePolygons(stateId);
    statesSeries.zoomToDataItem(stateDataItem, true);

    try {
      const stateGeoData = await loadStateGeodata(stateCode);

      // The user may have picked a different state while this one was loading.
      if (selectedStateRef.current !== stateCode) return;

      const showCounties = () => {
        if (selectedStateRef.current !== stateCode) return;
        countySeries.set('visible', true);
        applyCountyRiskColors(countySeries);
        // The counties replace the state's own polygon; neighbours stay dimmed.
        stateDataItem.get('mapPolygon')?.set('visible', false);
        if (!selectedCountyRef.current) {
          countySeries.zoomToDataItems(countySeries.dataItems, true);
        }
      };

      if (countySeries.get('geoJSON' as any) === stateGeoData) {
        showCounties();
      } else {
        countySeries.events.once('geodataprocessed' as any, showCounties);
        countySeries.set('geoJSON' as any, stateGeoData);
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
      countySeries.zoomToDataItem(dataItem, true);
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
        countySeries.zoomToDataItems(countySeries.dataItems, true);
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
