/**
 * User's equipment profile.
 */
export interface EquipmentProfile {
  grinder: string;
  machine: string;
}

/**
 * App settings stored locally.
 */
export interface AppSettings {
  equipment: EquipmentProfile;
  telemetryEnabled: boolean;
}

/**
 * Common grinder options for suggestions.
 */
export const COMMON_GRINDERS = [
  'Eureka Mignon (Specialita/Silenzio/etc)',
  'Baratza Sette 270',
  'Baratza Encore',
  'Niche Zero',
  '1Zpresso JX Pro',
  '1Zpresso K-Max',
  'Comandante C40',
  'Breville Smart Grinder Pro',
  'DF64 / Turin',
  'Timemore Chestnut',
  'Other',
];

/**
 * Common machine options for suggestions.
 */
export const COMMON_MACHINES = [
  'Breville Barista Express',
  'Breville Barista Pro',
  'Breville Bambino',
  'Gaggia Classic Pro',
  'Rancilio Silvia',
  'Lelit Anna',
  'Lelit MaraX',
  'Profitec Pro 300',
  'Decent DE1',
  'La Marzocco Linea Mini',
  'Flair (manual)',
  'Robot (manual)',
  'Other',
];
