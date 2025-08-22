import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { Play, Pause, Square, Leaf, Heart, ChevronDown } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { backgroundTrackingService } from '@/lib/backgroundTracking';
import { Position } from '@/lib/supabase';
import { activityService } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';
import { ACTIVITY_CONFIG, ActivityType } from '@/constants/activities';
import { useAuth } from '@/hooks/useAuth';
import { 
  calculateDistance, 
  calculateCO2Savings, 
  calculateLifeGained, 
  calculatePace,
  filterSpeed 
} from '@/utils/calculations';
import { formatTime, formatPace, formatLifeGained } from '@/utils/formatters';
import { colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles/spacing';
import { typography } from '@/styles/typography';

interface EcoMetrics {
  duration: number;
  distance: number;
  pace: number;
  co2Saved: number;
  lifeGained: number;
  activityType: ActivityType;
}

export default function EcoTracker() {
  const { activity } = useLocalSearchParams();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [metrics, setMetrics] = useState<EcoMetrics>({
    duration: 0,
    distance: 0,
    pace: 0,
    co2Saved: 0,
    lifeGained: 0,
    activityType: (activity as ActivityType) || 'running',
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isExpoGo] = useState(Constants.appOwnership === 'expo');
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [isBackgroundTracking, setIsBackgroundTracking] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const totalDistanceRef = useRef<number>(0);

  // Request location permissions
  useEffect(() => {
    (async () => {
      try {
        // Demander toutes les permissions nécessaires
        const hasAllPermissions = await backgroundTrackingService.requestAllPermissions();
        setHasLocationPermission(hasAllPermissions);
        
        if (!hasAllPermissions) {
          Alert.alert(
            'Permissions requises',
            'L\'application a besoin d\'accéder à votre position en arrière-plan pour continuer le tracking quand l\'écran est éteint.\n\nVeuillez autoriser "Toujours" dans les paramètres de localisation.'
          );
        }
      } catch (error) {
        console.error('Erreur lors de la demande de permission:', error);
      }
    })();
  }, []);

  // Update timer and eco metrics in real-time
  const updateMetrics = () => {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - startTimeRef.current - pausedDurationRef.current) / 1000);
    const elapsedHours = elapsedTime / 3600;
    const distanceKm = totalDistanceRef.current / 1000;
    const currentPace = calculatePace(distanceKm, elapsedTime);
    const co2Saved = calculateCO2Savings(distanceKm);
    const lifeGained = calculateLifeGained(elapsedHours);

    setMetrics(prev => ({
      ...prev,
      duration: elapsedTime,
      distance: distanceKm,
      pace: currentPace,
      co2Saved: co2Saved,
      lifeGained: lifeGained,
    }));
  };

  // Callback pour les nouvelles positions du background
  const handleBackgroundPosition = (position: Position) => {
    setPositions(prev => {
      const updated = [...prev, position];
      
      if (updated.length >= 2) {
        const lastPos = updated[updated.length - 2];
        const distance = calculateDistance(lastPos, position);
        if (distance < 100) {
          totalDistanceRef.current += distance;
        }
      }
      
      return updated;
    });
  };

  // Start GPS tracking
  const startLocationTracking = async () => {
    if (!hasLocationPermission) return;

    try {
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const newPosition: Position = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            speed: location.coords.speed ? Math.max(0, location.coords.speed * 3.6) : 0,
          };

          setPositions(prev => {
            const updated = [...prev, newPosition];
            
            if (updated.length >= 2) {
              const lastPos = updated[updated.length - 2];
              const distance = calculateDistance(lastPos, newPosition);
              if (distance < 100) {
                totalDistanceRef.current += distance;
              }
            }

            return updated;
          });
        }
      );
    } catch (error) {
      console.error('Erreur lors du démarrage du GPS:', error);
      Alert.alert('Erreur', 'Impossible de démarrer le suivi GPS');
    }
  };

  // Stop GPS tracking
  const stopLocationTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  };

  // Start activity
  const startActivity = async () => {
    if (!hasLocationPermission) {
      Alert.alert(
        'Permissions requises', 
        'Veuillez autoriser l\'accès à la géolocalisation en arrière-plan pour un tracking optimal'
      );
      return;
    }

    console.log('🏃‍♂️ Démarrage de l\'activité...');

    setIsRunning(true);
    setIsPaused(false);
    setIsBackgroundTracking(true);
    
    // Démarrer le tracking en arrière-plan
    const backgroundStarted = await backgroundTrackingService.startBackgroundTracking(
      metrics.activityType,
      handleBackgroundPosition
    );
    
    if (!backgroundStarted) {
      console.warn('⚠️ Tracking background non démarré, utilisation du tracking normal');
      await startLocationTracking();
    }

    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
    totalDistanceRef.current = 0;
    
    timerRef.current = setInterval(updateMetrics, 1000);
    
    Alert.alert(
      'Activité démarrée',
      'Votre activité est maintenant trackée en arrière-plan. Vous pouvez éteindre l\'écran et ranger votre téléphone.',
      [{ text: 'Compris', style: 'default' }]
    );
  };

  // Pause activity
  const pauseActivity = () => {
    console.log('⏸️ Pause de l\'activité...');
    setIsPaused(true);
    pauseStartTimeRef.current = Date.now();
    
    // Le tracking background continue même en pause
    if (!isBackgroundTracking) {
      stopLocationTracking();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Resume activity
  const resumeActivity = async () => {
    console.log('▶️ Reprise de l\'activité...');
    if (pauseStartTimeRef.current > 0) {
      pausedDurationRef.current += Date.now() - pauseStartTimeRef.current;
      pauseStartTimeRef.current = 0;
    }
    
    setIsPaused(false);
    
    // Reprendre le tracking normal si pas de background
    if (!isBackgroundTracking) {
      await startLocationTracking();
    }
    
    timerRef.current = setInterval(updateMetrics, 1000);
  };

  // Finish activity
  const finishActivity = () => {
    const config = ACTIVITY_CONFIG[metrics.activityType];
    Alert.alert(
      'Terminer l\'activité',
      `${config.name} terminée !\n\nDistance: ${metrics.distance.toFixed(2)} km\nTemps: ${formatTime(metrics.duration)}\nCO2 économisé: ${metrics.co2Saved.toFixed(2)} kg\nVie gagnée: ${formatLifeGained(metrics.lifeGained)}`,
      [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Terminer', onPress: saveAndResetActivity }
      ]
    );
  };

  const saveAndResetActivity = async () => {
    console.log('💾 Sauvegarde de l\'activité...');
    
    // Récupérer les positions du tracking background
    let finalPositions = positions;
    if (isBackgroundTracking) {
      const backgroundPositions = await backgroundTrackingService.stopBackgroundTracking();
      if (backgroundPositions.length > 0) {
        finalPositions = backgroundPositions;
      }
    }
    
    try {
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour sauvegarder');
        return;
      }
      
      const activityData = {
        user_id: user.id,
        activity_type: metrics.activityType,
        duration: metrics.duration,
        distance: metrics.distance,
        pace: metrics.pace,
        co2_saved: metrics.co2Saved,
        life_gained: metrics.lifeGained,
        positions: finalPositions,
      };
      
      await activityService.createActivity(activityData);
      Alert.alert('Succès', 'Activité sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'activité');
    }
    
    resetActivity();
  };

  const resetActivity = () => {
    console.log('🔄 Reset de l\'activité...');
    
    setIsRunning(false);
    setIsPaused(false);
    setIsBackgroundTracking(false);
    
    // Arrêter le tracking background si actif
    if (isBackgroundTracking) {
      backgroundTrackingService.stopBackgroundTracking();
    }
    
    stopLocationTracking();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setPositions([]);
    totalDistanceRef.current = 0;
    startTimeRef.current = 0;
    pausedDurationRef.current = 0;
    pauseStartTimeRef.current = 0;
    
    setMetrics(prev => ({
      ...prev,
      duration: 0,
      distance: 0,
      co2Saved: 0,
      lifeGained: 0,
    }));
  };

  const handleActivityChange = (newActivity: ActivityType) => {
    if (!isRunning) {
      setMetrics(prev => ({ ...prev, activityType: newActivity }));
      setShowActivitySelector(false);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Nettoyer le tracking background
      if (isBackgroundTracking) {
        backgroundTrackingService.stopBackgroundTracking();
      }
      
      stopLocationTracking();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Vérifier si le tracking background est actif au démarrage
  useEffect(() => {
    const isActive = backgroundTrackingService.isTrackingActive();
    setIsBackgroundTracking(isActive);
    setIsRunning(isActive);
  }, []);

  const config = ACTIVITY_CONFIG[metrics.activityType];
  const ActivityIcon = config.icon;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerLeft}
          onPress={() => !isRunning && setShowActivitySelector(true)}
          disabled={isRunning}
          activeOpacity={0.7}
        >
          <View style={[styles.activityIndicator, { backgroundColor: config.color }]}>
            <ActivityIcon size={20} color={colors.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{config.name}</Text>
            {!isRunning && <ChevronDown size={16} color={colors.gray500} />}
          </View>
        </TouchableOpacity>
        <View style={styles.statusContainer}>
          {isBackgroundTracking && (
            <Text style={styles.backgroundIndicator}>📱 Arrière-plan</Text>
          )}
          <View style={[styles.statusIndicator, { 
            backgroundColor: isRunning && !isPaused ? colors.success : colors.error 
          }]} />
        </View>
      </View>

      {/* Activity Selector Modal */}
      <Modal
        visible={showActivitySelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActivitySelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActivitySelector(false)}
        >
          <View style={styles.activitySelectorContainer}>
            <Text style={styles.selectorTitle}>Choisir une activité</Text>
            
            {Object.entries(ACTIVITY_CONFIG).map(([key, activityConfig]) => {
              const ActivityOptionIcon = activityConfig.icon;
              const isSelected = metrics.activityType === key;
              
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.activityOption,
                    isSelected && styles.activityOptionSelected
                  ]}
                  onPress={() => handleActivityChange(key as ActivityType)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.activityOptionIcon, { backgroundColor: activityConfig.color }]}>
                    <ActivityOptionIcon size={24} color={colors.white} />
                  </View>
                  <View style={styles.activityOptionContent}>
                    <Text style={styles.activityOptionTitle}>{activityConfig.name}</Text>
                    <Text style={styles.activityOptionDescription}>{activityConfig.co2Description}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Eco Metrics */}
      <View style={styles.metricsContainer}>
        {/* Timer */}
        <View style={[styles.metricCard, styles.timerCard]}>
          <Text style={[styles.metricLabel, { color: colors.white }]}>Temps d'activité</Text>
          <Text style={styles.metricValueLarge}>{formatTime(metrics.duration)}</Text>
        </View>

        {/* CO2 and Life Gained */}
        <View style={styles.metricRow}>
          <View style={[styles.metricCard, styles.halfCard, styles.co2Card]}>
            <Leaf size={24} color={colors.white} />
            <Text style={[styles.metricLabel, { color: colors.white }]}>CO2 économisé</Text>
            <Text style={[styles.metricValue, { color: colors.white }]}>{metrics.co2Saved.toFixed(2)}</Text>
            <Text style={[styles.metricUnit, { color: colors.white, opacity: 0.9 }]}>kg</Text>
          </View>
          
          <View style={[styles.metricCard, styles.halfCard, styles.lifeCard]}>
            <Heart size={24} color={colors.white} />
            <Text style={[styles.metricLabel, { color: colors.white }]}>Vie gagnée</Text>
            <Text style={[styles.metricValue, { color: colors.white }]}>{formatLifeGained(metrics.lifeGained)}</Text>
            <Text style={[styles.metricUnit, { color: colors.white, opacity: 0.9 }]}>estimée</Text>
          </View>
        </View>

        {/* Speed and Distance */}
        <View style={styles.metricRow}>
          <View style={[styles.metricCard, styles.halfCard]}>
            <Text style={styles.metricLabel}>Allure</Text>
            <Text style={styles.metricValue}>{formatPace(metrics.pace)}</Text>
            <Text style={styles.metricUnit}>min/km</Text>
          </View>
          
          <View style={[styles.metricCard, styles.halfCard]}>
            <Text style={styles.metricLabel}>Distance</Text>
            <Text style={styles.metricValue}>{metrics.distance.toFixed(2)}</Text>
            <Text style={styles.metricUnit}>km</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {!isRunning ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startActivity}
              activeOpacity={0.8}
            >
              <Play size={24} color={colors.white} />
              <Text style={styles.startButtonText}>Démarrer</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              {!isPaused ? (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={pauseActivity}
                  activeOpacity={0.8}
                >
                  <Pause size={24} color={colors.white} />
                  <Text style={styles.controlButtonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={resumeActivity}
                  activeOpacity={0.8}
                >
                  <Play size={24} color={colors.white} />
                  <Text style={styles.controlButtonText}>Reprendre</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.stopButton}
                onPress={finishActivity}
                activeOpacity={0.8}
              >
                <Square size={24} color={colors.white} />
                <Text style={styles.controlButtonText}>Terminer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {!hasLocationPermission && (
        <View style={styles.permissionWarning}>
          <Text style={styles.warningText}>
            Permission GPS requise pour le calcul d'impact écologique
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIndicator: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
    marginRight: spacing.xs,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  backgroundIndicator: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  metricsContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  metricCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerCard: {
    backgroundColor: colors.gray800,
    borderColor: colors.gray700,
  },
  co2Card: {
    backgroundColor: colors.success,
    borderColor: colors.primaryDark,
  },
  lifeCard: {
    backgroundColor: colors.error,
    borderColor: '#b91c1c',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    flex: 0.48,
    marginBottom: spacing.lg,
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray500,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  metricValueLarge: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  metricUnit: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray400,
  },
  controlsContainer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.lg,
    shadowColor: colors.success,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    flex: 0.48,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    flex: 0.48,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    flex: 0.48,
  },
  controlButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  permissionWarning: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningText: {
    color: '#92400e',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activitySelectorContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    marginHorizontal: spacing.xl,
    maxWidth: 400,
    width: '90%',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  selectorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityOptionSelected: {
    backgroundColor: colors.background,
    borderColor: colors.success,
  },
  activityOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  activityOptionContent: {
    flex: 1,
  },
  activityOptionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  activityOptionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});