import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Position } from './supabase';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Interface pour les données de tracking
interface BackgroundTrackingData {
  positions: Position[];
  startTime: number;
  activityType: 'running' | 'biking';
  isActive: boolean;
}

// Stockage temporaire des données de tracking
let trackingData: BackgroundTrackingData = {
  positions: [],
  startTime: 0,
  activityType: 'running',
  isActive: false,
};

// Callbacks pour communiquer avec l'interface
let onPositionUpdate: ((position: Position) => void) | null = null;
let onTrackingStop: (() => void) | null = null;

// Définir la tâche de tracking en arrière-plan
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Erreur background location:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    
    if (locations && locations.length > 0 && trackingData.isActive) {
      const location = locations[0];
      const newPosition: Position = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        speed: location.coords.speed ? Math.max(0, location.coords.speed * 3.6) : 0,
      };

      // Ajouter la position aux données de tracking
      trackingData.positions.push(newPosition);
      
      // Notifier l'interface si elle écoute
      if (onPositionUpdate) {
        onPositionUpdate(newPosition);
      }

      console.log('📍 Position background enregistrée:', {
        lat: newPosition.latitude.toFixed(6),
        lng: newPosition.longitude.toFixed(6),
        speed: newPosition.speed?.toFixed(1)
      });
    }
  }
});

export const backgroundTrackingService = {
  // Démarrer le tracking en arrière-plan
  async startBackgroundTracking(
    activityType: 'running' | 'biking',
    onPositionCallback?: (position: Position) => void,
    onStopCallback?: () => void
  ): Promise<boolean> {
    try {
      console.log('🚀 Démarrage du tracking en arrière-plan...');

      // Vérifier si on est dans Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        console.warn('⚠️ Tracking arrière-plan non disponible dans Expo Go');
        console.log('ℹ️ Utilisez une build standalone pour cette fonctionnalité');
        return false;
      }

      // Vérifier les permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.error('❌ Permission foreground refusée');
        return false;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.error('❌ Permission background refusée');
        return false;
      }

      // Demander permission pour les notifications
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        console.warn('⚠️ Permission notifications refusée');
      }

      // Initialiser les données de tracking
      trackingData = {
        positions: [],
        startTime: Date.now(),
        activityType,
        isActive: true,
      };

      // Configurer les callbacks
      onPositionUpdate = onPositionCallback || null;
      onTrackingStop = onStopCallback || null;

      // Démarrer la tâche de localisation en arrière-plan
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000, // Mise à jour chaque seconde
        distanceInterval: 1, // Mise à jour tous les mètres
        foregroundService: {
          notificationTitle: 'EcoRun - Activité en cours',
          notificationBody: `Tracking ${activityType === 'running' ? 'course' : 'vélo'} en cours...`,
          notificationColor: '#059669',
        },
      });

      // Afficher une notification persistante
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'EcoRun - Activité en cours',
          body: `Votre ${activityType === 'running' ? 'course' : 'session vélo'} est trackée en arrière-plan`,
          data: { activityType },
        },
        trigger: null, // Notification immédiate
      });

      console.log('✅ Tracking en arrière-plan démarré');
      return true;

    } catch (error) {
      console.error('❌ Erreur démarrage background tracking:', error);
      return false;
    }
  },

  // Arrêter le tracking en arrière-plan
  async stopBackgroundTracking(): Promise<Position[]> {
    try {
      console.log('🛑 Arrêt du tracking en arrière-plan...');

      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        console.log('ℹ️ Arrêt du tracking (mode Expo Go)');
        return [];
      }

      // Marquer comme inactif
      trackingData.isActive = false;

      // Arrêter la tâche de localisation
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }

      // Annuler les notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Notifier l'interface
      if (onTrackingStop) {
        onTrackingStop();
      }

      // Récupérer les positions enregistrées
      const positions = [...trackingData.positions];
      
      // Réinitialiser les données
      trackingData = {
        positions: [],
        startTime: 0,
        activityType: 'running',
        isActive: false,
      };

      onPositionUpdate = null;
      onTrackingStop = null;

      console.log(`✅ Tracking arrêté - ${positions.length} positions enregistrées`);
      return positions;

    } catch (error) {
      console.error('❌ Erreur arrêt background tracking:', error);
      return [];
    }
  },

  // Vérifier si le tracking est actif
  isTrackingActive(): boolean {
    return trackingData.isActive;
  },

  // Obtenir les données actuelles
  getCurrentTrackingData(): BackgroundTrackingData {
    return { ...trackingData };
  },

  // Vérifier les permissions
  async checkPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
    notifications: boolean;
  }> {
    const foregroundStatus = await Location.getForegroundPermissionsAsync();
    const backgroundStatus = await Location.getBackgroundPermissionsAsync();
    const notificationStatus = await Notifications.getPermissionsAsync();

    return {
      foreground: foregroundStatus.status === 'granted',
      background: backgroundStatus.status === 'granted',
      notifications: notificationStatus.status === 'granted',
    };
  },

  // Demander toutes les permissions nécessaires
  async requestAllPermissions(): Promise<boolean> {
    try {
      // Vérifier si on est dans Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        console.warn('⚠️ Expo Go détecté - Permissions arrière-plan limitées');
        // Dans Expo Go, on demande seulement les permissions de base
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('❌ Permission de localisation refusée');
          return false;
        }
        console.log('✅ Permissions de base accordées (Expo Go)');
        return true;
      }

      // Permission foreground
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        return false;
      }

      // Permission background
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        return false;
      }

      // Permission notifications
      const isExpoGo2 = Constants.appOwnership === 'expo';
      
      if (isExpoGo2) {
        console.log('ℹ️ Notifications limitées dans Expo Go');
      }

      await Notifications.requestPermissionsAsync();

      return true;
    } catch (error) {
      console.error('Erreur demande permissions:', error);
      return false;
    }
  },
};