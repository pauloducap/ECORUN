import { Position } from '@/lib/supabase';

// CO2 emissions per km for different transport modes (in kg)
export const CO2_EMISSIONS = {
  car: 0.12, // Average car emissions
  running: 0, // No direct emissions
  biking: 0, // No direct emissions
} as const;

/**
 * Calculate distance between two GPS points using Haversine formula
 */
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
  const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
};

/**
 * Calculate CO2 savings compared to driving
 */
export const calculateCO2Savings = (distanceKm: number): number => {
  if (isNaN(distanceKm) || !isFinite(distanceKm)) return 0;
  return distanceKm * CO2_EMISSIONS.car;
};

/**
 * Calculate life expectancy gained (1 hour of activity = 7 hours of life)
 */
export const calculateLifeGained = (durationHours: number): number => {
  if (isNaN(durationHours) || !isFinite(durationHours)) return 0;
  return durationHours * 7;
};

/**
 * Calculate pace (minutes per kilometer)
 */
export const calculatePace = (distanceKm: number, durationSeconds: number): number => {
  if (distanceKm === 0) return 0;
  const durationMinutes = durationSeconds / 60;
  return durationMinutes / distanceKm;
};

/**
 * Filter unrealistic speed values
 */
export const filterSpeed = (speed: number, activityType: 'running' | 'biking'): number => {
  const maxSpeed = activityType === 'running' ? 50 : 80; // km/h
  const minSpeed = 0;
  
  if (speed > maxSpeed || speed < minSpeed) {
    return 0;
  }
  return speed;
};