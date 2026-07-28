import React from 'react';
import {
  WeatherApiResponse,
  ActivityAdvisory,
} from '../types/weather';
import { calculateAdvisories } from '../utils/advisoryEngine';
import { WeatherIcon } from './WeatherIcon';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AdvisoryEngineViewProps {
  weather: WeatherApiResponse;
}

export const AdvisoryEngineView: React.FC<AdvisoryEngineViewProps> = ({
  weather,
}) => {
  const advisories: ActivityAdvisory[] = calculateAdvisories(weather);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-xl">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Zap className="h-5 w-5 text-amber-400" />
            SUITABILITY & PLANNING ADVISORY ENGINE
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated atmospheric compatibility scores (0–100) & actionable tips
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg hidden sm:inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Real-Time Evaluated
        </span>
      </div>

      {/* Grid of 6 Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {advisories.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 relative group"
          >
            {/* Top Bar: Icon + Activity Name + Score Gauge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/40 transition">
                  <WeatherIcon name={item.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 leading-tight">
                    {item.activity}
                  </h4>
                  <span
                    className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md mt-0.5 ${item.badgeBg} ${item.badgeText}`}
                  >
                    {item.status} ({item.score}/100)
                  </span>
                </div>
              </div>

              {/* Score Gauge Circle */}
              <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                <svg className="w-11 h-11 transform -rotate-90">
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * item.score) / 100}
                    strokeLinecap="round"
                    className={`${item.color} transition-all duration-1000`}
                    fill="transparent"
                  />
                </svg>
                <span className={`absolute text-xs font-mono font-extrabold ${item.color}`}>
                  {item.score}
                </span>
              </div>
            </div>

            {/* Core Recommendation Summary */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              {item.summary}
            </p>

            {/* Metric Checks Breakdown */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              {item.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[11px] font-mono text-slate-400"
                >
                  <span className="flex items-center gap-1">
                    {m.pass ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
                    )}
                    <span>{m.label}:</span>
                  </span>
                  <span className={m.pass ? 'text-slate-200' : 'text-rose-300 font-semibold'}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
