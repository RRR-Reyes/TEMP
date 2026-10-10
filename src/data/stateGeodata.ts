const stateGeodataModules = import.meta.glob('/node_modules/@amcharts/amcharts5-geodata/region/usa/*Low.js');

const stateGeodataCache: Record<string, any> = {};

export async function loadStateGeodata(stateCode: string): Promise<any> {
  const code = stateCode.toLowerCase();
  if (stateGeodataCache[code]) return stateGeodataCache[code];

  const key = `/node_modules/@amcharts/amcharts5-geodata/region/usa/${code}Low.js`;
  const loader = stateGeodataModules[key];
  if (!loader) {
    throw new Error(`No geodata found for state: ${stateCode}`);
  }
  const mod = await loader();
  const data = (mod as any).default || mod;
  stateGeodataCache[code] = data;
  return data;
}

export function getStateGeodataSync(stateCode: string): any | null {
  const code = stateCode.toLowerCase();
  return stateGeodataCache[code] || null;
}
