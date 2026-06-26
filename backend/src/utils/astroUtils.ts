// backend/src/utils/astroUtils.ts

export interface PlanetCoordinates {
  id: string;
  name: string;
  ra: number; // Right Ascension in degrees (0 - 360)
  dec: number; // Declination in degrees (-90 - 90)
  alt: number; // Altitude in degrees
  az: number; // Azimuth in degrees
  distanceAU: number;
  riseTime: string; // ISO or HH:MM AM/PM
  setTime: string;
  transitTime: string;
  visible: boolean;
}

const OBLIQUITY = 23.439291 * (Math.PI / 180); // Rads

// Keplerian elements at J2000 and rates of change per century
interface OrbitalElements {
  a: number; // semi-major axis (AU)
  aDot: number;
  e: number; // eccentricity
  eDot: number;
  i: number; // inclination (deg)
  iDot: number;
  L: number; // mean longitude (deg)
  LDot: number;
  w: number; // longitude of perihelion (deg)
  wDot: number;
  node: number; // longitude of ascending node (deg)
  nodeDot: number;
}

const PLANETS_ELEMENTS: Record<string, OrbitalElements> = {
  mercury: {
    a: 0.38709893, aDot: 0.0,
    e: 0.20563069, eDot: 0.00002040,
    i: 7.00487, iDot: -0.005941,
    L: 252.25084, LDot: 149472.67414,
    w: 77.45645, wDot: 0.159014,
    node: 48.33167, nodeDot: -0.125371,
  },
  venus: {
    a: 0.72333199, aDot: 0.0,
    e: 0.00677323, eDot: -0.00004776,
    i: 3.39471, iDot: -0.000788,
    L: 181.97973, LDot: 58517.81538,
    w: 131.53298, wDot: 0.002136,
    node: 76.68069, nodeDot: -0.277694,
  },
  earth: { // Earth-Moon Barycenter elements
    a: 1.00000011, aDot: 0.0,
    e: 0.01671022, eDot: -0.00003804,
    i: 0.00005, iDot: -0.01300,
    L: 100.46435, LDot: 35999.37288,
    w: 102.94719, wDot: 0.323273,
    node: -11.26064, nodeDot: -0.412285,
  },
  mars: {
    a: 1.52366231, aDot: 0.0,
    e: 0.09341233, eDot: 0.00011902,
    i: 1.85061, iDot: -0.007248,
    L: 355.45332, LDot: 19140.30268,
    w: 336.04084, wDot: 0.443883,
    node: 49.57854, nodeDot: -0.292573,
  },
  jupiter: {
    a: 5.20336301, aDot: 0.00060737,
    e: 0.04839266, eDot: -0.00012880,
    i: 1.30530, iDot: -0.004150,
    L: 34.40438, LDot: 3034.74612,
    w: 14.75385, wDot: 0.191117,
    node: 100.55615, nodeDot: 0.204052,
  },
  saturn: {
    a: 9.53707032, aDot: -0.00301530,
    e: 0.05415060, eDot: -0.00036762,
    i: 2.48446, iDot: 0.001930,
    L: 49.94432, LDot: 1222.11379,
    w: 92.43194, wDot: -0.418974,
    node: 113.71504, nodeDot: -0.334441,
  },
  uranus: {
    a: 19.19126393, aDot: 0.00152025,
    e: 0.04716771, eDot: -0.00019150,
    i: 0.76986, iDot: 0.000280,
    L: 313.23218, LDot: 428.48202,
    w: 170.96424, wDot: 0.408052,
    node: 74.22988, nodeDot: -0.094112,
  },
  neptune: {
    a: 30.06896348, aDot: -0.00125196,
    e: 0.00858587, eDot: 0.00002514,
    i: 1.76917, iDot: -0.000363,
    L: 304.88003, LDot: 218.48947,
    w: 44.97135, wDot: -0.322414,
    node: 131.72169, nodeDot: -0.005929,
  },
};

export function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function getJulianCenturies(date: Date): number {
  return (getJulianDate(date) - 2451545.0) / 36525.0;
}

function solveKepler(M: number, e: number): number {
  let E = M;
  for (let step = 0; step < 10; step++) {
    const deltaE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= deltaE;
    if (Math.abs(deltaE) < 1e-6) break;
  }
  return E;
}

// Heliocentric ecliptic coordinates (x,y,z in AU) for a planet
function getHeliocentricCoordinates(id: string, T: number): { x: number; y: number; z: number } {
  const el = PLANETS_ELEMENTS[id];
  if (!el) return { x: 0, y: 0, z: 0 };

  const a = el.a + el.aDot * T;
  const e = el.e + el.eDot * T;
  const i = (el.i + el.iDot * T) * (Math.PI / 180);
  const L = (el.L + el.LDot * T) * (Math.PI / 180);
  const w = (el.w + el.wDot * T) * (Math.PI / 180);
  const node = (el.node + el.nodeDot * T) * (Math.PI / 180);

  const argPerihelion = w - node;
  const M = L - w;

  const E = solveKepler(M, e);

  // Position in orbital plane
  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Transform to heliocentric ecliptic coordinates
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosW = Math.cos(argPerihelion);
  const sinW = Math.sin(argPerihelion);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  const x = xPrime * (cosW * cosNode - sinW * sinNode * cosI) - yPrime * (sinW * cosNode + cosW * sinNode * cosI);
  const y = xPrime * (cosW * sinNode + sinW * cosNode * cosI) - yPrime * (sinW * sinNode - cosW * cosNode * cosI);
  const z = xPrime * (sinW * sinI) + yPrime * (cosW * sinI);

  return { x, y, z };
}

