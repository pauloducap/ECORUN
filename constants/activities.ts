import { Footprints, Bike } from 'lucide-react-native';
import colors from '@/styles/colors';

export const ACTIVITY_CONFIG = {
  running: {
    name: 'Course à pied',
    icon: Footprints,
    color: colors.running,
    co2Description: '~0.12 kg CO2/km économisé',
  },
  biking: {
    name: 'Vélo',
    icon: Bike,
    color: colors.biking,
    co2Description: '~0.12 kg CO2/km économisé',
  },
} as const;

export type ActivityType = keyof typeof ACTIVITY_CONFIG;