export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'unavailable';

export type TrendDirection = 'increasing' | 'stable' | 'decreasing';

export type CropType = 'corn' | 'soybean' | 'wheat' | 'cotton' | 'tomato';

export interface EnvironmentalFactor {
  name: string;
  value: string;
  unit: string;
  period: string;
  relevance: string;
  contribution: 'increasing' | 'reducing' | 'neutral';
}

export interface ThreatInfo {
  id: string;
  name: string;
  type: 'pest' | 'disease';
  riskLevel: RiskLevel;
  riskIndex: number;
  trend: TrendDirection;
  predictionPeriod: string;
  environmentalFactors: string[];
  explanation: string;
  cropSpecific: boolean;
}

export interface CountyData {
  fips: string;
  countyName: string;
  stateCode: string;
  stateName: string;
  crop: CropType;
  overallRisk: RiskLevel;
  dataAvailable: boolean;
  lastUpdated: string;
  temperature: number;
  humidity: number;
  recentRainfall: number;
  expectedPrecipitation: number;
  droughtCondition: string;
  soilMoisture: number;
  threats: ThreatInfo[];
  environmentalFactors: EnvironmentalFactor[];
}

export interface ForecastDay {
  date: string;
  dayLabel: string;
  riskIndex: number;
  riskLevel: RiskLevel;
  isForecast: boolean;
  temperature: number;
  humidity: number;
  precipitation: number;
}

export interface ForecastData {
  county: CountyData;
  threat: ThreatInfo;
  sevenDayForecast: ForecastDay[];
  recommendations: string[];
  dataSources: DataSourceEntry[];
  isSimulated: boolean;
}

export interface DataSourceEntry {
  name: string;
  type: 'observed' | 'forecast' | 'model' | 'reference';
  timestamp: string;
  url?: string;
  description: string;
}

export interface SelectionState {
  stateCode: string | null;
  stateName: string | null;
  countyFips: string | null;
  countyName: string | null;
  crop: CropType;
  threatId: string | null;
}

export interface StateInfo {
  code: string;
  name: string;
  id: string;
}
