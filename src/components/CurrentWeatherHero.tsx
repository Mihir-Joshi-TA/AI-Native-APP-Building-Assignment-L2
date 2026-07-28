import React from 'react';
import {
  WeatherApiResponse,
  CityLocation,
  TemperatureUnit,
} from '../types/weather';
import { getWmoInfo } from '../utils/wmoCodes';
import {
  formatTemp,
  convertSpeed,
  getCardinalDirection,
  getUvRiskLevel,
  formatTimeFromIso,
} from '../utils/units';
import { WeatherIcon } from './WeatherIcon';
import {
  Droplets,
  Wind,
  Compass,
  Gauge,
  Sunrise,
  Sunset,
  Sun,
  Eye,
  Cloud,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface CurrentWeatherHeroProps {
  weather: WeatherApiResponse;
  city: CityLocation;
  tempUnit: TemperatureUnit;
}

export const CurrentWeatherHero: React.FC<CurrentWeatherHeroProps> = ({
  weather,
  city,
  tempUnit,
}) => {
  const current = weather.current;
  const todayDaily = weather.daily;
  const wmoInfo = getWmoInfo(current.weather_code, current.is_day);

  // High & Low
  const maxTemp = todayDaily.temperature_2m_max[0] ?? current.temperature_2m;
  const minTemp = todayDaily.temperature_2m_min[0] ?? current.temperature_2m;
  const maxUv = todayDaily.uv_index_max[0] ?? 0;
  const uvRisk = getUvRiskLevel(maxUv);

  const wind = convertSpeed(current.wind_speed_10m, tempUnit);
  const gusts = convertSpeed(current.wind_gusts_10m, tempUnit);
  const cardinal = getCardinalDirection(current.wind_direction_10m);

  const sunrise = todayDaily.sunrise[0] ? formatTimeFromIso(todayDaily.sunrise[0]) : '06:00 AM';
  const sunset = todayDaily.sunset[0] ? formatTimeFromIso(todayDaily.sunset[0]) : '07:30 PM';

  // Dew point approximation
  const dewPoint = (
    current.temperature_2m -
    (100 - current.relative_humidity_2m) / 5
  ).toFixed(1);

  return (
    <section className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* Left Column: Temperature Readout & Condition Badge */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
          <div>
            {/* Location & Time Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {city.country || 'TELEMETRY STATION'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                TZ: {weather.timezone || 'UTC'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <span>{city.name}</span>
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Current Conditions & Real-Time Sensors
            </p>
          </div>

          {/* Big Temperature Display */}
          <div className="flex items-baseline gap-4 my-2">
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-300">
              {formatTemp(current.temperature_2m, tempUnit)}
            </div>

            <div className="flex flex-col">
              {/* WMO Condition Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold border ${wmoInfo.badgeBg}`}
              >
                <WeatherIcon name={wmoInfo.iconName} className="h-4 w-4" />
                <span>{wmoInfo.label}</span>
              </div>

              {/* Feels Like & High/Low */}
              <div className="text-xs font-mono text-slate-400 mt-2 space-y-0.5">
                <div>
                  Feels like:{' '}
                  <span className="text-slate-200 font-bold">
                    {formatTemp(current.apparent_temperature, tempUnit)}
                  </span>
                </div>
                <div>
                  High:{' '}
                  <span className="text-amber-400 font-bold">
                    {formatTemp(maxTemp, tempUnit)}
                  </span>{' '}
                  / Low:{' '}
                  <span className="text-cyan-400 font-bold">
                    {formatTemp(minTemp, tempUnit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Condition Description */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 font-mono">
                Observation:
              </span>{' '}
              {wmoInfo.description}. Cloud coverage is currently{' '}
              <span className="text-cyan-300 font-mono font-medium">
                {current.cloud_cover}%
              </span>
              .
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Metric Grid (High-Density Cards) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Card 1: Relative Humidity */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-blue-400" />
                Humidity
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Dew {dewPoint}°C
              </span>
            </div>

            <div className="text-2xl font-bold font-mono text-slate-100 my-1">
              {current.relative_humidity_2m}
              <span className="text-xs font-normal text-slate-400">%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${current.relative_humidity_2m}%` }}
              />
            </div>
          </div>

          {/* Card 2: Wind Speed & Direction */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1">
                <Wind className="h-3.5 w-3.5 text-cyan-400" />
                Wind
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {cardinal} ({current.wind_direction_10m}°)
              </span>
            </div>

            <div className="text-2xl font-bold font-mono text-slate-100 my-1 flex items-baseline gap-1">
              <span>{wind.val}</span>
              <span className="text-xs font-normal text-slate-400">
                {wind.unitStr}
              </span>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-slate-800/80">
              <span>Gusts:</span>
              <span className="text-slate-200 font-semibold">
                {gusts.val} {gusts.unitStr}
              </span>
            </div>
          </div>

          {/* Card 3: UV Index & Exposure */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                Max UV Index
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${uvRisk.badgeBg} ${uvRisk.badgeText}`}
              >
                {uvRisk.label.split(' ')[0]}
              </span>
            </div>

            <div className="text-2xl font-bold font-mono text-slate-100 my-1 flex items-baseline gap-2">
              <span>{maxUv.toFixed(1)}</span>
              <span className={`text-xs font-mono font-semibold ${uvRisk.color}`}>
                {uvRisk.label}
              </span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 h-full rounded-full"
                style={{ width: `${uvRisk.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Card 4: Pressure MSL */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-emerald-400" />
                Pressure
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Sea Level
              </span>
            </div>

            <div className="text-2xl font-bold font-mono text-slate-100 my-1">
              {Math.round(current.pressure_msl)}
              <span className="text-xs font-normal text-slate-400 ml-1">hPa</span>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-slate-800/80">
              <span>Surface:</span>
              <span className="text-slate-200 font-semibold">
                {Math.round(current.surface_pressure)} hPa
              </span>
            </div>
          </div>

          {/* Card 5: Solar Cycle (Sunrise / Sunset) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1">
                <Sunrise className="h-3.5 w-3.5 text-amber-300" />
                Sunrise & Sunset
              </span>
            </div>

            <div className="space-y-1 my-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sunrise className="h-3 w-3 text-amber-400" /> Dawn:
                </span>
                <span className="text-slate-200 font-bold">{sunrise}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sunset className="h-3 w-3 text-orange-400" /> Dusk:
                </span>
                <span className="text-slate-200 font-bold">{sunset}</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 text-right mt-1 pt-0.5 border-t border-slate-800/80">
              Solar Cycle Active
            </div>
          </div>

          {/* Card 6: Cloud Cover & Precipitation */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1">
                <Cloud className="h-3.5 w-3.5 text-sky-400" />
                Cloud Deck
              </span>
              <span className="text-[10px] font-mono text-sky-400 font-semibold">
                {current.cloud_cover}%
              </span>
            </div>

            <div className="text-2xl font-bold font-mono text-slate-100 my-1">
              {current.precipitation}
              <span className="text-xs font-normal text-slate-400 ml-1">
                mm/h
              </span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full"
                style={{ width: `${current.cloud_cover}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
