import { RISK_COLORS_FILL, RISK_LABELS, RISK_ORDER } from '@/data/theme';

interface RiskLegendProps {
  compact?: boolean;
}

export default function RiskLegend({ compact = false }: RiskLegendProps) {
  return (
    <div className={`flex ${compact ? 'gap-3' : 'gap-4'} flex-wrap items-center`}>
      {RISK_ORDER.map((level) => (
        <div key={level} className="flex items-center gap-2">
          <span
            className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} rounded-sm`}
            style={{ backgroundColor: RISK_COLORS_FILL[level] }}
          />
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-warmwhite/80`}>
            {RISK_LABELS[level]}
          </span>
        </div>
      ))}
    </div>
  );
}
