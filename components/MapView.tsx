import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Map, Satellite, Mountain } from 'lucide-react-native';
import { Position } from '@/lib/supabase';
import { colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles/spacing';
import { typography } from '@/styles/typography';

type MapTheme = 'standard' | 'satellite' | 'terrain';

const MAP_THEMES = {
  standard: {
    name: 'Standard',
    icon: Map,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite',
    icon: Satellite,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics'
  },
  terrain: {
    name: 'Terrain',
    icon: Mountain,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors'
  }
};

interface MapViewProps {
  positions: Position[];
  style?: any;
}

export const MapView: React.FC<MapViewProps> = ({ positions, style }) => {
  const [currentTheme, setCurrentTheme] = React.useState<MapTheme>('standard');

  // Si pas de positions, afficher un message
  if (!positions || positions.length === 0) {
    return (
      <View style={[styles.container, style, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Aucun trajet GPS enregistré</Text>
      </View>
    );
  }

  // Créer le HTML avec Leaflet
  const createMapHTML = () => {
    const center = positions.length > 0 
      ? [positions[0].latitude, positions[0].longitude]
      : [48.8566, 2.3522]; // Paris par défaut

    const polylinePoints = positions
      .map(pos => `[${pos.latitude}, ${pos.longitude}]`)
      .join(',');

    const theme = MAP_THEMES[currentTheme];
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialiser la carte
          const map = L.map('map').setView([${center[0]}, ${center[1]}], 13);
          
          // Ajouter les tuiles selon le thème
          L.tileLayer('${theme.url}', {
            attribution: '${theme.attribution}',
            maxZoom: 18
          }).addTo(map);
          
          ${positions.length > 0 ? `
          // Ajouter le trajet
          const polyline = L.polyline([${polylinePoints}], {
            color: '#059669',
            weight: 5,
            opacity: 0.9,
            dashArray: '${currentTheme === 'satellite' ? '10, 5' : 'none'}'
          }).addTo(map);
          
          // Centrer sur le trajet
          map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
          
          // Ajouter des marqueurs de début et fin
          const startIcon = L.divIcon({
            html: '<div style="background: #059669; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">🏁</div>',
            className: 'custom-marker',
            iconSize: [24, 24]
          });
          
          const endIcon = L.divIcon({
            html: '<div style="background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">🏆</div>',
            className: 'custom-marker',
            iconSize: [24, 24]
          });
          
          L.marker([${positions[0].latitude}, ${positions[0].longitude}], { icon: startIcon })
            .addTo(map)
            .bindPopup('<b>🏁 Début</b><br>Départ de votre activité');
          
          L.marker([${positions[positions.length - 1].latitude}, ${positions[positions.length - 1].longitude}], { icon: endIcon })
            .addTo(map)
            .bindPopup('<b>🏆 Arrivée</b><br>Fin de votre activité');
          ` : ''}
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Sélecteur de thème */}
      <View style={styles.themeSelector}>
        {Object.entries(MAP_THEMES).map(([key, theme]) => {
          const ThemeIcon = theme.icon;
          const isActive = currentTheme === key;
          
          return (
            <TouchableOpacity
              key={key}
              style={[styles.themeButton, isActive && styles.themeButtonActive]}
              onPress={() => setCurrentTheme(key as MapTheme)}
              activeOpacity={0.7}
            >
              <ThemeIcon 
                size={16} 
                color={isActive ? colors.white : colors.gray600} 
              />
              <Text style={[
                styles.themeButtonText, 
                isActive && styles.themeButtonTextActive
              ]}>
                {theme.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <WebView
        source={{ html: createMapHTML() }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        key={currentTheme} // Force reload when theme changes
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  themeSelector: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.xs,
  },
  themeButtonActive: {
    backgroundColor: colors.primary,
  },
  themeButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  themeButtonTextActive: {
    color: colors.white,
  },
});