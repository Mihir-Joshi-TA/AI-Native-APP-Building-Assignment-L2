export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface CityLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
  elevation?: number;
  population?: number;
}

export interface WmoCodeInfo {
  code: number;
  label: string;
  description: string;
  iconName: string; // lucide icon identifier
  severity: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog';
  badgeBg: string;
  badgeText: string;
}

export interface CurrentWeatherData {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface HourlyForecastData {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  showers: number[];
  weather_code: number[];
  pressure_msl: number[];
  cloud_cover: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  uv_index: number[];
}

export interface DailyForecastData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  showers_sum: number[];
  snowfall_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units?: Record<string, string>;
  current: CurrentWeatherData;
  hourly: HourlyForecastData;
  daily: DailyForecastData;
}

export interface ActivityAdvisory {
  id: string;
  activity: string;
  score: number; // 0 - 100
  status: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  color: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  summary: string;
  tips: string[];
  metrics: { label: string; value: string; pass: boolean }[];
}
