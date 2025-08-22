import { describe, it, expect } from 'vitest';
import { 
  calculateDistance, 
  calculateCO2Savings, 
  calculateLifeGained, 
  calculatePace,
  filterSpeed 
} from '../calculations';
import type { Position } from '@/lib/supabase';

describe('GPS Calculations', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two GPS points using Haversine formula', () => {
      const pos1: Position = { 
        latitude: 48.8566, 
        longitude: 2.3522, 
        timestamp: Date.now() 
      };
      const pos2: Position = { 
        latitude: 48.8576, 
        longitude: 2.3532, 
        timestamp: Date.now() + 1000 
      };
      
      const distance = calculateDistance(pos1, pos2);
      
      // Distance attendue ~133m entre ces deux points de Paris
      expect(distance).toBeCloseTo(133.1, 0);
    });

    it('should return 0 for identical positions', () => {
      const pos: Position = { 
        latitude: 48.8566, 
        longitude: 2.3522, 
        timestamp: Date.now() 
      };
      
      const distance = calculateDistance(pos, pos);
      
      expect(distance).toBe(0);
    });

    it('should handle edge cases with extreme coordinates', () => {
      const northPole: Position = { 
        latitude: 90, 
        longitude: 0, 
        timestamp: Date.now() 
      };
      const southPole: Position = { 
        latitude: -90, 
        longitude: 0, 
        timestamp: Date.now() + 1000 
      };
      
      const distance = calculateDistance(northPole, southPole);
      
      // Distance pôle à pôle ~20015km (demi-circonférence terrestre)
      expect(distance).toBeCloseTo(20015000, -3);
    });
  });

  describe('calculateCO2Savings', () => {
    it('should calculate CO2 savings correctly for typical distances', () => {
      expect(calculateCO2Savings(10)).toBe(1.2); // 10km * 0.12kg/km
      expect(calculateCO2Savings(5)).toBe(0.6);  // 5km * 0.12kg/km
      expect(calculateCO2Savings(0)).toBe(0);    // 0km = 0 économie
    });

    it('should handle decimal distances', () => {
      expect(calculateCO2Savings(2.5)).toBeCloseTo(0.3, 2);
      expect(calculateCO2Savings(0.1)).toBeCloseTo(0.012, 3);
    });

    it('should be based on average car emissions (120g CO2/km)', () => {
      const distance = 15.7;
      expect(calculateCO2Savings(distance)).toBe(distance * 0.12);
    });
  });

  describe('calculateLifeGained', () => {
    it('should calculate life expectancy gain (1h activity = 7h life)', () => {
      expect(calculateLifeGained(1)).toBe(7);    // 1h = 7h de vie
      expect(calculateLifeGained(0.5)).toBe(3.5); // 30min = 3.5h
      expect(calculateLifeGained(2)).toBe(14);   // 2h = 14h
    });

    it('should handle zero duration', () => {
      expect(calculateLifeGained(0)).toBe(0);
    });

    it('should be based on scientific studies', () => {
      const duration = 1.25; // 1h15min
      expect(calculateLifeGained(duration)).toBe(duration * 7);
    });
  });

  describe('calculatePace', () => {
    it('should calculate pace in minutes per kilometer', () => {
      // 5km en 25 minutes = 5 min/km
      expect(calculatePace(5, 1500)).toBe(5); // 1500s = 25min
      
      // 10km en 50 minutes = 5 min/km  
      expect(calculatePace(10, 3000)).toBe(5); // 3000s = 50min
    });

    it('should return 0 for zero distance', () => {
      expect(calculatePace(0, 1800)).toBe(0);
    });

    it('should handle typical running paces', () => {
      // Course lente : 6 min/km
      expect(calculatePace(5, 1800)).toBe(6); // 5km en 30min
      
      // Course rapide : 4 min/km
      expect(calculatePace(10, 2400)).toBe(4); // 10km en 40min
    });
  });

  describe('filterSpeed', () => {
    it('should filter unrealistic speeds for running', () => {
      expect(filterSpeed(100, 'running')).toBe(0); // Trop rapide
      expect(filterSpeed(15, 'running')).toBe(15); // Vitesse normale
      expect(filterSpeed(-5, 'running')).toBe(0);  // Vitesse négative
    });

    it('should filter unrealistic speeds for biking', () => {
      expect(filterSpeed(150, 'biking')).toBe(0); // Trop rapide
      expect(filterSpeed(25, 'biking')).toBe(25); // Vitesse normale
      expect(filterSpeed(-10, 'biking')).toBe(0); // Vitesse négative
    });

    it('should have different limits for different activities', () => {
      const speed = 60; // 60 km/h
      
      expect(filterSpeed(speed, 'running')).toBe(0);  // Impossible en course
      expect(filterSpeed(speed, 'biking')).toBe(60);  // Possible en vélo
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle NaN and Infinity values', () => {
      expect(calculateCO2Savings(NaN)).toBe(0);
      expect(calculateCO2Savings(Infinity)).toBe(0);
      expect(calculateLifeGained(NaN)).toBe(0);
      expect(calculateLifeGained(Infinity)).toBe(0);
      expect(calculatePace(0, 0)).toBe(0);
    });

    it('should handle negative values appropriately', () => {
      expect(calculateCO2Savings(-5)).toBe(-0.6); // Négatif possible pour debug
      expect(calculateLifeGained(-1)).toBe(-7);   // Négatif possible pour debug
    });
  });
});