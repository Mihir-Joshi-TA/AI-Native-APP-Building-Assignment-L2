import React, { useState, useEffect, useCallback } from 'react';
import {
  CityLocation,
  WeatherApiResponse,
  TemperatureUnit,
} from './types/weather';
import { DEFAULT_CITIES, fetchWeatherData } from './services/openMeteoApi';
import { CitySearchBar } from './components/CitySearchBar';
import { CurrentWeatherHero } from './components/CurrentWeatherHero';
import { HourlyForecastTrends } from './components/HourlyForecastTrends';
import { ExtendedOutlook } from './components/ExtendedOutlook';
import { AdvisoryEngineView } from './components/AdvisoryEngineView';
import { Loader2, AlertTriangle, ShieldCheck, Activity, Terminal } from 'lucide-react';

const SELECTED_CITY_KEY = 'weather_intel_selected_city_v1';
const TEMP_UNIT_KEY = 'weather_intel_temp_unit_v1';

export default function App() {
  const [selectedCity, setSelectedCity] = useState<CityLocation>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_CITY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CITIES[0]; // Default Chennai
  });

  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => {
    try {
      const saved = localStorage.getItem(TEMP_UNIT_KEY);
      if (saved === 'celsius' || saved === 'fahrenheit') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'celsius';
  });

  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load weather data for current city
  const loadWeather = useCallback(async (city: CityLocation) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(city.latitude, city.longitude, city.timezone || 'auto');
      setWeatherData(data);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastUpdated(timeStr);
    } catch (err: any) {
      console.error('Failed to load weather data:', err);
      setError(err?.message || 'Failed to communicate with Open-Meteo telemetry API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity, loadWeather]);

  const handleSelectCity = (city: CityLocation) => {
    setSelectedCity(city);
    try {
      localStorage.setItem(SELECTED_CITY_KEY, JSON.stringify(city));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTempUnit = () => {
    setTempUnit((prev) => {
      const next = prev === 'celsius' ? 'fahrenheit' : 'celsius';
      try {
        localStorage.setItem(TEMP_UNIT_KEY, next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleRefresh = () => {
    loadWeather(selectedCity);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Fixed Header with City Search, Quick Tabs, GPS, Unit Toggle */}
      <CitySearchBar
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
        lastUpdated={lastUpdated}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs font-mono">
              <span className="font-bold uppercase text-rose-300">Telemetry API Error:</span>{' '}
              {error}
              <button
                onClick={handleRefresh}
                className="ml-3 underline hover:text-white font-bold"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && !weatherData && (
          <div className="w-full h-96 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
            <div className="text-center space-y-1 font-mono">
              <p className="text-sm font-semibold text-slate-200">
                CONNECTING TO OPEN-METEO TELEMETRY SENSORS...
              </p>
              <p className="text-xs text-slate-500">
                Fetching high-density current, hourly, and 7-day atmospheric models for {selectedCity.name}
              </p>
            </div>
          </div>
        )}

        {/* Live Weather Analytics Dashboard */}
        {weatherData && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Hero Current Weather Display & Telemetry Grid */}
            <CurrentWeatherHero
              weather={weatherData}
              city={selectedCity}
              tempUnit={tempUnit}
            />

            {/* 2. 24-Hour Interactive Forecast Trends (Recharts) */}
            <HourlyForecastTrends
              weather={weatherData}
              tempUnit={tempUnit}
            />

            {/* 3. 7-Day Extended Weather Outlook */}
            <ExtendedOutlook
              weather={weatherData}
              tempUnit={tempUnit}
            />

            {/* 4. Planning & Suitability Advisory Engine */}
            <AdvisoryEngineView
              weather={weatherData}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-4 px-4 mt-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-500" />
            <span>WEATHER.INTEL PLATFORM v2.4</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Open-Meteo Public API (Non-Commercial / Open Data)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Zero Key Required
            </span>
            <span className="text-slate-600">•</span>
            <span>WMO Standards Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
