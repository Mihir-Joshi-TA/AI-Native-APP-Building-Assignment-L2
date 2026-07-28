import React from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Wind,
  Compass,
  Droplets,
  Gauge,
  Thermometer,
  Eye,
  Sunset,
  Sunrise,
  Activity,
  Car,
  Sprout,
  Footprints,
  Shirt,
  Search,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  LucideProps,
} from 'lucide-react';

interface WeatherIconProps extends LucideProps {
  name: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Sun':
      return <Sun {...props} />;
    case 'SunMedium':
      return <SunMedium {...props} />;
    case 'Moon':
      return <Moon {...props} />;
    case 'CloudSun':
      return <CloudSun {...props} />;
    case 'CloudMoon':
      return <CloudMoon {...props} />;
    case 'Cloud':
      return <Cloud {...props} />;
    case 'CloudFog':
      return <CloudFog {...props} />;
    case 'CloudDrizzle':
      return <CloudDrizzle {...props} />;
    case 'CloudRain':
      return <CloudRain {...props} />;
    case 'CloudRainWind':
      return <CloudRainWind {...props} />;
    case 'CloudSnow':
      return <CloudSnow {...props} />;
    case 'Snowflake':
      return <Snowflake {...props} />;
    case 'CloudLightning':
      return <CloudLightning {...props} />;
    case 'Wind':
      return <Wind {...props} />;
    case 'Compass':
      return <Compass {...props} />;
    case 'Droplets':
      return <Droplets {...props} />;
    case 'Gauge':
      return <Gauge {...props} />;
    case 'Thermometer':
      return <Thermometer {...props} />;
    case 'Eye':
      return <Eye {...props} />;
    case 'Sunrise':
      return <Sunrise {...props} />;
    case 'Sunset':
      return <Sunset {...props} />;
    case 'Activity':
      return <Activity {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'Sprout':
      return <Sprout {...props} />;
    case 'Footprints':
      return <Footprints {...props} />;
    case 'Shirt':
      return <Shirt {...props} />;
    case 'Search':
      return <Search {...props} />;
    case 'MapPin':
      return <MapPin {...props} />;
    case 'RefreshCw':
      return <RefreshCw {...props} />;
    case 'SlidersHorizontal':
      return <SlidersHorizontal {...props} />;
    case 'ChevronDown':
      return <ChevronDown {...props} />;
    case 'ChevronUp':
      return <ChevronUp {...props} />;
    case 'X':
      return <X {...props} />;
    case 'Clock':
      return <Clock {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...props} />;
    case 'XCircle':
      return <XCircle {...props} />;
    default:
      return <Cloud {...props} />;
  }
};
