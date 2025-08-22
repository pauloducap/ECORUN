/**
 * GPS data optimization utilities
 */

export interface RawPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  accuracy?: number;
}

export interface OptimizedPosition {
  lat: number;
  lng: number;
  t: number; // timestamp offset from start
  s?: number; // speed (optional)
}

/**
 * Optimize GPS positions for storage
 * - Reduce precision to ~1m accuracy
 * - Use relative timestamps
 * - Remove redundant points
 * - Compress field names
 */
export const optimizePositions = (positions: RawPosition[]): OptimizedPosition[] => {
  if (positions.length === 0) return [];

  const startTime = positions[0].timestamp;
  const optimized: OptimizedPosition[] = [];
  let lastPos: RawPosition | null = null;

  for (const pos of positions) {
    // Skip if too close to last position (< 2 meters)
    if (lastPos && calculateDistance(lastPos, pos) < 2) {
      continue;
    }

    // Skip if speed is unrealistic (> 80 km/h for any activity)
    if (pos.speed && pos.speed > 80) {
      continue;
    }

    optimized.push({
      lat: Math.round(pos.latitude * 1000000) / 1000000, // ~1m precision
      lng: Math.round(pos.longitude * 1000000) / 1000000,
      t: Math.round((pos.timestamp - startTime) / 1000), // seconds from start
      s: pos.speed ? Math.round(pos.speed * 10) / 10 : undefined, // 0.1 km/h precision
    });

    lastPos = pos;
  }

  return optimized;
};

/**
 * Restore optimized positions to full format
 */
export const restorePositions = (
  optimized: OptimizedPosition[], 
  startTime: number
): RawPosition[] => {
  return optimized.map(pos => ({
    latitude: pos.lat,
    longitude: pos.lng,
    timestamp: startTime + (pos.t * 1000),
    speed: pos.s,
  }));
};

/**
 * Calculate distance between two positions (Haversine formula)
 */
const calculateDistance = (pos1: RawPosition, pos2: RawPosition): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
  const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Generate GPX export if needed
 */
export const generateGPX = (positions: RawPosition[], activityName: string): string => {
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="EcoRun">
  <trk>
    <name>${activityName}</name>
    <trkseg>`;

  const gpxFooter = `    </trkseg>
  </trk>
</gpx>`;

  const trackPoints = positions.map(pos => 
    `      <trkpt lat="${pos.latitude}" lon="${pos.longitude}">
        <time>${new Date(pos.timestamp).toISOString()}</time>
        ${pos.speed ? `<extensions><speed>${pos.speed}</speed></extensions>` : ''}
      </trkpt>`
  ).join('\n');

  return gpxHeader + '\n' + trackPoints + '\n' + gpxFooter;
};