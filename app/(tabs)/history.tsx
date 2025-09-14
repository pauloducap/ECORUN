import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, Bike, Filter } from 'lucide-react-native';
import { Footprints } from 'lucide-react-native';
import { Activity as ActivityType } from '@/lib/supabase';
import { ActivityCard } from '@/components/ActivityCard';
import { activityService } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme'; 
import defaultColors from '@/styles/colors';
import { typography } from '@/styles/typography';
import { spacing, borderRadius } from '@/styles/spacing';

type FilterType = 'all' | 'running' | 'biking';

export default function History() {
  const router = useRouter();
  const { user } = useAuth();
  const { fontSizeMultiplier, colors } = useTheme();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityType[]>(
    []
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    loadActivities();
  }, [user]);
  useEffect(() => {
    filterActivities();
  }, [activities, activeFilter]);

  const loadActivities = async () => {
    try {
      if (!user) return;

      setLoading(true);
      const userActivities = await activityService.getUserActivities(user.id);
      setActivities(userActivities);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
      // En cas d'erreur, garder la liste vide
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    if (activeFilter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(
        activities.filter((activity) => activity.activity_type === activeFilter)
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const handleActivityPress = (activity: ActivityType) => {
    router.push(`/activity-detail?id=${activity.id}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Activity size={48} color={colors.gray300} />
      </View>
      <Text style={[styles.emptyTitle, { 
        color: colors.gray800, 
        fontSize: typography.fontSize.xl * fontSizeMultiplier 
      }]}>
        Aucune activité
      </Text>
      <Text style={[styles.emptyDescription, { 
        color: colors.gray500, 
        fontSize: typography.fontSize.base * fontSizeMultiplier 
      }]}>
        Commencez votre première activité{'\n'}pour voir vos statistiques ici
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { 
          color: colors.gray800, 
          fontSize: typography.fontSize.xxl * fontSizeMultiplier 
        }]}>
          Historique
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={colors.gray500} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            [styles.filterTab, { backgroundColor: colors.gray100 }],
            activeFilter === 'all' && styles.filterTabActive,
            activeFilter === 'all' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              [styles.filterTabText, { 
                color: colors.gray500, 
                fontSize: typography.fontSize.sm * fontSizeMultiplier 
              }],
              activeFilter === 'all' && styles.filterTabTextActive,
              activeFilter === 'all' && { color: colors.white },
            ]}
          >
            Toutes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            [styles.filterTab, { backgroundColor: colors.gray100 }],
            activeFilter === 'running' && styles.filterTabActive,
            activeFilter === 'running' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveFilter('running')}
          activeOpacity={0.7}
        >
          <Footprints
            size={16}
            color={activeFilter === 'running' ? colors.white : colors.gray500}
          />
          <Text
            style={[
              [styles.filterTabText, { 
                color: colors.gray500, 
                fontSize: typography.fontSize.sm * fontSizeMultiplier 
              }],
              activeFilter === 'running' && styles.filterTabTextActive,
              activeFilter === 'running' && { color: colors.white },
            ]}
          >
            Course
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            [styles.filterTab, { backgroundColor: colors.gray100 }],
            activeFilter === 'biking' && styles.filterTabActive,
            activeFilter === 'biking' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveFilter('biking')}
          activeOpacity={0.7}
        >
          <Bike
            size={16}
            color={activeFilter === 'biking' ? colors.white : colors.gray500}
          />
          <Text
            style={[
              [styles.filterTabText, { 
                color: colors.gray500, 
                fontSize: typography.fontSize.sm * fontSizeMultiplier 
              }],
              activeFilter === 'biking' && styles.filterTabTextActive,
              activeFilter === 'biking' && { color: colors.white },
            ]}
          >
            Vélo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activities List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { 
              color: colors.gray500, 
              fontSize: typography.fontSize.base * fontSizeMultiplier 
            }]}>
              Chargement des activités...
            </Text>
          </View>
        ) : filteredActivities.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.activitiesList}>
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onPress={() => handleActivityPress(activity)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: typography.fontWeight.bold,
  },
  filterButton: {
    padding: spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginRight: spacing.md,
  },
  filterTabText: {
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  activitiesList: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: defaultColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    shadowColor: defaultColors.black,
  },
  emptyTitle: {
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontStyle: 'italic',
  },
});
