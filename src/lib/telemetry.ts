const SUPABASE_URL = 'https://oytbmabeoxslybpgrbkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VdxWHdvUrAfRAxl-x6k6tQ_W7zHF0YE';

export interface TelemetryData {
  grinder?: string;
  machine?: string;
  origin?: string;
  process?: string;
  roast_level?: string;
  shots_to_dial_in?: number;
  final_ratio?: number;
  final_time?: number;
  final_dose?: number;
  final_yield?: number;
}

/**
 * Send anonymous telemetry data to Supabase.
 * Only call this if user has opted in.
 */
export async function sendTelemetry(data: TelemetryData): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telemetry`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Telemetry send failed:', error);
    return false;
  }
}

/**
 * The data points we collect (for displaying to users).
 */
export const TELEMETRY_DATA_POINTS = [
  'Grinder model',
  'Espresso machine model',
  'Bean origin (e.g., Ethiopia, Brazil)',
  'Bean process (e.g., washed, natural)',
  'Roast level (light, medium, dark)',
  'Number of shots to dial in',
  'Final recipe (dose, yield, time, ratio)',
];

/**
 * What we explicitly DON'T collect.
 */
export const TELEMETRY_NOT_COLLECTED = [
  'Your name or email',
  'Bean names or roaster names',
  'Personal notes',
  'Any identifying information',
  'Your location',
];
