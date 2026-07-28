import { ActivityAdvisory, WeatherApiResponse } from '../types/weather';

export function calculateAdvisories(data: WeatherApiResponse): ActivityAdvisory[] {
  const current = data.current;
  const todayDaily = data.daily;
  const maxTemp = todayDaily.temperature_2m_max[0] ?? current.temperature_2m;
  const minTemp = todayDaily.temperature_2m_min[0] ?? current.temperature_2m;
  const maxUv = todayDaily.uv_index_max[0] ?? 0;
  const rainSum = todayDaily.rain_sum[0] ?? 0;
  const maxPrecipProb = todayDaily.precipitation_probability_max[0] ?? 0;
  const isStorm = [95, 96, 99].includes(current.weather_code);
  const isRainy = current.precipitation > 0 || current.rain > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(current.weather_code);
  const isSnowy = current.snowfall > 0 || [71, 73, 75, 77, 85, 86].includes(current.weather_code);

  const list: ActivityAdvisory[] = [];

  // 1. Outdoor Running & Sports
  {
    let score = 100;
    const tips: string[] = [];
    const metrics: { label: string; value: string; pass: boolean }[] = [];

    // Temp check (ideal 10C - 20C)
    const temp = current.temperature_2m;
    if (temp < 0) {
      score -= 30;
      tips.push('Freezing conditions: wear thermal layers & extra traction.');
      metrics.push({ label: 'Temperature', value: `${temp}°C (Freezing)`, pass: false });
    } else if (temp > 30) {
      score -= 35;
      tips.push('High heat risk: exercise early morning/late evening and stay hydrated.');
      metrics.push({ label: 'Temperature', value: `${temp}°C (Heat Risk)`, pass: false });
    } else if (temp > 24) {
      score -= 15;
      tips.push('Warm weather: wear light moisture-wicking gear.');
      metrics.push({ label: 'Temperature', value: `${temp}°C (Warm)`, pass: true });
    } else {
      tips.push('Optimal thermal range for cardiovascular endurance.');
      metrics.push({ label: 'Temperature', value: `${temp}°C (Ideal)`, pass: true });
    }

    // Wind check
    if (current.wind_speed_10m > 35) {
      score -= 30;
      tips.push(`Strong winds (${current.wind_speed_10m} km/h): high wind resistance.`);
      metrics.push({ label: 'Wind Speed', value: `${current.wind_speed_10m} km/h`, pass: false });
    } else {
      metrics.push({ label: 'Wind Speed', value: `${current.wind_speed_10m} km/h`, pass: true });
    }

    // Rain / Storm
    if (isStorm) {
      score -= 50;
      tips.push('Active lightning hazard: outdoor sports strictly discouraged.');
      metrics.push({ label: 'Precipitation', value: 'Thunderstorm Active', pass: false });
    } else if (isRainy) {
      score -= 25;
      tips.push('Slippery conditions: use water-resistant trail running shoes.');
      metrics.push({ label: 'Precipitation', value: `${current.precipitation} mm/h`, pass: false });
    } else {
      metrics.push({ label: 'Precipitation', value: 'Dry conditions', pass: true });
    }

    // UV check
    if (maxUv >= 8) {
      score -= 15;
      tips.push(`High UV (${maxUv}): apply SPF 50+ sunblock and wear UV-rated sunglasses.`);
      metrics.push({ label: 'Max UV Index', value: `${maxUv} (High)`, pass: false });
    } else {
      metrics.push({ label: 'Max UV Index', value: `${maxUv}`, pass: true });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    list.push(formatAdvisory('running', 'Outdoor Running & Sports', score, 'Activity', tips, metrics));
  }

  // 2. Daily Commute & Travel
  {
    let score = 100;
    const tips: string[] = [];
    const metrics: { label: string; value: string; pass: boolean }[] = [];

    if (isStorm) {
      score -= 50;
      tips.push('Severe storm alert: major road delays & visibility drop likely.');
      metrics.push({ label: 'Storm Warning', value: 'Active Thunderstorm', pass: false });
    } else {
      metrics.push({ label: 'Storm Warning', value: 'Clear Airspace', pass: true });
    }

    if (isSnowy) {
      score -= 40;
      tips.push('Slick roads & snow accumulation: carry winter safety kit.');
      metrics.push({ label: 'Road Traction', value: 'Snow / Ice Risk', pass: false });
    } else if (isRainy) {
      score -= 20;
      tips.push('Wet asphalt: maintain extra braking distance & check wipers.');
      metrics.push({ label: 'Road Conditions', value: 'Wet Roads', pass: false });
    } else {
      metrics.push({ label: 'Road Conditions', value: 'Dry Surfaces', pass: true });
    }

    if (current.wind_speed_10m > 40) {
      score -= 25;
      tips.push('High crosswinds on bridges & highways: drive with caution.');
      metrics.push({ label: 'Wind Hazard', value: `${current.wind_speed_10m} km/h`, pass: false });
    } else {
      metrics.push({ label: 'Wind Hazard', value: `${current.wind_speed_10m} km/h (Safe)`, pass: true });
    }

    if (maxPrecipProb > 60) {
      tips.push(`High rain probability today (${maxPrecipProb}%): keep an umbrella handy.`);
      metrics.push({ label: 'Rain Prob', value: `${maxPrecipProb}%`, pass: false });
    } else {
      metrics.push({ label: 'Rain Prob', value: `${maxPrecipProb}%`, pass: true });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    list.push(formatAdvisory('commute', 'Daily Commute & Travel', score, 'Car', tips, metrics));
  }

  // 3. Lawn & Gardening
  {
    let score = 100;
    const tips: string[] = [];
    const metrics: { label: string; value: string; pass: boolean }[] = [];

    if (rainSum > 10 || current.precipitation > 2) {
      score -= 40;
      tips.push('Natural rainfall abundant today: cancel automatic sprinkler cycles.');
      metrics.push({ label: 'Water Need', value: `Saturated (${rainSum} mm)`, pass: false });
    } else if (rainSum === 0 && current.relative_humidity_2m < 40) {
      score += 0;
      tips.push('Dry soil conditions: ideal window for manual lawn & plant irrigation.');
      metrics.push({ label: 'Water Need', value: 'High Irrigation Need', pass: true });
    } else {
      tips.push('Moderate moisture level: check topsoil before watering.');
      metrics.push({ label: 'Water Need', value: `Moderate (${rainSum} mm)`, pass: true });
    }

    if (minTemp < 3) {
      score -= 35;
      tips.push(`Frost risk tonight (${minTemp}°C): cover delicate outdoor crops.`);
      metrics.push({ label: 'Frost Danger', value: `${minTemp}°C (Frost Alert)`, pass: false });
    } else {
      metrics.push({ label: 'Frost Danger', value: 'No Frost Expected', pass: true });
    }

    if (maxTemp > 32) {
      tips.push('High summer heat: water plants early before sun peaks to prevent evaporation.');
      metrics.push({ label: 'Heat Stress', value: `${maxTemp}°C Max`, pass: false });
    } else {
      metrics.push({ label: 'Heat Stress', value: `${maxTemp}°C Normal`, pass: true });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    list.push(formatAdvisory('gardening', 'Lawn & Gardening', score, 'Sprout', tips, metrics));
  }

  // 4. Solar Power Yield
  {
    let score = 100;
    const tips: string[] = [];
    const metrics: { label: string; value: string; pass: boolean }[] = [];

    const cloudCover = current.cloud_cover; // 0 - 100%
    score -= Math.round(cloudCover * 0.7);

    if (cloudCover < 20) {
      tips.push('Peak irradiance window: solar array operating at maximal generation capacity.');
      metrics.push({ label: 'Cloud Cover', value: `${cloudCover}% (Clear)`, pass: true });
    } else if (cloudCover < 60) {
      tips.push('Partial cloud scattering: expect moderate 65-80% solar generation output.');
      metrics.push({ label: 'Cloud Cover', value: `${cloudCover}% (Scattered)`, pass: true });
    } else {
      tips.push('Dense cloud deck: solar generation reduced significantly.');
      metrics.push({ label: 'Cloud Cover', value: `${cloudCover}% (Heavy)`, pass: false });
    }

    if (maxUv > 6) {
      score += 10;
      tips.push(`High UV intensity (${maxUv}): optimal solar radiation capture.`);
      metrics.push({ label: 'Solar Irradiance', value: `UV ${maxUv} (Strong)`, pass: true });
    } else {
      metrics.push({ label: 'Solar Irradiance', value: `UV ${maxUv}`, pass: false });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    list.push(formatAdvisory('solar', 'Solar Power Yield', score, 'Sun', tips, metrics));
  }

  // 5. Outdoor Walking & Fresh Air
  {
    let score = 100;
    const tips: string[] = [];
    const metrics: { label: string; value: string; pass: boolean }[] = [];

    const temp = current.temperature_2m;
    if (temp >= 15 && temp <= 25 && !isRainy && current.wind_speed_10m < 25) {
      tips.push('Pleasant outdoor environment: excellent for walking & outdoor recreation.');
      metrics.push({ label: 'Thermal Comfort', value: `${temp}°C (Optimal)`, pass: true });
    } else {
      metrics.push({ label: 'Thermal Comfort', value: `${temp}°C`, pass: temp >= 10 && temp <= 28 });
    }

    if (isRainy || isStorm) {
      score -= 40;
      tips.push('Active precipitation: bring waterproof outerwear.');
      metrics.push({ label: 'Precipitation', value: 'Wet Weather', pass: false });
    } else {
      metrics.push({ label: 'Precipitation', value: 'Clear', pass: true });
    }

    if (maxUv >= 7) {
      score -= 15;
      tips.push('High UV: wear wide-brim hat or seek shaded walking trails.');
      metrics.push({ label: 'UV Index', value: `UV ${maxUv}`, pass: false });
    } else {
      metrics.push({ label: 'UV Index', value: `UV ${maxUv} (Safe)`, pass: true });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    list.push(formatAdvisory('walking', 'Outdoor Walking & Fresh Air', score, 'Footprints', tips, metrics));
  }

  // 6. Laundry & Clothing Drying
  {
    let score = 100;
    const tips: string[] = [];
    const metrics: { label: string; value: string; pass: boolean }[] = [];

    const humidity = current.relative_humidity_2m;
    if (humidity > 75) {
      score -= 40;
      tips.push(`High atmospheric humidity (${humidity}%): outdoor clothes drying will be slow.`);
      metrics.push({ label: 'Relative Humidity', value: `${humidity}% (High)`, pass: false });
    } else if (humidity < 45) {
      tips.push(`Low humidity (${humidity}%): rapid drying times for heavy fabrics.`);
      metrics.push({ label: 'Relative Humidity', value: `${humidity}% (Optimal)`, pass: true });
    } else {
      metrics.push({ label: 'Relative Humidity', value: `${humidity}% (Moderate)`, pass: true });
    }

    if (isRainy || maxPrecipProb > 50) {
      score -= 50;
      tips.push('High chance of rain: indoor drying or dryer machine recommended.');
      metrics.push({ label: 'Rain Risk', value: `${maxPrecipProb}% chance`, pass: false });
    } else {
      metrics.push({ label: 'Rain Risk', value: 'Dry Forecast', pass: true });
    }

    if (current.wind_speed_10m >= 12) {
      score += 15;
      tips.push(`Breezy wind (${current.wind_speed_10m} km/h): accelerates evaporation.`);
      metrics.push({ label: 'Air Circulation', value: `${current.wind_speed_10m} km/h Wind`, pass: true });
    } else {
      metrics.push({ label: 'Air Circulation', value: `${current.wind_speed_10m} km/h`, pass: false });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    list.push(formatAdvisory('laundry', 'Laundry & Clothing Drying', score, 'Shirt', tips, metrics));
  }

  return list;
}

function formatAdvisory(
  id: string,
  activity: string,
  score: number,
  icon: string,
  tips: string[],
  metrics: { label: string; value: string; pass: boolean }[]
): ActivityAdvisory {
  let status: 'Excellent' | 'Good' | 'Moderate' | 'Poor' = 'Excellent';
  let color = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10';
  let badgeText = 'text-emerald-400 border-emerald-500/30';

  if (score >= 80) {
    status = 'Excellent';
    color = 'text-emerald-400';
    badgeBg = 'bg-emerald-500/10 border border-emerald-500/30';
    badgeText = 'text-emerald-400';
  } else if (score >= 60) {
    status = 'Good';
    color = 'text-sky-400';
    badgeBg = 'bg-sky-500/10 border border-sky-500/30';
    badgeText = 'text-sky-400';
  } else if (score >= 40) {
    status = 'Moderate';
    color = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 border border-amber-500/30';
    badgeText = 'text-amber-400';
  } else {
    status = 'Poor';
    color = 'text-rose-400';
    badgeBg = 'bg-rose-500/10 border border-rose-500/30';
    badgeText = 'text-rose-400';
  }

  return {
    id,
    activity,
    score,
    status,
    color,
    badgeBg,
    badgeText,
    icon,
    summary: tips[0] ?? 'Standard meteorological conditions.',
    tips,
    metrics,
  };
}
