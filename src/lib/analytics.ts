import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_cqw6xKlZHzN4NVXRyc570OA8xVwTtOt652jtJsRvVZW';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

let initialized = false;

/**
 * Initialize PostHog analytics.
 * Call once on app startup.
 */
export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,
    capture_pageview: true,
    persistence: 'localStorage',
    disable_session_recording: true,
  });

  initialized = true;
}

/**
 * Track a custom event.
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!initialized) return;
  posthog.capture(eventName, properties);
}

/**
 * Track when a bean is added.
 */
export function trackBeanAdded(bean: {
  hasOrigin: boolean;
  hasProcess: boolean;
  hasRoastLevel: boolean;
}): void {
  trackEvent('bean_added', bean);
}

/**
 * Track when a shot is logged.
 */
export function trackShotLogged(shot: {
  shotNumber: number;
  balance: number;
  ratio: number;
}): void {
  trackEvent('shot_logged', shot);
}

/**
 * Track when a bean is marked as dialed.
 */
export function trackBeanDialed(data: {
  shotsToDialIn: number;
  hasOrigin: boolean;
  hasRoastLevel: boolean;
}): void {
  trackEvent('bean_dialed', data);
}

/**
 * Track when telemetry is enabled/disabled.
 */
export function trackTelemetryToggle(enabled: boolean): void {
  trackEvent('telemetry_toggled', { enabled });
}
