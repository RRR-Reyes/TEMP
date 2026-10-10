import type { StateInfo } from '@/types';

export const CONTIGUOUS_STATES: StateInfo[] = [
  { code: 'AL', name: 'Alabama', id: 'US-AL' },
  { code: 'AZ', name: 'Arizona', id: 'US-AZ' },
  { code: 'AR', name: 'Arkansas', id: 'US-AR' },
  { code: 'CA', name: 'California', id: 'US-CA' },
  { code: 'CO', name: 'Colorado', id: 'US-CO' },
  { code: 'CT', name: 'Connecticut', id: 'US-CT' },
  { code: 'DE', name: 'Delaware', id: 'US-DE' },
  { code: 'DC', name: 'District of Columbia', id: 'US-DC' },
  { code: 'FL', name: 'Florida', id: 'US-FL' },
  { code: 'GA', name: 'Georgia', id: 'US-GA' },
  { code: 'ID', name: 'Idaho', id: 'US-ID' },
  { code: 'IL', name: 'Illinois', id: 'US-IL' },
  { code: 'IN', name: 'Indiana', id: 'US-IN' },
  { code: 'IA', name: 'Iowa', id: 'US-IA' },
  { code: 'KS', name: 'Kansas', id: 'US-KS' },
  { code: 'KY', name: 'Kentucky', id: 'US-KY' },
  { code: 'LA', name: 'Louisiana', id: 'US-LA' },
  { code: 'ME', name: 'Maine', id: 'US-ME' },
  { code: 'MD', name: 'Maryland', id: 'US-MD' },
  { code: 'MA', name: 'Massachusetts', id: 'US-MA' },
  { code: 'MI', name: 'Michigan', id: 'US-MI' },
  { code: 'MN', name: 'Minnesota', id: 'US-MN' },
  { code: 'MS', name: 'Mississippi', id: 'US-MS' },
  { code: 'MO', name: 'Missouri', id: 'US-MO' },
  { code: 'MT', name: 'Montana', id: 'US-MT' },
  { code: 'NE', name: 'Nebraska', id: 'US-NE' },
  { code: 'NV', name: 'Nevada', id: 'US-NV' },
  { code: 'NH', name: 'New Hampshire', id: 'US-NH' },
  { code: 'NJ', name: 'New Jersey', id: 'US-NJ' },
  { code: 'NM', name: 'New Mexico', id: 'US-NM' },
  { code: 'NY', name: 'New York', id: 'US-NY' },
  { code: 'NC', name: 'North Carolina', id: 'US-NC' },
  { code: 'ND', name: 'North Dakota', id: 'US-ND' },
  { code: 'OH', name: 'Ohio', id: 'US-OH' },
  { code: 'OK', name: 'Oklahoma', id: 'US-OK' },
  { code: 'OR', name: 'Oregon', id: 'US-OR' },
  { code: 'PA', name: 'Pennsylvania', id: 'US-PA' },
  { code: 'RI', name: 'Rhode Island', id: 'US-RI' },
  { code: 'SC', name: 'South Carolina', id: 'US-SC' },
  { code: 'SD', name: 'South Dakota', id: 'US-SD' },
  { code: 'TN', name: 'Tennessee', id: 'US-TN' },
  { code: 'TX', name: 'Texas', id: 'US-TX' },
  { code: 'UT', name: 'Utah', id: 'US-UT' },
  { code: 'VT', name: 'Vermont', id: 'US-VT' },
  { code: 'VA', name: 'Virginia', id: 'US-VA' },
  { code: 'WA', name: 'Washington', id: 'US-WA' },
  { code: 'WV', name: 'West Virginia', id: 'US-WV' },
  { code: 'WI', name: 'Wisconsin', id: 'US-WI' },
  { code: 'WY', name: 'Wyoming', id: 'US-WY' },
];

export const STATE_CODE_TO_ID: Record<string, string> = Object.fromEntries(
  CONTIGUOUS_STATES.map((s) => [s.code, s.id])
);

export const STATE_ID_TO_CODE: Record<string, string> = Object.fromEntries(
  CONTIGUOUS_STATES.map((s) => [s.id, s.code])
);

export const STATE_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  CONTIGUOUS_STATES.map((s) => [s.code, s.name])
);

export const STATE_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  CONTIGUOUS_STATES.map((s) => [s.name, s.code])
);

export function getStateByCode(code: string): StateInfo | undefined {
  return CONTIGUOUS_STATES.find((s) => s.code === code);
}

export function getStateById(id: string): StateInfo | undefined {
  return CONTIGUOUS_STATES.find((s) => s.id === id);
}
