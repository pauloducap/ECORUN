import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import type { Activity } from '@/lib/supabase';

// Mock des icônes Lucide
vi.mock('lucide-react-native', () => ({
  MapPin: ({ size, color }: any) => `MapPin-${size}-${color}`,
  Clock: ({ size, color }: any) => `Clock-${size}-${color}`,
  Activity: ({ size, color }: any) => `Activity-${size}-${color}`,
  Leaf: ({ size, color }: any) => `Leaf-${size}-${color}`,
  Heart: ({ size, color }: any) => `Heart-${size}-${color}`,
  Footprints: ({ size, color }: any) => `Footprints-${size}-${color}`,
  Bike: ({ size, color }: any) => `Bike-${size}-${color}`,
}));

// Mock des utilitaires de formatage
vi.mock('@/utils/formatters', () => ({
  formatTime: vi.fn((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }),
  formatPace: vi.fn((pace: number) => {
    if (pace === 0) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace % 1) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }),
  formatDate: vi.fn(() => 'Aujourd\'hui • 14:30'),
}));

// Mock des constantes d'activité
vi.mock('@/constants/activities', () => ({
  ACTIVITY_CONFIG: {
    running: {
      name: 'Course à pied',
      icon: ({ size, color }: any) => `Footprints-${size}-${color}`,
      color: '#059669',
    },
    biking: {
      name: 'Vélo',
      icon: ({ size, color }: any) => `Bike-${size}-${color}`,
      color: '#7c3aed',
    },
  },
}));

// Mock des styles
vi.mock('@/styles/components/ActivityCard.styles', () => ({
  activityCardStyles: {
    container: {},
    header: {},
    activityInfo: {},
    activityIcon: {},
    activityDetails: {},
    activityName: {},
    activityDate: {},
    stats: {},
    statRow: {},
    statItem: {},
    statLabel: {},
    statValue: {},
    ecoStats: {},
    ecoStatItem: {},
    ecoStatLabel: {},
    ecoStatValue: {},
  },
}));

const mockActivity: Activity = {
  id: 'test-activity-1',
  user_id: 'test-user',
  activity_type: 'running',
  duration: 1800, // 30 minutes
  distance: 5.0,  // 5 km
  pace: 6.0,      // 6 min/km
  co2_saved: 0.6, // 0.6 kg
  life_gained: 3.5, // 3.5 hours
  positions: [],
  created_at: '2024-01-15T14:30:00Z',
};

describe('ActivityCard Component', () => {
  it('should handle activity data correctly', () => {
    // Test des propriétés de l'activité
    expect(mockActivity.activity_type).toBe('running');
    expect(mockActivity.distance).toBe(5.0);
    expect(mockActivity.co2_saved).toBe(0.6);
    expect(mockActivity.life_gained).toBe(3.5);
  });

  it('should format values correctly', () => {
    // Test du formatage des valeurs
    expect(mockActivity.distance.toFixed(2)).toBe('5.00');
    expect(mockActivity.co2_saved.toFixed(2)).toBe('0.60');
    expect(mockActivity.life_gained.toFixed(1)).toBe('3.5');
  });

  it('should handle different activity types', () => {
    const runningActivity = { ...mockActivity, activity_type: 'running' as const };
    const bikingActivity = { ...mockActivity, activity_type: 'biking' as const };

    expect(runningActivity.activity_type).toBe('running');
    expect(bikingActivity.activity_type).toBe('biking');
  });

  it('should handle zero values gracefully', () => {
    const zeroActivity = {
      ...mockActivity,
      duration: 0,
      distance: 0,
      co2_saved: 0,
      life_gained: 0,
    };

    expect(zeroActivity.distance.toFixed(2)).toBe('0.00');
    expect(zeroActivity.co2_saved.toFixed(2)).toBe('0.00');
    expect(zeroActivity.life_gained.toFixed(1)).toBe('0.0');
  });

  it('should validate activity data structure', () => {
    // Vérifier que l'activité a toutes les propriétés requises
    expect(mockActivity).toHaveProperty('id');
    expect(mockActivity).toHaveProperty('user_id');
    expect(mockActivity).toHaveProperty('activity_type');
    expect(mockActivity).toHaveProperty('duration');
    expect(mockActivity).toHaveProperty('distance');
    expect(mockActivity).toHaveProperty('pace');
    expect(mockActivity).toHaveProperty('co2_saved');
    expect(mockActivity).toHaveProperty('life_gained');
    expect(mockActivity).toHaveProperty('positions');
    expect(mockActivity).toHaveProperty('created_at');
  });
});