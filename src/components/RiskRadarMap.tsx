import { useEffect, useRef, useCallback } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import worldLow from '@amcharts/amcharts5-geodata/worldLow';
import usaLow from '@amcharts/amcharts5-geodata/usaLow';
import { CONTIGUOUS_STATES, STATE_CODE_TO_ID } from '@/data/states';
import { getCountyRiskLevel, getStateRiskLevel } from '@/data/demoData';
import { RISK_COLORS_FILL } from '@/data/theme';
import { loadStateGeodata } from '@/data/stateGeodata';
import type { CropType } from '@/types';

export type ViewLevel = 'us' | 'state' | 'county';

export interface RadarMapCallbacks {
  onStateClick: (stateCode: string, stateName: string) => void;
  onCountyClick: (fips: string, countyName: string) => void;
  onReady?: () => void;
}

interface RiskRadarMapProps {
  selectedState: string | null;
  selectedCounty: string | null;
  crop: CropType;
  callbacks: RadarMapCallbacks;
}

const CONTIGUOUS_STATE_IDS = CONTIGUOUS_STATES.map((s) => s.id);

// The point the U.S. view is centered on (38°N, 97°W) and its zoom level.
const US_CENTER = { latitude: 38, longitude: -97 };
const US_ZOOM = 3;

function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export default function RiskRadarMap({ selectedState, selectedCounty, crop, callbacks }: RiskRadarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5map.MapChart | null>(null);
  const usStatesSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const stateCountiesSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const currentViewLevelRef = useRef<ViewLevel>('us');

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const selectedStateRef = useRef(selectedState);
  selectedStateRef.current = selectedState;

  const selectedCountyRef = useRef(selectedCounty);
  selectedCountyRef.current = selectedCounty;

  const cropRef = useRef(crop);
  cropRef.current = crop;

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
        homeGeoPoint: US_CENTER,
        homeZoomLevel: US_ZOOM,
        // Start facing the U.S. (rotation is the negative of the point to face)
        rotationX: -US_CENTER.longitude,
        rotationY: -US_CENTER.latitude,
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

    // The county details panel slides in beside the map (and back out) and the
    // window can be resized, which leaves the view off-center. Re-center once
    // the size settles.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const countySeries = stateCountiesSeriesRef.current;
        const fips = selectedCountyRef.current;
        const level = currentViewLevelRef.current;
        if (level === 'us') {
          chart.zoomToGeoPoint(US_CENTER, US_ZOOM, true, 300, -US_CENTER.longitude, -US_CENTER.latitude);
        } else if (countySeries && level === 'county' && fips) {
          const dataItem = countySeries.getDataItemById(fips);
          if (dataItem) countySeries.zoomToDataItem(dataItem, true);
        } else if (countySeries && level === 'state' && countySeries.dataItems.length) {
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
      const riskLevel = getCountyRiskLevel(id, cropRef.current);
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
  function styleStatePolygons(selectedId: string | null, hideSelected = false) {
    const series = usStatesSeriesRef.current;
    if (!series) return;
    series.mapPolygons.each((poly) => {
      const polyId = poly.dataItem?.get('id' as any) as string;
      if (!polyId) return;
      const riskFill = am5.color(hexToNum(RISK_COLORS_FILL[getStateRiskLevel(polyId, cropRef.current)]));
      poly.set('visible', !(hideSelected && polyId === selectedId));
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
    chart.zoomToGeoPoint(US_CENTER, US_ZOOM, true, 1200, -US_CENTER.longitude, -US_CENTER.latitude);
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

  // Recolor the map when the selected crop changes
  useEffect(() => {
    if (!chartRef.current) return;
    const stateId = selectedStateRef.current ? STATE_CODE_TO_ID[selectedStateRef.current] : null;
    const countySeries = stateCountiesSeriesRef.current;
    styleStatePolygons(stateId ?? null, !!stateId && !!countySeries?.get('visible'));
    if (countySeries && stateId) applyCountyRiskColors(countySeries);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop]);

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
