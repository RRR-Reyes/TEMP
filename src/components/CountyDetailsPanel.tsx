import { ArrowLeft, Thermometer, Droplets, CloudRain, Sun, Waves, TrendingUp, TrendingDown, Minus, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CountyData, ThreatInfo, RiskLevel } from '@/types';
import { RISK_COLORS_FILL, RISK_LABELS } from '@/data/theme';
import { getCropLabel } from '@/data/demoData';
import { useSelection } from '@/context/SelectionContext';

interface CountyDetailsPanelProps {
  county: CountyData | null;
  loading: boolean;
  onBack: () => void;
}

const TREND_ICONS = {
  increasing: TrendingUp,
  stable: Minus,
  decreasing: TrendingDown,
};

const TREND_COLORS = {
  increasing: '#e07a3c',
  stable: '#8ba87a',
  decreasing: '#4a7c3a',
};

export default function CountyDetailsPanel({ county, loading, onBack }: CountyDetailsPanelProps) {
  const navigate = useNavigate();
  const { setThreat } = useSelection();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-olive-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-warmwhite/60 text-sm">Loading county data...</p>
        </div>
      </div>
    );
  }

  if (!county) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-warmwhite/40 text-sm">Select a county to view details</p>
      </div>
    );
  }

  const handleViewForecast = (threat: ThreatInfo) => {
    setThreat(threat.id);
    navigate('/forecast');
  };

  return (
    <div className="h-full flex flex-col bg-forest-900/95 backdrop-blur-sm overflow-y-auto scrollbar-thin">
      {/* Header with back button */}
      <div className="sticky top-0 bg-forest-900/95 backdrop-blur-sm border-b border-forest-700/40 px-5 py-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-warmwhite/60 hover:text-warmwhite transition-colors text-sm mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {county.stateName}
        </button>
        <h2 className="font-display text-2xl font-semibold text-warmwhite">
          {county.countyName} County
        </h2>
        <p className="text-warmwhite/50 text-sm mt-1">{county.stateName}</p>
        <div className="flex items-center gap-3 mt-3">
          <span
            className="px-3 py-1 rounded-sm text-xs font-semibold text-warmwhite"
            style={{ backgroundColor: RISK_COLORS_FILL[county.overallRisk as RiskLevel] }}
          >
            {RISK_LABELS[county.overallRisk as RiskLevel]} Risk
          </span>
          <span className="text-warmwhite/40 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(county.lastUpdated).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 space-y-6">
        {/* Crop and data availability */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-warmwhite/40 text-xs uppercase tracking-wider mb-1">Crop</p>
            <p className="text-warmwhite text-sm font-medium">{getCropLabel(county.crop)}</p>
          </div>
          <div className="flex-1">
            <p className="text-warmwhite/40 text-xs uppercase tracking-wider mb-1">Data Status</p>
            <p className={`text-sm font-medium ${county.dataAvailable ? 'text-olive-300' : 'text-risk-unavailable'}`}>
              {county.dataAvailable ? 'Available' : 'Unavailable'}
            </p>
          </div>
        </div>

        {/* Environmental conditions */}
        <div>
          <h3 className="text-warmwhite font-semibold text-sm uppercase tracking-wider mb-3">
            Environmental Conditions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={Thermometer} label="Temperature" value={`${county.temperature}°F`} period="24hr avg" />
            <MetricCard icon={Droplets} label="Humidity" value={`${county.humidity}%`} period="24hr avg" />
            <MetricCard icon={CloudRain} label="Rainfall" value={`${county.recentRainfall}mm`} period="Past 7 days" />
            <MetricCard icon={Sun} label="Expected Precip" value={`${county.expectedPrecipitation}mm`} period="Next 7 days" />
            <MetricCard icon={Waves} label="Soil Moisture" value={`${county.soilMoisture}%`} period="Estimated" />
            <MetricCard icon={AlertCircle} label="Drought" value={county.droughtCondition} period="USDM" small />
          </div>
        </div>

        {/* Pest and disease predictions */}
        <div>
          <h3 className="text-warmwhite font-semibold text-sm uppercase tracking-wider mb-3">
            Pest & Disease Predictions
          </h3>
          <div className="space-y-3">
            {county.threats
              .sort((a, b) => b.riskIndex - a.riskIndex)
              .map((threat) => {
                const TrendIcon = TREND_ICONS[threat.trend];
                return (
                  <div
                    key={threat.id}
                    className="bg-forest-800/60 border border-forest-700/40 rounded-sm p-4 hover:border-olive-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-warmwhite font-medium text-sm">{threat.name}</p>
                        <p className="text-warmwhite/40 text-xs mt-0.5">
                          {threat.type === 'disease' ? 'Disease' : 'Pest'} · {threat.predictionPeriod}
                        </p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-sm text-xs font-semibold text-warmwhite shrink-0"
                        style={{ backgroundColor: RISK_COLORS_FILL[threat.riskLevel] }}
                      >
                        {RISK_LABELS[threat.riskLevel]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-1.5 bg-forest-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${threat.riskIndex}%`,
                            backgroundColor: RISK_COLORS_FILL[threat.riskLevel],
                          }}
                        />
                      </div>
                      <span className="text-warmwhite/60 text-xs font-mono">Index: {threat.riskIndex}</span>
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: TREND_COLORS[threat.trend] }}
                      >
                        <TrendIcon className="w-3 h-3" />
                        {threat.trend}
                      </span>
                    </div>

                    <p className="text-warmwhite/50 text-xs leading-relaxed mb-3">
                      {threat.explanation}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {threat.environmentalFactors.map((factor) => (
                        <span
                          key={factor}
                          className="px-2 py-0.5 bg-forest-700/50 text-warmwhite/50 text-xs rounded-sm"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleViewForecast(threat)}
                      className="flex items-center gap-1 text-olive-300 hover:text-olive-200 text-xs font-medium transition-colors"
                    >
                      View Forecast
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-forest-800/40 border border-forest-700/30 rounded-sm p-3">
          <p className="text-warmwhite/40 text-xs leading-relaxed">
            Risk indicators reflect environmental conditions that may favor pest or disease development.
            They do not confirm actual presence. Always verify through field scouting.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  period,
  small,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  period: string;
  small?: boolean;
}) {
  return (
    <div className="bg-forest-800/50 border border-forest-700/30 rounded-sm p-3">
      <div className="flex items-center gap-1.5 text-warmwhite/40 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-warmwhite font-medium ${small ? 'text-xs' : 'text-sm'}`}>{value}</p>
      <p className="text-warmwhite/30 text-xs mt-0.5">{period}</p>
    </div>
  );
}
