import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  ShieldAlert,
  Database,
  Eye,
  Crosshair,
  Leaf,
} from 'lucide-react';
import { useSelection } from '@/context/SelectionContext';
import { getCountyData, getForecastData, getCropLabel } from '@/data/demoData';
import { RISK_COLORS_FILL, RISK_LABELS } from '@/data/theme';
import ForecastChart from '@/components/ForecastChart';
import type { TrendDirection, EnvironmentalFactor } from '@/types';

export default function Forecast() {
  const selection = useSelection();
  const navigate = useNavigate();

  const { county, threat, forecast } = useMemo(() => {
    if (!selection.stateCode || !selection.countyFips || !selection.countyName) {
      return { county: null, threat: null, forecast: null };
    }

    const countyData = getCountyData(
      selection.countyFips,
      selection.countyName,
      selection.stateCode,
      selection.crop
    );

    const threatId = selection.threatId;
    const threatData = threatId
      ? countyData.threats.find((t) => t.id === threatId)
      : countyData.threats[0];

    if (!threatData) {
      return { county: countyData, threat: null, forecast: null };
    }

    const forecastData = getForecastData(countyData, threatData);
    return { county: countyData, threat: threatData, forecast: forecastData };
  }, [selection.stateCode, selection.countyFips, selection.countyName, selection.crop, selection.threatId]);

  if (!county || !threat || !forecast) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-warmwhite">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crosshair className="w-8 h-8 text-olive-600" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-forest-900 mb-4">
            No Location Selected
          </h1>
          <p className="text-charcoal/60 leading-relaxed mb-8">
            To view a forecast, first select a county and a specific pest or disease threat on the
            Risk Radar.
          </p>
          <Link
            to="/radar"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-olive-500 hover:bg-olive-400 text-warmwhite font-semibold rounded-sm transition-colors"
          >
            Go to Risk Radar
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  const trendIcon = {
    increasing: TrendingUp,
    stable: Minus,
    decreasing: TrendingDown,
  };
  const trendColor: Record<TrendDirection, string> = {
    increasing: '#e07a3c',
    stable: '#8ba87a',
    decreasing: '#4a7c3a',
  };

  const TrendIcon = trendIcon[threat.trend];

  return (
    <div className="pt-16 min-h-screen bg-warmwhite">
      {/* Header */}
      <section className="bg-forest-900 text-warmwhite py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <button
            onClick={() => navigate('/radar')}
            className="flex items-center gap-2 text-warmwhite/60 hover:text-warmwhite transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Risk Radar
          </button>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-olive-300 text-sm font-medium uppercase tracking-[0.15em] mb-3">
                Forecast & Recommendations
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">
                {threat.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-warmwhite/60 text-sm">
                <span>{county.countyName} County, {county.stateName}</span>
                <span className="text-warmwhite/30">·</span>
                <span>Crop: {getCropLabel(county.crop)}</span>
                <span className="text-warmwhite/30">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(county.lastUpdated).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-warmwhite/40 text-xs uppercase tracking-wider">Current Risk</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="px-3 py-1 rounded-sm text-sm font-semibold"
                    style={{ backgroundColor: RISK_COLORS_FILL[threat.riskLevel] }}
                  >
                    {RISK_LABELS[threat.riskLevel]}
                  </span>
                  <span
                    className="flex items-center gap-1 text-sm"
                    style={{ color: trendColor[threat.trend] }}
                  >
                    <TrendIcon className="w-4 h-4" />
                    {threat.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Day Forecast Chart */}
      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-semibold text-forest-900 mb-2">
            7-Day Risk Forecast
          </h2>
          <p className="text-charcoal/60 text-sm leading-relaxed max-w-2xl">
            Estimated {threat.name} risk index for {county.countyName} County over the next seven days.
            The first two days are based on observed conditions; the remaining days use weather forecasts.
          </p>
        </div>

        <div className="bg-white border border-forest-100 rounded-sm p-6 shadow-sm">
          <ForecastChart data={forecast.sevenDayForecast} height="400px" />

          <div className="mt-6 pt-6 border-t border-forest-50 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-charcoal/40 text-xs uppercase tracking-wider mb-1">Scale</p>
              <p className="text-forest-900 text-sm font-medium">Risk Index (0-100)</p>
            </div>
            <div>
              <p className="text-charcoal/40 text-xs uppercase tracking-wider mb-1">Current Index</p>
              <p className="text-forest-900 text-sm font-medium">{threat.riskIndex}</p>
            </div>
            <div>
              <p className="text-charcoal/40 text-xs uppercase tracking-wider mb-1">Trend</p>
              <p className="text-sm font-medium" style={{ color: trendColor[threat.trend] }}>
                {threat.trend.charAt(0).toUpperCase() + threat.trend.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-charcoal/40 text-xs uppercase tracking-wider mb-1">Prediction Period</p>
              <p className="text-forest-900 text-sm font-medium">{threat.predictionPeriod}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-earth-50 border border-earth-100 rounded-sm">
            <p className="text-charcoal/60 text-xs leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-earth-500 shrink-0 mt-0.5" />
              The Risk Index reflects environmental suitability for {threat.name} — not confirmed
              disease or pest presence. Forecast accuracy decreases with time; days 5-7 should be
              treated as preliminary indicators only. {forecast.isSimulated && 'This data is simulated for demonstration purposes.'}
            </p>
          </div>
        </div>
      </section>

      {/* Environmental Factors */}
      <section className="py-16 bg-forest-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-forest-900 mb-2">
            Environmental Factors
          </h2>
          <p className="text-charcoal/60 text-sm leading-relaxed mb-8 max-w-2xl">
            These environmental measurements influence the estimated risk for {threat.name}. Factors
            marked as "increasing" contribute to higher risk; "reducing" factors help lower it.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {county.environmentalFactors.map((factor: EnvironmentalFactor) => (
              <div key={factor.name} className="bg-white border border-forest-100 rounded-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-forest-900 font-semibold text-base">{factor.name}</h3>
                    <p className="text-charcoal/40 text-xs mt-1">{factor.period}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-sm text-xs font-medium ${
                      factor.contribution === 'increasing'
                        ? 'bg-risk-elevated/15 text-risk-elevated'
                        : factor.contribution === 'reducing'
                        ? 'bg-risk-low/15 text-risk-low'
                        : 'bg-forest-100 text-forest-600'
                    }`}
                  >
                    {factor.contribution === 'increasing'
                      ? '↑ Increasing Risk'
                      : factor.contribution === 'reducing'
                      ? '↓ Reducing Risk'
                      : '— Neutral'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-display font-semibold text-forest-900">
                    {factor.value}
                  </span>
                  {factor.unit && <span className="text-charcoal/40 text-sm">{factor.unit}</span>}
                </div>
                <p className="text-charcoal/60 text-sm leading-relaxed">{factor.relevance}</p>
              </div>
            ))}
          </div>

          {/* Risk explanation */}
          <div className="mt-8 p-6 bg-white border-l-4 border-olive-500 rounded-sm">
            <h3 className="text-forest-900 font-semibold mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-olive-600" />
              Why is this threat {RISK_LABELS[threat.riskLevel].toLowerCase()} risk?
            </h3>
            <p className="text-charcoal/70 leading-relaxed text-sm">{threat.explanation}</p>
            <p className="text-charcoal/50 text-xs mt-3 italic">
              Environmental suitability does not confirm the presence of {threat.name}. Verify through
              direct field scouting.
            </p>
          </div>
        </div>
      </section>

      {/* Recommended Actions */}
      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-forest-900 mb-2">
          Recommended Actions
        </h2>
        <p className="text-charcoal/60 text-sm leading-relaxed mb-8 max-w-2xl">
          Prioritized guidance for {getCropLabel(county.crop)} growers in {county.countyName} County
          regarding {threat.name}.
        </p>

        <div className="space-y-3">
          {forecast.recommendations.map((rec, idx) => {
            const icons = [Eye, Crosshair, Leaf, TrendingUp, ShieldAlert];
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="flex items-start gap-4 bg-white border border-forest-100 rounded-sm p-5 hover:border-olive-300 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-olive-50 rounded-sm shrink-0">
                  <Icon className="w-5 h-5 text-olive-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-olive-600 text-xs font-bold uppercase tracking-wider">
                      Priority {idx + 1}
                    </span>
                  </div>
                  <p className="text-charcoal/80 text-sm leading-relaxed">{rec}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-earth-50 border border-earth-100 rounded-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-earth-600 shrink-0 mt-0.5" />
          <p className="text-charcoal/60 text-xs leading-relaxed">
            Recommendations are based on environmental conditions and general agricultural guidance
            for {threat.name}. They do not constitute a treatment prescription. Always consult a
            licensed agricultural extension agent or crop advisor before applying any management
            strategy.
          </p>
        </div>
      </section>

      {/* Data Sources and Limitations */}
      <section className="py-16 bg-forest-900 text-warmwhite">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold mb-2">Data Sources & Limitations</h2>
          <p className="text-warmwhite/50 text-sm leading-relaxed mb-8 max-w-2xl">
            Understanding where data comes from and what it can and cannot tell you is essential for
            making informed decisions.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {forecast.dataSources.map((source, idx) => (
              <div key={idx} className="bg-forest-800/60 border border-forest-700/40 rounded-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-olive-400" />
                    <h3 className="text-warmwhite font-medium text-sm">{source.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-sm ${
                      source.type === 'observed'
                        ? 'bg-olive-500/20 text-olive-300'
                        : source.type === 'forecast'
                        ? 'bg-earth-500/20 text-earth-300'
                        : source.type === 'model'
                        ? 'bg-risk-elevated/20 text-risk-elevated'
                        : 'bg-forest-600/20 text-warmwhite/60'
                    }`}
                  >
                    {source.type}
                  </span>
                </div>
                <p className="text-warmwhite/50 text-xs leading-relaxed mb-2">{source.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-warmwhite/30 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(source.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-olive-300 hover:text-olive-200 text-xs flex items-center gap-1 transition-colors"
                    >
                      Visit Source
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Limitations */}
          <div className="space-y-4">
            <div className="bg-forest-800/40 border border-forest-700/30 rounded-sm p-5">
              <h3 className="text-warmwhite font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-olive-400" />
                What this model can tell you
              </h3>
              <ul className="space-y-2 text-warmwhite/50 text-xs leading-relaxed">
                <li className="flex items-start gap-2"><span className="text-olive-400 mt-0.5">•</span>Environmental conditions that may favor {threat.name} development</li>
                <li className="flex items-start gap-2"><span className="text-olive-400 mt-0.5">•</span>Estimated risk trends based on forecasted weather patterns</li>
                <li className="flex items-start gap-2"><span className="text-olive-400 mt-0.5">•</span>When to increase monitoring and scouting frequency</li>
              </ul>
            </div>
            <div className="bg-forest-800/40 border border-forest-700/30 rounded-sm p-5">
              <h3 className="text-warmwhite font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-risk-elevated" />
                What this model cannot determine
              </h3>
              <ul className="space-y-2 text-warmwhite/50 text-xs leading-relaxed">
                <li className="flex items-start gap-2"><span className="text-risk-elevated mt-0.5">•</span>Whether {threat.name} is actually present in your fields</li>
                <li className="flex items-start gap-2"><span className="text-risk-elevated mt-0.5">•</span>Exact infection timing or severity at the field level</li>
                <li className="flex items-start gap-2"><span className="text-risk-elevated mt-0.5">•</span>Local microclimate effects that may differ from county-level data</li>
                <li className="flex items-start gap-2"><span className="text-risk-elevated mt-0.5">•</span>Appropriate treatment — consult a licensed professional</li>
              </ul>
            </div>
          </div>

          {forecast.isSimulated && (
            <div className="mt-6 p-4 bg-risk-elevated/10 border border-risk-elevated/30 rounded-sm flex items-start gap-3">
              <Info className="w-5 h-5 text-risk-elevated shrink-0 mt-0.5" />
              <p className="text-warmwhite/70 text-xs leading-relaxed">
                The data shown on this page is simulated demonstration data. It is not based on live
                weather feeds or a validated predictive model. Do not use this information for
                operational agricultural decisions.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
