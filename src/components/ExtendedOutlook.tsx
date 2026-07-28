import React, { useState } from 'react';
import {
  WeatherApiResponse,
  TemperatureUnit,
} from '../types/weather';
import { getWmoInfo } from '../utils/wmoCodes';
import {
  convertTemp,
  convertSpeed,
  formatTemp,
  getDayOfWeekName,
  formatDateShort,
  formatTimeFromIso,
  getUvRiskLevel,
} from '../utils/units';
import { WeatherIcon } from './WeatherIcon';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  CloudRain,
  Thermometer,
} from 'lucide-react';

interface ExtendedOutlookProps {
  weather: WeatherApiResponse;
  tempUnit: TemperatureUnit;
}

export const ExtendedOutlook: React.FC<ExtendedOutlookProps> = ({
  weather,
  tempUnit,
}) => {
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0); // First day expanded by default

  const daily = weather.daily;
  if (!daily || !daily.time || daily.time.length === 0) {
    return null;
  }

  // Calculate week's absolute min & max temperatures for global relative range bar positioning
  let weekMinTempC = Infinity;
  let weekMaxTempC = -Infinity;

  for (let i = 0; i < daily.time.length; i++) {
    const min = daily.temperature_2m_min[i] ?? 0;
    const max = daily.temperature_2m_max[i] ?? 0;
    if (min < weekMinTempC) weekMinTempC = min;
    if (max > weekMaxTempC) weekMaxTempC = max;
  }

  const weekRange = weekMaxTempC - weekMinTempC || 1;

  const toggleExpand = (index: number) => {
    setExpandedDayIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Calendar className="h-5 w-5 text-cyan-400" />
            7-DAY EXTENDED OUTLOOK
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Medium-range forecast with thermal variation bars
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 hidden sm:inline-block bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          Week Bounds: {formatTemp(weekMinTempC, tempUnit)} — {formatTemp(weekMaxTempC, tempUnit)}
        </span>
      </div>

      {/* Daily Rows */}
      <div className="space-y-2">
        {daily.time.map((timeStr, index) => {
          const wmoCode = daily.weather_code[index] ?? 0;
          const wmo = getWmoInfo(wmoCode, 1);

          const minTempC = daily.temperature_2m_min[index] ?? 0;
          const maxTempC = daily.temperature_2m_max[index] ?? 0;

          const precipProb = daily.precipitation_probability_max[index] ?? 0;
          const rainSum = daily.rain_sum[index] ?? daily.precipitation_sum[index] ?? 0;
          const maxWindKmh = daily.wind_speed_10m_max[index] ?? 0;
          const maxGustsKmh = daily.wind_gusts_10m_max[index] ?? 0;
          const maxUv = daily.uv_index_max[index] ?? 0;

          const windSpeed = convertSpeed(maxWindKmh, tempUnit);
          const windGusts = convertSpeed(maxGustsKmh, tempUnit);
          const uvRisk = getUvRiskLevel(maxUv);

          const isExpanded = expandedDayIndex === index;

          // Calculate percentage left & width for relative bar fill
          const leftPercent = Math.max(0, Math.min(100, ((minTempC - weekMinTempC) / weekRange) * 100));
          const widthPercent = Math.max(8, Math.min(100, ((maxTempC - minTempC) / weekRange) * 100));

          const dayName = getDayOfWeekName(timeStr);
          const dateStr = formatDateShort(timeStr);

          const sunriseTime = daily.sunrise[index] ? formatTimeFromIso(daily.sunrise[index]) : '--';
          const sunsetTime = daily.sunset[index] ? formatTimeFromIso(daily.sunset[index]) : '--';

          return (
            <div
              key={timeStr}
              className={`rounded-xl border transition overflow-hidden ${
                isExpanded
                  ? 'bg-slate-950/90 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/70'
              }`}
            >
              {/* Row Summary Bar */}
              <button
                id={`expand-day-btn-${index}`}
                onClick={() => toggleExpand(index)}
                className="w-full px-3 sm:px-4 py-3 flex items-center justify-between text-left gap-2 sm:gap-4 transition"
              >
                {/* Day Name & Date */}
                <div className="w-24 sm:w-32 shrink-0">
                  <div className="text-sm font-bold font-mono text-slate-100">
                    {dayName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {dateStr}
                  </div>
                </div>

                {/* Weather WMO Condition Icon & Badge */}
                <div className="flex items-center gap-2 w-32 sm:w-44 shrink-0">
                  <div className={`p-1.5 rounded-lg border ${wmo.badgeBg}`}>
                    <WeatherIcon name={wmo.iconName} className="h-4 w-4" />
                  </div>
                  <div className="hidden xs:block">
                    <div className="text-xs font-semibold text-slate-200">
                      {wmo.label}
                    </div>
                    {precipProb > 0 && (
                      <div className="text-[10px] font-mono text-blue-400 flex items-center gap-1">
                        <Droplets className="h-2.5 w-2.5" />
                        <span>{precipProb}% precip</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Relative Min / Max Thermal Bar */}
                <div className="flex-1 hidden md:flex items-center gap-3 px-2">
                  <span className="text-xs font-mono text-cyan-400 w-10 text-right">
                    {formatTemp(minTempC, tempUnit, false)}°
                  </span>

                  {/* Range Track */}
                  <div className="flex-1 bg-slate-800/80 h-2 rounded-full overflow-hidden relative">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono text-amber-400 w-10 text-left">
                    {formatTemp(maxTempC, tempUnit, false)}°
                  </span>
                </div>

                {/* Mobile Min / Max Numbers */}
                <div className="md:hidden flex items-center gap-1.5 font-mono text-xs text-right shrink-0">
                  <span className="text-cyan-400">{formatTemp(minTempC, tempUnit, false)}°</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-amber-400">{formatTemp(maxTempC, tempUnit, false)}°</span>
                </div>

                {/* Expand Chevron */}
                <div className="text-slate-500 hover:text-slate-300 shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Expandable Breakdown Panel */}
              {isExpanded && (
                <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono animate-fadeIn">
                  {/* Item 1: Rainfall Total */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                      <CloudRain className="h-3 w-3 text-blue-400" />
                      Precipitation Volume
                    </div>
                    <div className="text-sm font-bold text-slate-100">
                      {rainSum.toFixed(1)} <span className="text-[10px] text-slate-400">mm</span>
                    </div>
                    <div className="text-[10px] text-blue-400 mt-0.5">
                      {precipProb}% probability
                    </div>
                  </div>

                  {/* Item 2: Max Wind & Gusts */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                      <Wind className="h-3 w-3 text-indigo-400" />
                      Max Wind & Gusts
                    </div>
                    <div className="text-sm font-bold text-slate-100">
                      {windSpeed.val} <span className="text-[10px] text-slate-400">{windSpeed.unitStr}</span>
                    </div>
                    <div className="text-[10px] text-indigo-300 mt-0.5">
                      Gusts up to {windGusts.val} {windGusts.unitStr}
                    </div>
                  </div>

                  {/* Item 3: Max UV Risk */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                      <Sun className="h-3 w-3 text-amber-400" />
                      Max UV Exposure
                    </div>
                    <div className="text-sm font-bold text-slate-100">
                      UV {maxUv.toFixed(1)}
                    </div>
                    <div className={`text-[10px] ${uvRisk.color} mt-0.5 font-semibold`}>
                      {uvRisk.label}
                    </div>
                  </div>

                  {/* Item 4: Daylight Cycle */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                      <Sunrise className="h-3 w-3 text-amber-300" />
                      Sun Cycle
                    </div>
                    <div className="text-xs font-bold text-slate-200">
                      🌅 {sunriseTime}
                    </div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">
                      🌇 {sunsetTime}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
