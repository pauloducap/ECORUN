import { describe, it, expect } from 'vitest';
import { 
  optimizePositions, 
  restorePositions, 
  generateGPX 
} from '../gpsOptimizer';
import type { RawPosition, OptimizedPosition } from '../gpsOptimizer';

describe('GPS Optimizer', () => {
  const mockPositions: RawPosition[] = [
    { latitude: 48.8566, longitude: 2.3522, timestamp: 1000000, speed: 10 },
    { latitude: 48.8567, longitude: 2.3523, timestamp: 1001000, speed: 12 },
    { latitude: 48.8568, longitude: 2.3524, timestamp: 1002000, speed: 11 },
  ];

  describe('optimizePositions', () => {
    it('should compress GPS positions correctly', () => {
      const optimized = optimizePositions(mockPositions);
      
      expect(optimized).toHaveLength(3);
      expect(optimized[0]).toEqual({
        lat: 48.856600,  // Précision réduite à ~1m
        lng: 2.352200,
        t: 0,            // Temps relatif au début
        s: 10            // Vitesse conservée
      });
    });

    it('should filter positions too close together', () => {
      const closePositions: RawPosition[] = [
        { latitude: 48.8566, longitude: 2.3522, timestamp: 1000000 },
        { latitude: 48.8566, longitude: 2.3522, timestamp: 1001000 }, // Même position
        { latitude: 48.8567, longitude: 2.3523, timestamp: 1002000 },
      ];
      
      const optimized = optimizePositions(closePositions);
      
      expect(optimized).toHaveLength(2); // Position dupliquée filtrée
    });

    it('should filter unrealistic speeds', () => {
      const fastPositions: RawPosition[] = [
        { latitude: 48.8566, longitude: 2.3522, timestamp: 1000000, speed: 10 },
        { latitude: 48.8567, longitude: 2.3523, timestamp: 1001000, speed: 150 }, // Trop rapide
        { latitude: 48.8568, longitude: 2.3524, timestamp: 1002000, speed: 12 },
      ];
      
      const optimized = optimizePositions(fastPositions);
      
      expect(optimized).toHaveLength(2); // Position avec vitesse aberrante filtrée
    });

    it('should handle empty array', () => {
      const optimized = optimizePositions([]);
      expect(optimized).toEqual([]);
    });

    it('should reduce precision to ~1 meter', () => {
      const precisePosition: RawPosition[] = [
        { latitude: 48.85661234567, longitude: 2.35221234567, timestamp: 1000000 }
      ];
      
      const optimized = optimizePositions(precisePosition);
      
      expect(optimized[0].lat).toBe(48.856612); // 6 décimales max
      expect(optimized[0].lng).toBe(2.352212);
    });
  });

  describe('restorePositions', () => {
    it('should restore optimized positions to full format', () => {
      const optimized: OptimizedPosition[] = [
        { lat: 48.856600, lng: 2.352200, t: 0, s: 10 },
        { lat: 48.856700, lng: 2.352300, t: 1, s: 12 },
      ];
      const startTime = 1000000;
      
      const restored = restorePositions(optimized, startTime);
      
      expect(restored).toHaveLength(2);
      expect(restored[0]).toEqual({
        latitude: 48.856600,
        longitude: 2.352200,
        timestamp: 1000000,    // startTime + (t * 1000)
        speed: 10
      });
      expect(restored[1]).toEqual({
        latitude: 48.856700,
        longitude: 2.352300,
        timestamp: 1001000,    // startTime + (1 * 1000)
        speed: 12
      });
    });

    it('should handle positions without speed', () => {
      const optimized: OptimizedPosition[] = [
        { lat: 48.856600, lng: 2.352200, t: 0 }, // Pas de vitesse
      ];
      
      const restored = restorePositions(optimized, 1000000);
      
      expect(restored[0].speed).toBeUndefined();
    });
  });

  describe('generateGPX', () => {
    it('should generate valid GPX format', () => {
      const gpx = generateGPX(mockPositions, 'Test Activity');
      
      expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(gpx).toContain('<gpx version="1.1" creator="EcoRun">');
      expect(gpx).toContain('<name>Test Activity</name>');
      expect(gpx).toContain('<trkpt lat="48.8566" lon="2.3522">');
      expect(gpx).toContain('</gpx>');
    });

    it('should include timestamps in ISO format', () => {
      const gpx = generateGPX(mockPositions, 'Test');
      
      expect(gpx).toContain('<time>');
      expect(gpx).toContain('</time>');
      // Vérifier format ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
      expect(gpx).toMatch(/<time>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z<\/time>/);
    });

    it('should include speed data when available', () => {
      const gpx = generateGPX(mockPositions, 'Test');
      
      expect(gpx).toContain('<extensions>');
      expect(gpx).toContain('<speed>10</speed>');
      expect(gpx).toContain('</extensions>');
    });

    it('should handle empty positions array', () => {
      const gpx = generateGPX([], 'Empty Activity');
      
      expect(gpx).toContain('<gpx version="1.1" creator="EcoRun">');
      expect(gpx).toContain('<name>Empty Activity</name>');
      expect(gpx).toContain('<trkseg>');
      expect(gpx).toContain('</trkseg>');
      expect(gpx).not.toContain('<trkpt');
    });
  });

  describe('compression efficiency', () => {
    it('should significantly reduce data size', () => {
      const largeDataset: RawPosition[] = Array.from({ length: 1000 }, (_, i) => ({
        latitude: 48.8566 + (i * 0.0001),
        longitude: 2.3522 + (i * 0.0001),
        timestamp: 1000000 + (i * 1000),
        speed: 10 + Math.random() * 5,
        accuracy: 5 + Math.random() * 10,
      }));
      
      const optimized = optimizePositions(largeDataset);
      
      // Vérifier que l'optimisation réduit significativement les données
      const originalSize = JSON.stringify(largeDataset).length;
      const optimizedSize = JSON.stringify(optimized).length;
      
      expect(optimizedSize).toBeLessThan(originalSize * 0.7); // Au moins 30% de réduction
    });

    it('should maintain essential GPS accuracy', () => {
      const optimized = optimizePositions(mockPositions);
      const restored = restorePositions(optimized, mockPositions[0].timestamp);
      
      // Vérifier que la précision reste acceptable (~1m)
      expect(Math.abs(restored[0].latitude - mockPositions[0].latitude)).toBeLessThan(0.00001);
      expect(Math.abs(restored[0].longitude - mockPositions[0].longitude)).toBeLessThan(0.00001);
    });
  });
});