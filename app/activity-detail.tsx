import React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Activity, Leaf, Heart, Trash2 } from 'lucide-react-native';
import { Activity as ActivityType, activityService } from '@/lib/supabase';
import { ACTIVITY_CONFIG } from '@/constants/activities';
import { MapView } from '@/components/MapView';
import { formatTime, formatPace, formatDate } from '@/utils/formatters';
import colors from '@/styles/colors';
import { spacing, borderRadius } from '@/styles/spacing';
import { typography } from '@/styles/typography';
import { useAuth } from '@/hooks/useAuth';


export default function ActivityDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    loadActivity();
  }, [id]);

  const loadActivity = async () => {
    try {
      if (!id || typeof id !== 'string') return;
      
      const activityData = await activityService.getActivity(id);
      setActivity(activityData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = () => {
    Alert.alert(
      'Supprimer l\'activité',
      'Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    if (!activity) return;
    
    try {
      setDeleting(true);
      await activityService.deleteActivity(activity.id);
      Alert.alert('Succès', 'Activité supprimée avec succès');
      router.back();
    } catch (error) {
      console.error('Erreur suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'activité');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Activité non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = ACTIVITY_CONFIG[activity.activity_type];
  const ActivityIcon = config.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.gray800} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={[styles.activityIcon, { backgroundColor: config.color }]}>
            <ActivityIcon size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{config.name}</Text>
            <Text style={styles.headerDate}>{formatDate(activity.created_at)}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteActivity}
          disabled={deleting}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Placeholder pour la carte */}
        <View style={styles.mapContainer}>
          <MapView positions={activity.positions} style={styles.map} />
        </View>

        {/* Statistiques principales */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <MapPin size={20} color={colors.gray500} />
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{activity.distance.toFixed(2)} km</Text>
            </View>
            
            <View style={styles.statCard}>
              <Clock size={20} color={colors.gray500} />
              <Text style={styles.statLabel}>Temps</Text>
              <Text style={styles.statValue}>{formatTime(activity.duration)}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Activity size={20} color={colors.gray500} />
              <Text style={styles.statLabel}>Allure</Text>
              <Text style={styles.statValue}>{formatPace(activity.pace)}</Text>
            </View>
          </View>
        </View>

        {/* Impact écologique */}
        <View style={styles.ecoContainer}>
          <Text style={styles.sectionTitle}>Impact Écologique</Text>
          
          <View style={styles.ecoRow}>
            <View style={[styles.ecoCard, styles.co2Card]}>
              <Leaf size={24} color={colors.white} />
              <Text style={[styles.ecoLabel, { color: colors.white }]}>CO2 économisé</Text>
              <Text style={[styles.ecoValue, { color: colors.white }]}>
                {activity.co2_saved.toFixed(2)} kg
              </Text>
              <Text style={[styles.ecoDescription, { color: colors.white }]}>
                vs trajet en voiture
              </Text>
            </View>
            
            <View style={[styles.ecoCard, styles.lifeCard]}>
              <Heart size={24} color={colors.white} />
              <Text style={[styles.ecoLabel, { color: colors.white }]}>Vie gagnée</Text>
              <Text style={[styles.ecoValue, { color: colors.white }]}>
                {activity.life_gained.toFixed(1)}h
              </Text>
              <Text style={[styles.ecoDescription, { color: colors.white }]}>
                espérance de vie
              </Text>
            </View>
          </View>
        </View>

        {/* Détails du trajet */}
        <View style={styles.routeContainer}>
          <Text style={styles.sectionTitle}>Détails du trajet</Text>
          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <Text style={styles.routeLabel}>Points GPS enregistrés</Text>
              <Text style={styles.routeValue}>{activity.positions.length}</Text>
            </View>
            <View style={styles.routeItem}>
              <Text style={styles.routeLabel}>Vitesse moyenne</Text>
              <Text style={styles.routeValue}>
                {activity.positions.length > 0 
                  ? `${(activity.distance / (activity.duration / 3600)).toFixed(1)} km/h`
                  : 'N/A'
                }
              </Text>
            </View>
            <View style={styles.routeItem}>
              <Text style={styles.routeLabel}>Type d'activité</Text>
              <Text style={styles.routeValue}>{config.name}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
  },
  headerDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
  },
  deleteButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    margin: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 0.32,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
  },
  ecoContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.lg,
  },
  ecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ecoCard: {
    flex: 0.48,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  co2Card: {
    backgroundColor: colors.success,
  },
  lifeCard: {
    backgroundColor: colors.error,
  },
  ecoLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  ecoValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  ecoDescription: {
    fontSize: typography.fontSize.xs,
    opacity: 0.9,
    textAlign: 'center',
  },
  routeContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  routeLabel: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
  },
  routeValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});