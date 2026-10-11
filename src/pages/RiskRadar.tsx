import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Home,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  Database,
  MapPin,
} from 'lucide-react';
import RiskRadarMap, { type ViewLevel } from '@/components/RiskRadarMap';
import RiskLegend from '@/components/RiskLegend';
import SearchableSelect from '@/components/SearchableSelect';
import CountyDetailsPanel from '@/components/CountyDetailsPanel';
import { useSelection } from '@/context/SelectionContext';
import { CONTIGUOUS_STATES, STATE_CODE_TO_NAME, getStateByCode } from '@/data/states';
import { getCountyData, getCropOptions, getCropLabel } from '@/data/demoData';
import { loadStateGeodata } from '@/data/stateGeodata';
import type { CountyData } from '@/types';

export default function RiskRadar() {
  const selection = useSelection();
  const [viewLevel, setViewLevel] = useState<ViewLevel>('us');
  const [countyData, setCountyData] = useState<CountyData | null>(null);
  const [loadingCounty, setLoadingCounty] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);
  const [countyOptions, setCountyOptions] = useState<{ value: string; label: string }[]>([]);
  const [availableCounties, setAvailableCounties] = useState<Map<string, string>>(new Map());
  const navRef = useRef<HTMLDivElement>(null);
  const radarMapRef = useRef<HTMLDivElement>(null);

  // State options for dropdown
  const stateOptions = CONTIGUOUS_STATES.map((s) => ({
    value: s.code,
    label: s.name,
  }));

  const cropOptions = getCropOptions();

  // Load county list when state changes
  useEffect(() => {
    if (!selection.stateCode) {
      setCountyOptions([]);
      setAvailableCounties(new Map());
      return;
    }

    loadStateGeodata(selection.stateCode)
      .then((geo) => {
        const counties = new Map<string, string>();
        const opts: { value: string; label: string }[] = [];
        if (geo.features) {
          geo.features.forEach((f: any) => {
            const id = f.id || f.properties?.id;
            const name = f.properties?.name;
            if (id && name) {
              counties.set(id, name);
              opts.push({ value: id, label: `${name} County` });
            }
          });
        }
        opts.sort((a, b) => a.label.localeCompare(b.label));
        setCountyOptions(opts);
        setAvailableCounties(counties);
      })
      .catch((err) => {
        console.error('Failed to load county list:', err);
        setCountyOptions([]);
        setAvailableCounties(new Map());
      });
  }, [selection.stateCode]);

  // Update view level based on selections
  useEffect(() => {
    if (selection.countyFips) {
      setViewLevel('county');
    } else if (selection.stateCode) {
      setViewLevel('state');
    } else {
      setViewLevel('us');
    }
  }, [selection.stateCode, selection.countyFips]);

  // Load county data when county is selected
  useEffect(() => {
    if (!selection.countyFips || !selection.stateCode) {
      setCountyData(null);
      return;
    }

    const countyName = availableCounties.get(selection.countyFips) || selection.countyName || '';
    if (!countyName) {
      setCountyData(null);
      return;
    }

    setLoadingCounty(true);
    // Simulate data loading
    const timer = setTimeout(() => {
      const data = getCountyData(
        selection.countyFips!,
        countyName,
        selection.stateCode!,
        selection.crop
      );
      setCountyData(data);
      setLoadingCounty(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [selection.countyFips, selection.stateCode, selection.crop, availableCounties, selection.countyName]);

  // Handle state click from map
  const handleStateClick = useCallback(
    (stateCode: string, stateName: string) => {
      selection.setState(stateCode, stateName);
    },
    [selection]
  );

  // Handle county click from map
  const handleCountyClick = useCallback(
    (fips: string, countyName: string) => {
      selection.setCounty(fips, countyName);
    },
    [selection]
  );

  // Handle state dropdown selection
  const handleStateSelect = (code: string) => {
    const state = getStateByCode(code);
    if (state) {
      selection.setState(state.code, state.name);
    }
  };

  // Handle county dropdown selection
  const handleCountySelect = (fips: string) => {
    const name = availableCounties.get(fips) || '';
    selection.setCounty(fips, name);
  };

  // Back navigation
  const handleBack = useCallback(() => {
    if (selection.countyFips) {
      selection.clearCounty();
    } else if (selection.stateCode) {
      selection.clearState();
    }
  }, [selection]);

  // Reset to US view
  const handleReset = useCallback(() => {
    selection.clearState();
  }, [selection]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (selection.countyFips) {
          selection.clearCounty();
        } else if (selection.stateCode) {
          selection.clearState();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selection]);

  // Breadcrumb items
  const breadcrumbs: { label: string; onClick?: () => void }[] = [
    { label: 'Risk Radar' },
    {
      label: 'United States',
      onClick: selection.stateCode ? () => selection.clearState() : undefined,
    },
  ];
  if (selection.stateCode && selection.stateName) {
    breadcrumbs.push({
      label: selection.stateName,
      onClick: selection.countyFips ? () => selection.clearCounty() : undefined,
    });
  }
  if (selection.countyName) {
    breadcrumbs.push({ label: `${selection.countyName} County` });
  }

  // Back button label
  const backLabel = selection.countyFips
    ? `Back to ${selection.stateName}`
    : selection.stateCode
    ? 'Back to U.S. Map'
    : '';

  const callbacks = {
    onStateClick: handleStateClick,
    onCountyClick: handleCountyClick,
    onReady: () => setLoadingMap(false),
  };

  return (
    <div className="pt-16 h-screen flex flex-col bg-forest-950 overflow-hidden">
      {/* Top controls bar */}
      <div className="bg-forest-900 border-b border-forest-700/40 px-4 lg:px-6 py-3 flex flex-wrap items-center gap-3 z-20">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0 overflow-x-auto scrollbar-thin">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5 shrink-0">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-warmwhite/30" />}
              {crumb.onClick ? (
                <button
                  onClick={crumb.onClick}
                  className="text-warmwhite/60 hover:text-olive-300 transition-colors whitespace-nowrap"
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={`whitespace-nowrap ${
                    idx === breadcrumbs.length - 1 ? 'text-olive-300 font-medium' : 'text-warmwhite/40'
                  }`}
                >
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Selectors */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-40">
            <SearchableSelect
              options={stateOptions}
              value={selection.stateCode}
              placeholder="Select State"
              onChange={handleStateSelect}
            />
          </div>
          {selection.stateCode && (
            <div className="w-44">
              <SearchableSelect
                options={countyOptions}
                value={selection.countyFips}
                placeholder="Select County"
                onChange={handleCountySelect}
              />
            </div>
          )}
          <div className="w-32">
            <select
              value={selection.crop}
              onChange={(e) => selection.setCrop(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-forest-800 border border-forest-600 rounded-sm text-warmwhite text-sm outline-none hover:border-olive-400 transition-colors cursor-pointer"
            >
              {cropOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex relative overflow-hidden" ref={navRef}>
        {/* Map area */}
        <div className="flex-1 relative" ref={radarMapRef}>
          {/* Back button overlay */}
          {backLabel && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-forest-900/90 backdrop-blur-sm border border-forest-700/40 rounded-sm text-warmwhite hover:border-olive-400 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
          )}

          {/* Reset button overlay */}
          {viewLevel !== 'us' && (
            <button
              onClick={handleReset}
              className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-forest-900/90 backdrop-blur-sm border border-forest-700/40 rounded-sm text-warmwhite hover:border-olive-400 transition-colors text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              Reset to U.S.
            </button>
          )}

          {/* Loading overlay */}
          {loadingMap && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-forest-950">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-olive-400 animate-spin mx-auto mb-4" />
                <p className="text-warmwhite/60 text-sm">Initializing Risk Radar...</p>
              </div>
            </div>
          )}

          {/* The map */}
          <RiskRadarMap
            selectedState={selection.stateCode}
            selectedCounty={selection.countyFips}
            crop={selection.crop}
            callbacks={callbacks}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-forest-900/90 backdrop-blur-sm border border-forest-700/40 rounded-sm px-4 py-3">
            <p className="text-warmwhite/40 text-xs uppercase tracking-wider mb-2">
              Risk Level · {getCropLabel(selection.crop)}
            </p>
            <RiskLegend compact />
          </div>

          {/* Data status indicator */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-forest-900/90 backdrop-blur-sm border border-forest-700/40 rounded-sm px-3 py-2">
            <Database className="w-4 h-4 text-olive-400" />
            <span className="text-warmwhite/60 text-xs">Demonstration Data</span>
          </div>

          {/* Info hint when at US level */}
          {viewLevel === 'us' && !loadingMap && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 pointer-events-none">
              <div className="bg-forest-900/70 backdrop-blur-sm border border-olive-500/20 rounded-sm px-6 py-4 text-center">
                <MapPin className="w-6 h-6 text-olive-300 mx-auto mb-2" />
                <p className="text-warmwhite/70 text-sm">Click a state or use the dropdown to explore</p>
              </div>
            </div>
          )}
        </div>

        {/* County details panel */}
        {viewLevel === 'county' && (
          <div className="w-full md:w-[400px] lg:w-[440px] shrink-0 border-l border-forest-700/40 animate-slide-in-right">
            <CountyDetailsPanel
              county={countyData}
              loading={loadingCounty}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </div>
  );
}
