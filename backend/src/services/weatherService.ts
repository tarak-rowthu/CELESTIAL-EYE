// backend/src/services/weatherService.ts
import axios from 'axios';
import { getMoonIllumination } from '../utils/astroUtils';

/** Shape of the Open-Meteo current_weather object */
interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  /** ISO 8601 time string matching an entry in hourly.time */
  time: string;
}

/** Shape of the Open-Meteo forecast API response */
interface OpenMeteoForecast {
  current_weather: CurrentWeather;
  hourly: {
    time: string[];
    cloudcover: number[];
  };
}

/** Public shape returned by getWeather */
export interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  cloudcover: number;
  /** Observation quality 0-100: higher = clearer sky */
  qualityScore: number;
}

/**
 * Fetch real-time weather and cloud cover for a location via Open-Meteo.
 * Computes a scientifically derived observation quality index.
 */
export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await axios.get<OpenMeteoForecast>(
    'https://api.open-meteo.com/v1/forecast',
    {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        hourly: 'cloudcover',
        forecast_days: 1,
        timezone: 'auto',
      },
      timeout: 8000,
    },
  );

  const cw: CurrentWeather = response.data.current_weather;
  const hourlyTimes: string[] = response.data.hourly?.time ?? [];
  const hourlyCover: number[] = response.data.hourly?.cloudcover ?? [];

  const idx = hourlyTimes.indexOf(cw.time);
  const cloudcover: number = idx !== -1 ? (hourlyCover[idx] ?? 0) : 0;
  
  // Calculate Moon illumination
  const { fraction: moonIllum } = getMoonIllumination(new Date());

  // Estimate humidity from weather code and cloudcover to compute dew impact
  let humidity = 50;
  if (cw.weathercode >= 51) humidity = 80 + (cw.weathercode % 15);
  else if (cw.weathercode >= 1 && cw.weathercode <= 3) humidity = 45 + (cloudcover % 20);
  else humidity = 35 + (cloudcover % 10);

  // Stargazing quality index scoring
  let score = 100 - cloudcover; // Base transparent sky score

  // Deduct for atmospheric condensation (high humidity > 70%)
  if (humidity > 70) {
    score -= (humidity - 70) * 0.5;
  }

  // Deduct for atmospheric turbulence (wind speed > 25 km/h)
  if (cw.windspeed > 25) {
    score -= (cw.windspeed - 25) * 0.5;
  }

  // Deduct for lunar sky glow light pollution (up to 15 points)
  score -= moonIllum * 15;

  const qualityScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    temperature: cw.temperature,
    windspeed: cw.windspeed,
    weathercode: cw.weathercode,
    cloudcover,
    qualityScore,
  };
}

