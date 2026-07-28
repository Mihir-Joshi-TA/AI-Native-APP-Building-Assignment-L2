import React, { useState, useMemo } from 'react';
import {
  WeatherApiResponse,
  TemperatureUnit,
} from '../types/weather';
import { convertTemp, convertSpeed, formatTimeFromIso } from '../utils/units';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Thermometer, CloudRain, Wind, Sun, Layers } from 'lucide-react';

interface HourlyForecastTrendsProps {
  weather: WeatherApiResponse;
  tempUnit: TemperatureUnit;
}

type TabType = 'temp' | 'rain' | 'wind' | 'uv';

export const HourlyForecastTrends: React.FC<HourlyForecastTrendsProps> = ({
  weather,
  tempUnit,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('temp');

  // Filter 24 hours starting from current time
  const chartData = useMemo(() => {
    if (!weather?.hourly?.time) return [];

    const now = new Date();
    const hourly = weather.hourly;

    // Find starting index closest to current hour
    let startIndex = 0;
    for (let i = 0; i < hourly.time.length; i++) {
      const itemDate = new Date(hourly.time[i]);
      if (itemDate >= now) {
        startIndex = Math.max(0, i - 1);
        break;
      }
    }

    // Take 24 data points
    const sliceEnd = Math.min(hourly.time.length, startIndex + 24);
    const sliced = [];

    for (let i = startIndex; i < sliceEnd; i++) {
      const rawTime = hourly.time[i];
      const date = new Date(rawTime);
      const timeLabel = date.toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true,
      });

      const rawTemp = hourly.temperature_2m[i] ?? 0;
      const rawAppTemp = hourly.apparent_temperature[i] ?? rawTemp;
      const displayTemp = convertTemp(rawTemp, tempUnit);
      const displayAppTemp = convertTemp(rawAppTemp, tempUnit);

      const rawWind = hourly.wind_speed_10m[i] ?? 0;
      const rawGusts = hourly.wind_gusts_10m[i] ?? 0;
      const windSpeed = convertSpeed(rawWind, tempUnit).val;
      const windGusts = convertSpeed(rawGusts, tempUnit).val;

      sliced.push({
        rawTime,
        timeLabel,
        temp: displayTemp,
        apparentTemp: displayAppTemp,
        precipProb: hourly.precipitation_probability[i] ?? 0,
        precipAmount: hourly.precipitation[i] ?? 0,
        windSpeed,
        windGusts,
        uvIndex: hourly.uv_index[i] ?? 0,
        humidity: hourly.relative_humidity_2m[i] ?? 0,
        weatherCode: hourly.weather_code[i] ?? 0,
      });
    }

    return sliced;
  }, [weather, tempUnit]);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-xl">
      {/* Header & Interactive Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Layers className="h-5 w-5 text-cyan-400" />
            24-HOUR FORECAST TRENDS
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly high-resolution meteorological timeline
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            id="tab-btn-temp"
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'temp'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
            <span>Temp & Thermal</span>
          </button>

          <button
            id="tab-btn-rain"
            onClick={() => setActiveTab('rain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'rain'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="h-3.5 w-3.5 text-blue-400" />
            <span>Precipitation %</span>
          </button>

          <button
            id="tab-btn-wind"
            onClick={() => setActiveTab('wind')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'wind'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="h-3.5 w-3.5 text-indigo-400" />
            <span>Wind & Gusts</span>
          </button>

          <button
            id="tab-btn-uv"
            onClick={() => setActiveTab('uv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'uv'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span>UV Index</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temp' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="appTempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" unit={tempUnit === 'celsius' ? '°C' : '°F'} />
              <Tooltip content={<CustomTooltip type="temp" tempUnit={tempUnit} />} />
              <Area type="monotone" dataKey="temp" name="Temperature" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGradient)" />
              <Area type="monotone" dataKey="apparentTemp" name="Feels Like" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#appTempGradient)" />
            </AreaChart>
          ) : activeTab === 'rain' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip type="rain" tempUnit={tempUnit} />} />
              <Bar dataKey="precipProb" name="Precipitation Probability" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : activeTab === 'wind' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" unit={tempUnit === 'celsius' ? 'km/h' : 'mph'} />
              <Tooltip content={<CustomTooltip type="wind" tempUnit={tempUnit} />} />
              <Area type="monotone" dataKey="windSpeed" name="Wind Speed" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#windGradient)" />
              <Area type="monotone" dataKey="windGusts" name="Wind Gusts" stroke="#a855f7" strokeWidth={2} strokeDasharray="3 3" fill="none" />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" domain={[0, 12]} />
              <Tooltip content={<CustomTooltip type="uv" tempUnit={tempUnit} />} />
              <ReferenceLine y={6} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'High Risk (6+)', fill: '#f97316', fontSize: 10, position: 'insideTopLeft' }} />
              <Line type="monotone" dataKey="uvIndex" name="UV Index" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// High-tech Custom Tooltip for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type: TabType;
  tempUnit: TemperatureUnit;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  type,
  tempUnit,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const speedUnit = tempUnit === 'celsius' ? 'km/h' : 'mph';

    return (
      <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs text-slate-200 min-w-[180px]">
        <div className="text-[11px] text-cyan-400 font-bold border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
          <span>{data.timeLabel}</span>
          <span className="text-[10px] text-slate-500">{data.rawTime.split('T')[0]}</span>
        </div>

        {type === 'temp' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Temperature:</span>
              <span className="text-cyan-300 font-bold">{data.temp}°{tempUnit === 'celsius' ? 'C' : 'F'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Feels Like:</span>
              <span className="text-amber-400 font-bold">{data.apparentTemp}°{tempUnit === 'celsius' ? 'C' : 'F'}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
              <span>Humidity:</span>
              <span>{data.humidity}%</span>
            </div>
          </div>
        )}

        {type === 'rain' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Rain Prob:</span>
              <span className="text-blue-400 font-bold">{data.precipProb}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Volume:</span>
              <span className="text-sky-300 font-bold">{data.precipAmount} mm</span>
            </div>
          </div>
        )}

        {type === 'wind' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Speed:</span>
              <span className="text-indigo-300 font-bold">{data.windSpeed} {speedUnit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gusts:</span>
              <span className="text-purple-300 font-bold">{data.windGusts} {speedUnit}</span>
            </div>
          </div>
        )}

        {type === 'uv' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">UV Index:</span>
              <span className="text-amber-400 font-bold">{data.uvIndex}</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Risk: {data.uvIndex >= 8 ? 'Very High' : data.uvIndex >= 6 ? 'High' : data.uvIndex >= 3 ? 'Moderate' : 'Low'}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};
