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
import { Loader2, AlertTriangle, ShieldCheck, RefreshCw, Terminal, Search } from 'lucide-react';

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

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('Unable to retrieve weather information. Please try again later.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchWeatherData(city.latitude, city.longitude, city.timezone || 'auto');
      if (!data || !data.current) {
        throw new Error('Invalid telemetry payload');
      }
      setWeatherData(data);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastUpdated(timeStr);
    } catch (err: any) {
      console.error('Failed to load weather data:', err);
      setError('Unable to retrieve weather information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity, loadWeather]);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOffline = () => {
      setError('Unable to retrieve weather information. Please try again later.');
    };
    const handleOnline = () => {
      if (selectedCity) {
        loadWeather(selectedCity);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [selectedCity, loadWeather]);

  const handleSelectCity = (city: CityLocation) => {
    setError(null);
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
        onSetGlobalError={setError}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error Notification Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                <p className="text-xs text-rose-300/80">
                  You can search for another city above or click retry to attempt fetching again.
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-rose-900/90 hover:bg-rose-800 border border-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 self-end sm:self-center"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="w-full h-80 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center p-8 space-y-4 shadow-inner">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1 font-mono">
              <p className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                Fetching Weather Data...
              </p>
              <p className="text-xs text-slate-400">
                Loading high-res current, hourly, and 7-day weather forecasts for {selectedCity.name}
              </p>
            </div>
          </div>
        )}

        {/* Full Error Empty State (when no weather data exists and not loading) */}
        {!isLoading && !weatherData && error && (
          <div className="w-full py-16 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-rose-950/50 border border-rose-800/60 flex items-center justify-center text-rose-400 shadow-lg">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-bold text-slate-200">Unable to retrieve weather information</h3>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Weather Analytics Dashboard */}
        {!isLoading && weatherData && (
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
            <span className="text-slate-400">Open-Meteo Weather API</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> High Reliability Service
            </span>
            <span className="text-slate-600">•</span>
            <span>WMO Standards Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

