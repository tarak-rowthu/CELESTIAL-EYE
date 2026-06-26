// backend/src/utils/timezone.ts
import tzLookup from 'tz-lookup';

/**
 * Returns the IANA timezone identifier for the given coordinates.
 * e.g. getTimezone(28.6, 77.2) => "Asia/Kolkata"
 *
 * Uses the tz-lookup package (bundled timezone boundary data, no network call).
 *
 * @param lat  Latitude  in decimal degrees (-90  to +90)
 * @param lon  Longitude in decimal degrees (-180 to +180)
 * @returns    IANA timezone string, e.g. "America/New_York"
 */
export function getTimezone(lat: number, lon: number): string {
  return tzLookup(lat, lon);
}
