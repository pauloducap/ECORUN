import React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Leaf, 
  Timer, 
  TrendingUp, 
  Heart,
  Play,
  ChevronRight,
  Car,
  Footprints,
  Bike,
} from 'lucide-react-native';
import { ACTIVITY_CONFIG } from '@/constants/activities';
import { activityService } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles/spacing';
import { typography } from '@/styles/typography';
import { debugSupabase } from '@/lib/debug';

interface UserStats {
  totalActivities: number;
  totalDistance: number;
  totalCO2Saved: number;
  totalLifeGained: number;
  runningActivities: number;
  bikingActivities: number;
  averagePerWeek: number;
}

interface Benefit {
  icon: typeof Leaf;
  title: string;
  description: string;
  color: string;
}

interface EcoStat {
  label: string;
  value: string;
  color: string;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalActivities: 0,
    totalDistance: 0,
    totalCO2Saved: 0,
    totalLifeGained: 0,
    runningActivities: 0,
    bikingActivities: 0,
    averagePerWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;
    
    try {
      const activities = await activityService.getUserActivities(user.id);
      
      const stats = activities.reduce((acc, activity) => {
        const isRunning = activity.activity_type === 'running';
        const isBiking = activity.activity_type === 'biking';
        
        return {
          totalActivities: acc.totalActivities + 1,
          totalDistance: acc.totalDistance + activity.distance,
          totalCO2Saved: acc.totalCO2Saved + activity.co2_saved,
          totalLifeGained: acc.totalLifeGained + activity.life_gained,
          runningActivities: acc.runningActivities + (isRunning ? 1 : 0),
          bikingActivities: acc.bikingActivities + (isBiking ? 1 : 0),
          averagePerWeek: acc.totalActivities, // Sera calculé après
        };
      }, {
        totalActivities: 0,
        totalDistance: 0,
        totalCO2Saved: 0,
        totalLifeGained: 0,
        runningActivities: 0,
        bikingActivities: 0,
        averagePerWeek: 0,
      });
      
      // Calculer la moyenne par semaine (approximation basée sur les 4 dernières semaines)
      stats.averagePerWeek = stats.totalActivities > 0 ? stats.totalActivities / 4 : 0;
      
      setUserStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bouton de debug temporaire
  const handleDebug = async () => {
    await debugSupabase();
  };

  const benefits: Benefit[] = [
    {
      icon: Leaf,
      title: 'Réduction CO2',
      description: 'Calculez vos économies de carbone en temps réel',
      color: colors.success,
    },
    {
      icon: Heart,
      title: 'Espérance de vie',
      description: '1h de course = 7h de vie gagnées',
      color: colors.error,
    },
    {
      icon: Car,
      title: 'Alternative voiture',
      description: 'Comparez vos trajets écologiques',
      color: colors.secondary,
    },
    {
      icon: Timer,
      title: 'Suivi activité',
      description: 'Course à pied et vélo supportés',
      color: '#ea580c',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/newlogo2.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroTitle}>EcoRun</Text>
            <Text style={styles.heroSubtitle}>
              Courez pour votre santé et la planète
            </Text>
            <Text style={styles.heroDescription}>
              Calculez vos économies de CO2 et votre gain d'espérance de vie 
              en choisissant la course ou le vélo plutôt que la voiture.
            </Text>
          </View>
          
          <View style={styles.heroImageContainer}>
            <Image
              source={require('../../assets/images/4c038fe0-ff94-46f0-8688-86c2fcdcb797.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Impact Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Votre Impact Écologique</Text>
          {loading ? (
            <Text style={styles.loadingText}>Chargement des statistiques...</Text>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {userStats.totalCO2Saved.toFixed(1)}kg
                </Text>
                <Text style={styles.statLabel}>CO2 économisé</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {userStats.totalLifeGained.toFixed(0)}h
                </Text>
                <Text style={styles.statLabel}>Vie gagnée</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.secondary }]}>
                  {userStats.totalActivities}
                </Text>
                <Text style={styles.statLabel}>Trajets verts</Text>
              </View>
            </View>
          )}
        </View>

        {/* Activity Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Vos Activités</Text>
          {loading ? (
            <Text style={styles.loadingText}>Chargement des activités...</Text>
          ) : (
            <View style={styles.activityStatsGrid}>
              <View style={styles.activityStatCard}>
                <View style={[styles.activityStatIcon, { backgroundColor: colors.running }]}>
                  <Footprints size={20} color={colors.white} />
                </View>
                <Text style={styles.activityStatValue}>{userStats.runningActivities}</Text>
                <Text style={styles.activityStatLabel}>Sessions course</Text>
              </View>
              
              <View style={styles.activityStatCard}>
                <View style={[styles.activityStatIcon, { backgroundColor: colors.biking }]}>
                  <Bike size={20} color={colors.white} />
                </View>
                <Text style={styles.activityStatValue}>{userStats.bikingActivities}</Text>
                <Text style={styles.activityStatLabel}>Sessions vélo</Text>
              </View>
              
              <View style={styles.activityStatCard}>
                <View style={[styles.activityStatIcon, { backgroundColor: colors.warning }]}>
                  <TrendingUp size={20} color={colors.white} />
                </View>
                <Text style={styles.activityStatValue}>{userStats.averagePerWeek.toFixed(1)}</Text>
                <Text style={styles.activityStatLabel}>Moyenne/semaine</Text>
              </View>
            </View>
          )}
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Bénéfices EcoRun</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: benefit.color }]}>
                <benefit.icon size={24} color={colors.white} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.gray400} />
            </View>
          ))}
        </View>

        {/* Activity Selection */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Choisir une Activité</Text>
          <View style={styles.activityGrid}>
            {Object.entries(ACTIVITY_CONFIG).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[styles.activityCard, { backgroundColor: config.color }]}
                onPress={() => router.push(`/(tabs)/tracker?activity=${key}`)}
                activeOpacity={0.8}
              >
                <config.icon size={32} color={colors.white} />
                <Text style={styles.activityTitle}>{config.name}</Text>
                <Text style={styles.activitySubtitle}>{config.co2Description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Formula Explanation */}
        <View style={styles.formulaSection}>
          <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
          <View style={styles.formulaCard}>
            <View style={styles.formulaItem}>
              <Heart size={24} color={colors.error} />
              <View style={styles.formulaText}>
                <Text style={styles.formulaTitle}>Espérance de vie</Text>
                <Text style={styles.formulaDescription}>
                  1 heure d'activité = 7 heures de vie gagnées
                </Text>
              </View>
            </View>
            
            <View style={styles.formulaItem}>
              <Leaf size={24} color={colors.success} />
              <View style={styles.formulaText}>
                <Text style={styles.formulaTitle}>Économies CO2</Text>
                <Text style={styles.formulaDescription}>
                  Basé sur la consommation moyenne d'une voiture (120g CO2/km)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.warning, marginBottom: spacing.lg }]}
            onPress={handleDebug}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>🔍 Debug Supabase</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/(tabs)/tracker')}
            activeOpacity={0.8}
          >
            <Play size={24} color={colors.white} />
            <Text style={styles.startButtonText}>Commencer une activité</Text>
          </TouchableOpacity>
          
          <Text style={styles.ctaSubtext}>
            Chaque kilomètre compte pour votre santé et l'environnement !
          </Text>
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
  heroSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gray800,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.xxl,
  },
  heroImageContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  statsSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
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
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    textAlign: 'center',
  },
  activityStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityStatCard: {
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
  activityStatIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  activityStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  activityStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    textAlign: 'center',
  },
  benefitsSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  activitySection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityCard: {
    flex: 0.48,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  activityTitle: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  activitySubtitle: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    opacity: 0.9,
    textAlign: 'center',
  },
  formulaSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  formulaCard: {
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
  formulaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  formulaText: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  formulaTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  formulaDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  ctaSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
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
    marginBottom: spacing.lg,
    minWidth: 250,
  },
  startButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.sm,
  },
  ctaSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});