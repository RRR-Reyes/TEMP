import type {
  CountyData,
  ThreatInfo,
  EnvironmentalFactor,
  ForecastDay,
  ForecastData,
  DataSourceEntry,
  RiskLevel,
  CropType,
  TrendDirection,
} from '@/types';
import { STATE_CODE_TO_NAME } from '@/data/states';

const THREAT_TEMPLATES: Omit<ThreatInfo, 'riskLevel' | 'riskIndex' | 'trend'>[] = [
  {
    id: 'gray-leaf-spot',
    name: 'Gray Leaf Spot',
    type: 'disease',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Relative humidity', 'Leaf wetness'],
    explanation:
      'Warm temperatures (75-85°F) combined with prolonged leaf wetness and high humidity create favorable conditions for gray leaf spot development. Monitor corn fields for rectangular gray lesions on leaves.',
    cropSpecific: true,
  },
  {
    id: 'northern-corn-leaf-blight',
    name: 'Northern Corn Leaf Blight',
    type: 'disease',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Relative humidity', 'Recent rainfall'],
    explanation:
      'Moderate temperatures (65-80°F) with high humidity and frequent rainfall favor northern corn leaf blight. Watch for cigar-shaped lesions on lower leaves and monitor fields with a history of the disease.',
    cropSpecific: true,
  },
  {
    id: 'corn-earworm',
    name: 'Corn Earworm',
    type: 'pest',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Recent rainfall', 'Wind patterns'],
    explanation:
      'Warm conditions accelerate corn earworm development and moth activity. Recent rainfall may reduce larval survival but does not eliminate risk. Monitor silk-stage corn for larval feeding damage.',
    cropSpecific: true,
  },
  {
    id: 'soybean-rust',
    name: 'Soybean Rust',
    type: 'disease',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Relative humidity', 'Leaf wetness'],
    explanation:
      'Soybean rust thrives in moderate temperatures (60-80°F) with extended periods of high humidity and leaf wetness. Spores can spread via wind from southern regions. Scout for tan or brown pustules on leaves.',
    cropSpecific: true,
  },
  {
    id: 'aphid-infestation',
    name: 'Soybean Aphid',
    type: 'pest',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Wind patterns', 'Drought stress'],
    explanation:
      'Moderate temperatures (72-82°F) favor soybean aphid reproduction. Drought stress can exacerbate plant damage. Check undersides of leaves for small yellow-green aphids, especially in late vegetative to reproductive stages.',
    cropSpecific: true,
  },
  {
    id: 'fusarium-head-blight',
    name: 'Fusarium Head Blight (Scab)',
    type: 'disease',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Relative humidity', 'Recent rainfall'],
    explanation:
      'Warm, humid weather during flowering favors Fusarium head blight in wheat. Rainfall events during anthesis significantly increase risk. Monitor for prematurely bleached spikelets and pink fungal growth on heads.',
    cropSpecific: true,
  },
  {
    id: 'wheat-streak-mosaic',
    name: 'Wheat Streak Mosaic Virus',
    type: 'disease',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Wind patterns'],
    explanation:
      'Warm temperatures favor wheat curl mite activity, which transmits wheat streak mosaic virus. Volunteer wheat and grassy weeds serve as reservoirs. Look for yellow streaking and mottling on leaves.',
    cropSpecific: true,
  },
  {
    id: 'bacterial-spot',
    name: 'Bacterial Spot of Tomato',
    type: 'disease',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Relative humidity', 'Recent rainfall'],
    explanation:
      'Warm, wet conditions with splashing rain promote bacterial spot spread in tomatoes. Water-soaked lesions on leaves and fruit are early indicators. Avoid overhead irrigation during high-risk periods.',
    cropSpecific: true,
  },
  {
    id: 'early-blight',
    name: 'Early Blight',
    type: 'disease',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Relative humidity', 'Leaf wetness'],
    explanation:
      'Moderate temperatures (75-85°F) with high humidity and dew favor early blight in tomatoes. Look for dark concentric-ringed lesions on older leaves. Remove infected plant debris to reduce inoculum.',
    cropSpecific: true,
  },
  {
    id: 'cotton-bollworm',
    name: 'Cotton Bollworm',
    type: 'pest',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Recent rainfall', 'Wind patterns'],
    explanation:
      'Warm conditions support bollworm moth flight and egg-laying on cotton. Larvae feed on squares and bolls. Monitor with pheromone traps and inspect terminals and blooms for eggs and small larvae.',
    cropSpecific: true,
  },
  {
    id: 'bacterial-blight',
    name: 'Bacterial Blight of Cotton',
    type: 'disease',
    predictionPeriod: '7-day forecast',
    environmentalFactors: ['Temperature', 'Relative humidity', 'Recent rainfall'],
    explanation:
      'Rain and wind-driven rain spread bacterial blight in cotton. Warm, humid conditions with intermittent rain favor infection. Look for angular leaf spots and water-soaked lesions on leaves and bolls.',
    cropSpecific: true,
  },
];

