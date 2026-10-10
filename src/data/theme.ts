import type { RiskLevel } from '@/types';

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#4a7c3a',
  moderate: '#d4a72c',
  elevated: '#e07a3c',
  high: '#c0392b',
  unavailable: '#8a8a8a',
};

export const RISK_COLORS_FILL: Record<RiskLevel, string> = {
  low: '#4a7c3a',
  moderate: '#d4a72c',
  elevated: '#e07a3c',
  high: '#c0392b',
  unavailable: '#6b6b6b',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  elevated: 'Elevated',
  high: 'High',
  unavailable: 'Unavailable',
};

export const RISK_ORDER: RiskLevel[] = ['low', 'moderate', 'elevated', 'high', 'unavailable'];

export const BRAND_COLORS = {
  forestGreen: '#1b3a2b',
  deepForest: '#0f2818',
  mutedOlive: '#5c6b3f',
  warmWhite: '#f7f4ec',
  charcoal: '#2a2a2a',
  earthTan: '#a8916b',
  sageGreen: '#8ba87a',
  accentGreen: '#3d6b30',
  lightSage: '#c8d5b9',
};

export const IMAGES = {
  heroField: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&cs=tinysrgb&w=1920',
  aerialFields: 'https://images.pexels.com/photos/11782286/pexels-photo-11782286.jpeg?auto=compress&cs=tinysrgb&w=1920',
  rollingFields: 'https://images.pexels.com/photos/38744987/pexels-photo-38744987.jpeg?auto=compress&cs=tinysrgb&w=1920',
  wheatSunset: 'https://images.pexels.com/photos/11987205/pexels-photo-11987205.jpeg?auto=compress&cs=tinysrgb&w=1920',
  cornRows: 'https://images.pexels.com/photos/27147660/pexels-photo-27147660.jpeg?auto=compress&cs=tinysrgb&w=1920',
  stormField: 'https://images.pexels.com/photos/15048526/pexels-photo-15048526.jpeg?auto=compress&cs=tinysrgb&w=1920',
  farmerInspect: 'https://images.pexels.com/photos/16678079/pexels-photo-16678079.jpeg?auto=compress&cs=tinysrgb&w=1920',
  patchworkFields: 'https://images.pexels.com/photos/34732063/pexels-photo-34732063.jpeg?auto=compress&cs=tinysrgb&w=1920',
  vineyardRows: 'https://images.pexels.com/photos/2673552/pexels-photo-2673552.jpeg?auto=compress&cs=tinysrgb&w=1920',
  greenFields: 'https://images.pexels.com/photos/6713245/pexels-photo-6713245.jpeg?auto=compress&cs=tinysrgb&w=1920',
  soybeanField: 'https://images.pexels.com/photos/18979035/pexels-photo-18979035.jpeg?auto=compress&cs=tinysrgb&w=1920',
  grapeDisease: 'https://images.pexels.com/photos/30557521/pexels-photo-30557521.jpeg?auto=compress&cs=tinysrgb&w=1920',
};

export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS_FILL[level] || RISK_COLORS_FILL.unavailable;
}

export function getRiskLabel(level: RiskLevel): string {
  return RISK_LABELS[level] || 'Unavailable';
}
