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
import { colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles/spacing';
import { typography } from '@/styles/typography';

type FilterType = 'all' | 'running' | 'biking';

export default function History() {
  const router = useRouter();
  const { user } = useAuth();
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
      <Text style={styles.emptyTitle}>Aucune activité</Text>
      <Text style={styles.emptyDescription}>
        Commencez votre première activité{'\n'}pour voir vos statistiques ici
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={colors.gray500} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === 'all' && styles.filterTabTextActive,
            ]}
          >
            Toutes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'running' && styles.filterTabActive,
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
              styles.filterTabText,
              activeFilter === 'running' && styles.filterTabTextActive,
            ]}
          >
            Course
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'biking' && styles.filterTabActive,
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
              styles.filterTabText,
              activeFilter === 'biking' && styles.filterTabTextActive,
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
            <Text style={styles.loadingText}>Chargement des activités...</Text>
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
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
  },
  filterButton: {
    padding: spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginRight: spacing.md,
    backgroundColor: colors.gray100,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
  filterTabTextActive: {
    color: colors.white,
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
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
    fontStyle: 'italic',
  },
});