// Right Ascension (deg) and Declination (deg) geocentric
export function getPlanetGeocentricEquatorial(
  id: string,
  date: Date,
): { ra: number; dec: number; distanceAU: number } {
  const T = getJulianCenturies(date);
  const helioPlanet = getHeliocentricCoordinates(id, T);
  const helioEarth = getHeliocentricCoordinates('earth', T);

  // Geocentric ecliptic vector
  const xG = helioPlanet.x - helioEarth.x;
  const yG = helioPlanet.y - helioEarth.y;
  const zG = helioPlanet.z - helioEarth.z;

  // Rotate geocentric vector to equatorial frame
  const xEq = xG;
  const yEq = yG * Math.cos(OBLIQUITY) - zG * Math.sin(OBLIQUITY);
  const zEq = yG * Math.sin(OBLIQUITY) + zG * Math.cos(OBLIQUITY);

  const distanceAU = Math.sqrt(xEq * xEq + yEq * yEq + zEq * zEq);
  let ra = Math.atan2(yEq, xEq) * (180 / Math.PI);
  if (ra < 0) ra += 360;

  const dec = Math.asin(zEq / distanceAU) * (180 / Math.PI);

  return { ra, dec, distanceAU };
}

export function localSiderealTime(longitude: number, date: Date): number {
  const JD = getJulianDate(date);
  const T = (JD - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  let lst = gmst + longitude;
  lst = lst % 360;
  if (lst < 0) lst += 360;
  return lst;
}

export function equatorialToHorizontal(
  ra: number,
  dec: number,
  lat: number,
  lon: number,
  date: Date,
): { alt: number; az: number } {
  const lst = localSiderealTime(lon, date);
  let ha = lst - ra;
  if (ha < 0) ha += 360;

  const rad = Math.PI / 180;
  const decRad = dec * rad;
  const latRad = lat * rad;
  const haRad = ha * rad;

  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const alt = Math.asin(sinAlt) * (180 / Math.PI);

  const cosAz = (Math.sin(decRad) - Math.sin(alt * rad) * Math.sin(latRad)) / (Math.cos(alt * rad) * Math.cos(latRad));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * (180 / Math.PI);
  if (Math.sin(haRad) > 0) {
    az = 360 - az;
  }

  return { alt, az };
}

// Scan the next 24 hours to find Rise, Set, Transit times
export function scanPlanetRisesSets(
  id: string,
  lat: number,
  lon: number,
  date: Date,
): { riseTime: string; setTime: string; transitTime: string } {
  const steps24h = 144; // 10 minute steps
  const stepMs = 10 * 60 * 1000;
  const startMs = date.getTime();

  let riseMs = 0;
  let setMs = 0;
  let maxAlt = -999;
  let transitMs = 0;

  let prevAlt = 0;

  for (let step = 0; step <= steps24h; step++) {
    const t = new Date(startMs + step * stepMs);
    const { ra, dec } = getPlanetGeocentricEquatorial(id, t);
    const { alt } = equatorialToHorizontal(ra, dec, lat, lon, t);

    if (step > 0) {
      // Rise: passes through 0 going up
      if (prevAlt < 0 && alt >= 0 && riseMs === 0) {
        // linear interpolate
        const ratio = Math.abs(prevAlt) / (alt - prevAlt);
        riseMs = startMs + (step - 1 + ratio) * stepMs;
      }
      // Set: passes through 0 going down
      if (prevAlt > 0 && alt <= 0 && setMs === 0) {
        const ratio = prevAlt / (prevAlt - alt);
        setMs = startMs + (step - 1 + ratio) * stepMs;
      }
    }

    if (alt > maxAlt) {
      maxAlt = alt;
      transitMs = t.getTime();
    }

    prevAlt = alt;
  }

  const formatLocalTime = (ms: number) => {
    if (ms === 0) return 'N/A';
    const d = new Date(ms);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return {
    riseTime: formatLocalTime(riseMs),
    setTime: formatLocalTime(setMs),
    transitTime: formatLocalTime(transitMs),
  };
}

// Calculate Moon age & illumination percentage
// Synthesizes moon phases relative to a known new moon on J2000.0 (JD 2451550.1)
export function getMoonIllumination(date: Date): { phase: number; fraction: number; phaseName: string } {
  const JD = getJulianDate(date);
  const synodicPeriod = 29.530588853;
  // Julian Date of New Moon: Jan 6, 2000 at 18:24
  const baseNewMoonJD = 2451550.267;
  let age = (JD - baseNewMoonJD) % synodicPeriod;
  if (age < 0) age += synodicPeriod;

  // Fraction of moon illuminated (0 to 1)
  const fraction = 0.5 * (1 - Math.cos((2 * Math.PI * age) / synodicPeriod));

  let phaseName = 'Waxing Gibbous';
  const agePercent = age / synodicPeriod;

  if (agePercent < 0.03 || agePercent > 0.97) phaseName = 'New Moon';
  else if (agePercent >= 0.03 && agePercent < 0.22) phaseName = 'Waxing Crescent';
  else if (agePercent >= 0.22 && agePercent < 0.28) phaseName = 'First Quarter';
  else if (agePercent >= 0.28 && agePercent < 0.47) phaseName = 'Waxing Gibbous';
  else if (agePercent >= 0.47 && agePercent < 0.53) phaseName = 'Full Moon';
  else if (agePercent >= 0.53 && agePercent < 0.72) phaseName = 'Waning Gibbous';
  else if (agePercent >= 0.72 && agePercent < 0.78) phaseName = 'Third Quarter';
  else if (agePercent >= 0.78 && agePercent <= 0.97) phaseName = 'Waning Crescent';

  return {
    phase: agePercent,
    fraction,
    phaseName,
  };
}
