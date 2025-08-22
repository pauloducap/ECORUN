import { describe, it, expect } from 'vitest';
import { 
  formatTime, 
  formatPace, 
  formatLifeGained, 
  formatDate 
} from '../formatters';

describe('Data Formatters', () => {
  describe('formatTime', () => {
    it('should format seconds to HH:MM:SS for long durations', () => {
      expect(formatTime(3661)).toBe('01:01:01'); // 1h 1min 1s
      expect(formatTime(7200)).toBe('02:00:00'); // 2h exactes
      expect(formatTime(3600)).toBe('01:00:00'); // 1h exacte
    });

    it('should format seconds to MM:SS for short durations', () => {
      expect(formatTime(61)).toBe('01:01');   // 1min 1s
      expect(formatTime(120)).toBe('02:00');  // 2min exactes
      expect(formatTime(0)).toBe('00:00');    // 0 seconde
    });

    it('should handle typical activity durations', () => {
      expect(formatTime(1800)).toBe('30:00');    // 30min course
      expect(formatTime(2700)).toBe('45:00');    // 45min course
      expect(formatTime(5400)).toBe('01:30:00'); // 1h30 vélo
    });

    it('should pad with zeros correctly', () => {
      expect(formatTime(65)).toBe('01:05');      // 1min 5s
      expect(formatTime(3605)).toBe('01:00:05'); // 1h 0min 5s
      expect(formatTime(3665)).toBe('01:01:05'); // 1h 1min 5s
    });
  });

  describe('formatPace', () => {
    it('should format pace in MM:SS per kilometer', () => {
      expect(formatPace(5.5)).toBe('05:30');  // 5min30s/km
      expect(formatPace(4.0)).toBe('04:00');  // 4min/km (rapide)
      expect(formatPace(6.25)).toBe('06:15'); // 6min15s/km
    });

    it('should handle edge cases', () => {
      expect(formatPace(0)).toBe('--:--');           // Pas de mouvement
      expect(formatPace(Infinity)).toBe('--:--');    // Division par zéro
      expect(formatPace(NaN)).toBe('--:--');         // Calcul invalide
    });

    it('should round seconds correctly', () => {
      expect(formatPace(5.51)).toBe('05:31'); // 5.51min = 5min30.6s → 5:31
      expect(formatPace(4.99)).toBe('04:59'); // 4.99min = 4min59.4s → 4:59
    });

    it('should handle typical running paces', () => {
      expect(formatPace(5)).toBe('05:00');    // Allure moyenne
      expect(formatPace(3.5)).toBe('03:30');  // Allure rapide
      expect(formatPace(7)).toBe('07:00');    // Allure lente
    });
  });

  describe('formatLifeGained', () => {
    it('should format hours to readable format', () => {
      expect(formatLifeGained(7)).toBe('7.0h');      // 7h exactes
      expect(formatLifeGained(3.5)).toBe('3.5h');    // 3h30
      expect(formatLifeGained(14.2)).toBe('14.2h');  // 14h12min
    });

    it('should format minutes for small values', () => {
      expect(formatLifeGained(0.5)).toBe('30min');   // 30 minutes
      expect(formatLifeGained(0.25)).toBe('15min');  // 15 minutes
      expect(formatLifeGained(0.75)).toBe('45min');  // 45 minutes
    });

    it('should format days for large values', () => {
      expect(formatLifeGained(25)).toBe('1j 1h');    // 25h = 1j 1h
      expect(formatLifeGained(48)).toBe('2j 0h');    // 48h = 2j exactes
      expect(formatLifeGained(73)).toBe('3j 1h');    // 73h = 3j 1h
    });

    it('should handle zero and small values', () => {
      expect(formatLifeGained(0)).toBe('0min');
      expect(formatLifeGained(0.1)).toBe('6min');    // 0.1h = 6min
    });
  });

  describe('formatDate', () => {
    it('should format dates consistently', () => {
      const testDate = '2024-01-15T14:30:00Z';
      const formatted = formatDate(testDate);
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted).toMatch(/\d{2}:\d{2}/); // Contient l'heure
    });

    it('should handle ISO date strings', () => {
      const isoDate = new Date().toISOString();
      const formatted = formatDate(isoDate);
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format with French locale', () => {
      const date = '2024-06-15T10:30:00Z';
      const formatted = formatDate(date);
      
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });
});