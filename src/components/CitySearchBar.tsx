import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Clock, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { CityLocation, TemperatureUnit } from '../types/weather';
import { searchCities, reverseGeocode, DEFAULT_CITIES } from '../services/openMeteoApi';

interface CitySearchBarProps {
  selectedCity: CityLocation;
  onSelectCity: (city: CityLocation) => void;
  tempUnit: TemperatureUnit;
  onToggleTempUnit: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string | null;
  onSetGlobalError?: (msg: string | null) => void;
}

const RECENT_SEARCHES_KEY = 'weather_intel_recent_searches_v1';

export const CitySearchBar: React.FC<CitySearchBarProps> = ({
  selectedCity,
  onSelectCity,
  tempUnit,
  onToggleTempUnit,
  onRefresh,
  isRefreshing,
  lastUpdated,
  onSetGlobalError,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<CityLocation[]>([]);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse recent searches', e);
    }
  }, []);

  // Save to recent searches
  const addToRecent = (city: CityLocation) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.latitude !== city.latitude || c.longitude !== city.longitude);
      const updated = [city, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent searches', e);
      }
      return updated;
    });
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search API call
  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSearchError('Unable to retrieve weather information. Please try again later.');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(query);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError('City not found. Please check the spelling and try again.');
        } else {
          setSearchError(null);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchError('Unable to retrieve weather information. Please try again later.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CityLocation) => {
    onSelectCity(city);
    addToRecent(city);
    setQuery('');
    setSearchError(null);
    if (onSetGlobalError) onSetGlobalError(null);
    setIsOpen(false);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      setSearchError('Please enter a city name.');
      setIsOpen(true);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSearchError('Unable to retrieve weather information. Please try again later.');
      setIsOpen(true);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchCities(trimmed);
      setSearchResults(results);
      setIsOpen(true);

      if (results.length === 0) {
        setSearchError('City not found. Please check the spelling and try again.');
      } else if (results.length === 1) {
        handleSelect(results[0]);
      }
    } catch (err) {
      console.error('Search submit error:', err);
      setSearchError('Unable to retrieve weather information. Please try again later.');
      setIsOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGpsLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      setIsOpen(true);
      return;
    }

    if (!navigator.onLine) {
      setSearchError('Unable to retrieve weather information. Please try again later.');
      setIsOpen(true);
      return;
    }

    setIsGpsLoading(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const gpsCity = await reverseGeocode(latitude, longitude);
          handleSelect(gpsCity);
        } catch (err) {
          setSearchError('Unable to retrieve weather information. Please try again later.');
          setIsOpen(true);
        } finally {
          setIsGpsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setSearchError('Unable to retrieve weather information. Please try again later.');
        setIsOpen(true);
        setIsGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const clearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Platform Name */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-wide uppercase font-mono">
                  WEATHER<span className="text-cyan-400">.INTEL</span>
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LIVE API
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Open-Meteo High-Res Telemetry
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="unit-toggle-btn-mobile"
              onClick={onToggleTempUnit}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold hover:bg-slate-700 transition"
              title="Toggle Temperature Unit"
            >
              {tempUnit === 'celsius' ? '°C' : '°F'}
            </button>
            <button
              id="refresh-btn-mobile"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 hover:bg-slate-700 transition"
              title="Refresh Telemetry Data"
            >
              <Loader2 className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar & Auto-complete */}
        <div className="relative w-full md:w-96" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="city-search-input"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchError(null);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search city or location..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-24 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 font-sans transition shadow-inner"
            />

            {/* Clear button if text typed */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchError(null);
                  setSearchResults([]);
                }}
                className="absolute right-14 text-slate-400 hover:text-slate-200 p-1"
                title="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* GPS Button inside search */}
            <button
              type="button"
              id="gps-location-btn"
              onClick={handleGpsLocation}
              disabled={isGpsLoading}
              className="absolute right-2 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium hover:bg-cyan-500/20 flex items-center gap-1 transition"
              title="Detect Current GPS Location"
            >
              {isGpsLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              <span>GPS</span>
            </button>
          </form>

          {/* Auto-complete Dropdown & Error Messages */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-800">
              {/* Display Search Error Banner */}
              {searchError && (
                <div className="p-3 bg-rose-950/80 border-b border-rose-800/80 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="font-medium">{searchError}</span>
                </div>
              )}

              {isSearching && (
                <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>Searching location database...</span>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 bg-slate-950/50">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.map((city) => (
                    <button
                      key={`${city.id}-${city.latitude}-${city.longitude}`}
                      id={`city-result-${city.id}`}
                      onClick={() => handleSelect(city)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800/80 flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-cyan-300">
                          {city.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {[city.admin1, city.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches section */}
              {recentSearches.length > 0 && !query && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 bg-slate-950/50 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((city) => (
                    <button
                      key={`recent-${city.latitude}-${city.longitude}`}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                        <span className="text-xs font-medium text-slate-300">
                          {city.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {city.country || ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Controls Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Temperature Unit Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="unit-btn-celsius"
              onClick={() => tempUnit !== 'celsius' && onToggleTempUnit()}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                tempUnit === 'celsius'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              id="unit-btn-fahrenheit"
              onClick={() => tempUnit !== 'fahrenheit' && onToggleTempUnit()}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                tempUnit === 'fahrenheit'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>

          {/* Refresh Button */}
          <button
            id="refresh-btn-desktop"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition disabled:opacity-50"
            title="Refresh Live Telemetry"
          >
            <Loader2 className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {/* Last Updated Timestamp */}
          {lastUpdated && (
            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-500">Sync: </span>
              <span className="text-slate-300">{lastUpdated}</span>
            </div>
          )}
        </div>
      </div>

      {/* Popular City Quick Tabs */}
      <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
            Global Hubs:
          </span>
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name.toLowerCase() === city.name.toLowerCase();
            return (
              <button
                key={city.name}
                id={`quick-tab-${city.name.toLowerCase()}`}
                onClick={() => handleSelect(city)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{city.name}</span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />}
              </button>
            );
          })}
        </div>

        {/* Selected City Lat/Lon indicator */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>COORDS:</span>
          <span className="text-slate-300">
            {selectedCity.latitude.toFixed(4)}°, {selectedCity.longitude.toFixed(4)}°
          </span>
        </div>
      </div>
    </header>
  );
};

