import { CityLocation, WeatherApiResponse } from '../types/weather';

export const DEFAULT_CITIES: CityLocation[] = [
  { id: 1264527, name: 'Chennai', latitude: 13.0827, longitude: 80.2707, country: 'India', country_code: 'IN', timezone: 'Asia/Kolkata' },
  { id: 2643743, name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', country_code: 'GB', timezone: 'Europe/London' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', country_code: 'JP', timezone: 'Asia/Tokyo' },
  { id: 5128581, name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'United States', country_code: 'US', timezone: 'America/New_York' },
  { id: 2988507, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France', country_code: 'FR', timezone: 'Europe/Paris' },
];

export async function searchCities(query: string): Promise<CityLocation[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding failed with status ${res.status}`);
    }
    const data = await res.json();
    return (data.results as CityLocation[]) || [];
  } catch (err) {
    console.error('Error searching cities:', err);
    return [];
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<CityLocation> {
  try {
    // Attempt reverse geocoding lookup using open-meteo or bigdatacloud free api fallback
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    const tz = data.timezone || 'auto';
    
    // Try to get a clean location name from reverse geocoding if possible, or build custom city object
    return {
      id: Math.round(latitude * 1000 + longitude),
      name: `GPS Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
      latitude,
      longitude,
      country: 'Current Coordinates',
      timezone: tz,
    };
  } catch {
    return {
      id: Date.now(),
      name: `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
      latitude,
      longitude,
      timezone: 'auto',
    };
  }
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  timezone: string = 'auto'
): Promise<WeatherApiResponse> {
  const currentParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'rain',
    'showers',
    'snowfall',
    'weather_code',
    'cloud_cover',
    'pressure_msl',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
  ].join(',');

  const hourlyParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'dew_point_2m',
    'apparent_temperature',
    'precipitation_probability',
    'precipitation',
    'rain',
    'showers',
    'weather_code',
    'pressure_msl',
    'cloud_cover',
    'wind_speed_10m',
    'wind_gusts_10m',
    'uv_index',
  ].join(',');

  const dailyParams = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'uv_index_max',
    'precipitation_sum',
    'rain_sum',
    'showers_sum',
    'snowfall_sum',
    'precipitation_hours',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'wind_direction_10m_dominant',
  ].join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=${encodeURIComponent(
    timezone
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API returned error status ${response.status}`);
  }

  const data: WeatherApiResponse = await response.json();
  return data;
}