const CROP_THREAT_MAP: Record<CropType, string[]> = {
  corn: ['gray-leaf-spot', 'northern-corn-leaf-blight', 'corn-earworm'],
  soybean: ['soybean-rust', 'aphid-infestation'],
  wheat: ['fusarium-head-blight', 'wheat-streak-mosaic'],
  cotton: ['cotton-bollworm', 'bacterial-blight'],
  tomato: ['bacterial-spot', 'early-blight'],
};

const CROP_LABELS: Record<CropType, string> = {
  corn: 'Corn',
  soybean: 'Soybean',
  wheat: 'Wheat',
  cotton: 'Cotton',
  tomato: 'Tomato',
};

export function getCropLabel(crop: CropType): string {
  return CROP_LABELS[crop] || crop;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function riskLevelFromIndex(index: number): RiskLevel {
  if (index < 25) return 'low';
  if (index < 50) return 'moderate';
  if (index < 75) return 'elevated';
  return 'high';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickTrend(rng: () => number): TrendDirection {
  const r = rng();
  if (r < 0.33) return 'increasing';
  if (r < 0.67) return 'stable';
  return 'decreasing';
}

const countyRiskCache = new Map<string, RiskLevel>();

/**
 * Overall risk for a county and crop. Uses the same generator as the county
 * details panel, so the map color always matches the risk shown in the panel.
 */
export function getCountyRiskLevel(fips: string, crop: CropType = 'corn'): RiskLevel {
  const key = `${fips}-${crop}`;
  let level = countyRiskCache.get(key);
  if (!level) {
    level = getCountyData(fips, '', '', crop).overallRisk;
    countyRiskCache.set(key, level);
  }
  return level;
}

/**
 * Overall risk shown for a whole state and crop. This is simulated (there is
 * no real data source yet): a stable value per state and crop.
 */
export function getStateRiskLevel(stateId: string, crop: CropType = 'corn'): RiskLevel {
  const rng = seededRandom(hashString(`${stateId}-${crop}-state`));
  return riskLevelFromIndex(Math.floor(rng() * 100));
}

export function getCountyData(
  fips: string,
  countyName: string,
  stateCode: string,
  crop: CropType = 'corn'
): CountyData {
  const seed = hashString(`${fips}-${crop}`);
  const rng = seededRandom(seed);

  const temperature = Math.round((60 + rng() * 35) * 10) / 10;
  const humidity = Math.round((40 + rng() * 50) * 10) / 10;
  const recentRainfall = Math.round(rng() * 50 * 10) / 10;
  const expectedPrecipitation = Math.round(rng() * 30 * 10) / 10;
  const soilMoisture = Math.round((15 + rng() * 40) * 10) / 10;

  const droughtConditions = ['None', 'Abnormally Dry', 'Moderate Drought', 'Severe Drought'][
    Math.floor(rng() * 4)
  ];

  const dataAvailable = rng() > 0.08;
  const overallRiskIndex = Math.floor(rng() * 100);
  const overallRisk = dataAvailable ? riskLevelFromIndex(overallRiskIndex) : 'unavailable';

  const threatIds = CROP_THREAT_MAP[crop] || CROP_THREAT_MAP.corn;
  const threats: ThreatInfo[] = threatIds.map((tid) => {
    const template = THREAT_TEMPLATES.find((t) => t.id === tid)!;
    const threatSeed = hashString(`${fips}-${tid}`);
    const threatRng = seededRandom(threatSeed);
    const riskIndex = Math.floor(threatRng() * 100);
    return {
      ...template,
      riskLevel: riskLevelFromIndex(riskIndex),
      riskIndex,
      trend: pickTrend(threatRng),
    };
  });

  const environmentalFactors: EnvironmentalFactor[] = [
    {
      name: 'Temperature',
      value: `${temperature}`,
      unit: '°F',
      period: 'Current (24-hour average)',
      relevance: 'Influences pathogen growth rate and pest development cycles.',
      contribution: temperature > 80 ? 'increasing' : temperature < 60 ? 'reducing' : 'neutral',
    },
    {
      name: 'Relative Humidity',
      value: `${humidity}`,
      unit: '%',
      period: 'Current (24-hour average)',
      relevance: 'High humidity promotes fungal spore germination and disease development.',
      contribution: humidity > 75 ? 'increasing' : humidity < 50 ? 'reducing' : 'neutral',
    },
    {
      name: 'Recent Rainfall',
      value: `${recentRainfall}`,
      unit: 'mm (7-day total)',
      period: 'Past 7 days',
      relevance: 'Rainfall creates leaf wetness periods essential for many fungal pathogens.',
      contribution: recentRainfall > 25 ? 'increasing' : recentRainfall < 5 ? 'reducing' : 'neutral',
    },
    {
      name: 'Expected Precipitation',
      value: `${expectedPrecipitation}`,
      unit: 'mm (7-day forecast)',
      period: 'Next 7 days',
      relevance: 'Forecasted rain may extend leaf wetness periods and increase disease pressure.',
      contribution:
        expectedPrecipitation > 15 ? 'increasing' : expectedPrecipitation < 3 ? 'reducing' : 'neutral',
    },
    {
      name: 'Drought Conditions',
      value: droughtConditions,
      unit: '',
      period: 'Current (U.S. Drought Monitor)',
      relevance: 'Drought stress weakens plants and can alter pest pressure dynamics.',
      contribution:
        droughtConditions === 'None' ? 'neutral' : droughtConditions === 'Abnormally Dry' ? 'neutral' : 'increasing',
    },
    {
      name: 'Soil Moisture',
      value: `${soilMoisture}`,
      unit: '% volumetric water content',
      period: 'Current (estimated)',
      relevance: 'Soil moisture affects plant vigor and susceptibility to certain pathogens.',
      contribution: soilMoisture > 35 ? 'increasing' : soilMoisture < 20 ? 'reducing' : 'neutral',
    },
  ];

  return {
    fips,
    countyName,
    stateCode,
    stateName: STATE_CODE_TO_NAME[stateCode] || stateCode,
    crop,
    overallRisk,
    dataAvailable,
    lastUpdated: new Date().toISOString(),
    temperature,
    humidity,
    recentRainfall,
    expectedPrecipitation,
    droughtCondition: droughtConditions,
    soilMoisture,
    threats,
    environmentalFactors,
  };
}

export function getForecastData(
  county: CountyData,
  threat: ThreatInfo
): ForecastData {
  const seed = hashString(`${county.fips}-${threat.id}-forecast`);
  const rng = seededRandom(seed);

  const days: ForecastDay[] = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let baseRisk = threat.riskIndex;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const isForecast = i > 1;

    const variance = (rng() - 0.5) * 20;
    const riskIndex = Math.max(0, Math.min(100, Math.round(baseRisk + variance)));
    baseRisk = riskIndex;

    const tempBase = county.temperature + (rng() - 0.5) * 8;
    const humidBase = county.humidity + (rng() - 0.5) * 15;
    const precipBase = i <= 1 ? county.recentRainfall / 7 : county.expectedPrecipitation / 7;

    days.push({
      date: date.toISOString().split('T')[0],
      dayLabel: dayNames[date.getDay()],
      riskIndex,
      riskLevel: riskLevelFromIndex(riskIndex),
      isForecast,
      temperature: Math.round(tempBase * 10) / 10,
      humidity: Math.round(humidBase * 10) / 10,
      precipitation: Math.round(precipBase * 10) / 10,
    });
  }

  const cropLabel = getCropLabel(county.crop);
  const recommendations = [
    `Monitor susceptible ${cropLabel.toLowerCase()} fields during the forecast period, especially in low-lying areas where humidity lingers.`,
    'Scout for recognized early symptoms at least twice per week during elevated risk periods.',
    'Review local agricultural extension guidance for current treatment thresholds and management strategies.',
    'Increase observation frequency if forecasted rainfall materializes, as leaf wetness periods may extend.',
    'Consult a licensed agricultural specialist or extension agent if symptoms are confirmed in the field.',
  ];

  const dataSources: DataSourceEntry[] = [
    {
      name: 'NOAA National Weather Service',
      type: 'observed',
      timestamp: new Date().toISOString(),
      url: 'https://www.weather.gov/',
      description: 'Current temperature, humidity, and precipitation observations from nearby weather stations.',
    },
    {
      name: 'NOAA Weather Forecast',
      type: 'forecast',
      timestamp: new Date().toISOString(),
      url: 'https://forecast.weather.gov/',
      description: '7-day precipitation and temperature forecasts used to project future environmental conditions.',
    },
    {
      name: 'U.S. Drought Monitor',
      type: 'observed',
      timestamp: new Date().toISOString(),
      url: 'https://droughtmonitor.unl.edu/',
      description: 'Weekly drought condition assessment used to evaluate plant stress and disease susceptibility.',
    },
    {
      name: 'CropWatch Risk Model (Demonstration)',
      type: 'model',
      timestamp: new Date().toISOString(),
      description:
        'Environmental suitability model that combines weather data with known disease and pest environmental requirements. This is a demonstration model, not a validated predictive system.',
    },
  ];

  return {
    county,
    threat,
    sevenDayForecast: days,
    recommendations,
    dataSources,
    isSimulated: true,
  };
}

export function getCropOptions(): { value: CropType; label: string }[] {
  return (Object.keys(CROP_LABELS) as CropType[]).map((k) => ({
    value: k,
    label: CROP_LABELS[k],
  }));
}

export { CROP_LABELS };
