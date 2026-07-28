import { TemperatureUnit } from '../types/weather';

export function convertTemp(celsiusVal: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsiusVal * 9) / 5 + 32);
  }
  return Math.round(celsiusVal);
}

export function formatTemp(celsiusVal: number, unit: TemperatureUnit, showDegreeSymbol = true): string {
  const converted = convertTemp(celsiusVal, unit);
  const symbol = showDegreeSymbol ? (unit === 'celsius' ? '°C' : '°F') : '°';
  return `${converted}${symbol}`;
}

export function convertSpeed(kmhVal: number, unit: TemperatureUnit): { val: number; unitStr: string } {
  if (unit === 'fahrenheit') {
    const mph = Math.round(kmhVal * 0.621371);
    return { val: mph, unitStr: 'mph' };
  }
  return { val: Math.round(kmhVal), unitStr: 'km/h' };
}

export function getCardinalDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

export function getUvRiskLevel(uv: number): {
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  progressPercent: number;
} {
  const rounded = Math.round(uv * 10) / 10;
  const progressPercent = Math.min(100, Math.round((uv / 12) * 100));

  if (rounded <= 2) {
    return {
      label: 'Low Exposure',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/30',
      badgeText: 'text-emerald-400',
      progressPercent,
    };
  } else if (rounded <= 5) {
    return {
      label: 'Moderate Exposure',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/30',
      badgeText: 'text-amber-400',
      progressPercent,
    };
  } else if (rounded <= 7) {
    return {
      label: 'High Exposure',
      color: 'text-orange-400',
      badgeBg: 'bg-orange-500/10',
      badgeBorder: 'border-orange-500/30',
      badgeText: 'text-orange-400',
      progressPercent,
    };
  } else if (rounded <= 10) {
    return {
      label: 'Very High Risk',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10',
      badgeBorder: 'border-rose-500/30',
      badgeText: 'text-rose-400',
      progressPercent,
    };
  } else {
    return {
      label: 'Extreme UV Danger',
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10',
      badgeBorder: 'border-purple-500/30',
      badgeText: 'text-purple-300',
      progressPercent: 100,
    };
  }
}

export function formatTimeFromIso(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatDateShort(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

export function getDayOfWeekName(isoString: string): string {
  try {
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString([], { weekday: 'short' });
  } catch {
    return isoString;
  }
}
