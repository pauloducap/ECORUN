import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Activity, Leaf, Heart, Trash2 } from 'lucide-react-native';
import { Activity as ActivityType } from '@/lib/supabase';
import { ACTIVITY_CONFIG } from '@/constants/activities';
import { formatTime, formatPace, formatDate } from '@/utils/formatters';
import { activityCardStyles } from '@/styles/components/ActivityCard.styles';

interface ActivityCardProps {
  activity: ActivityType;
  onPress?: () => void;
}

/**
 * Composant carte d'activité
 * Affiche les informations principales d'une activité sportive
 * avec les métriques écologiques calculées
 */
export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  const config = ACTIVITY_CONFIG[activity.activity_type];
  const ActivityIcon = config.icon;


  return (
    <TouchableOpacity 
      style={activityCardStyles.container} 
      onPress={onPress} 
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Activité ${config.name} du ${formatDate(activity.created_at)}`}
      accessibilityHint="Appuyez pour voir les détails de cette activité"
    >
      <View style={activityCardStyles.header}>
        <View style={activityCardStyles.activityInfo}>
          <View 
            style={[activityCardStyles.activityIcon, { backgroundColor: config.color }]}
            accessibilityRole="image"
            accessibilityLabel={`Icône ${config.name}`}
          >
            <ActivityIcon size={20} color="#ffffff" />
          </View>
          <View style={activityCardStyles.activityDetails}>
            <Text style={activityCardStyles.activityName}>{config.name}</Text>
            <Text style={activityCardStyles.activityDate}>{formatDate(activity.created_at)}</Text>
          </View>
        </View>
      </View>

      <View style={activityCardStyles.stats}>
        <View style={activityCardStyles.statRow}>
          <View style={activityCardStyles.statItem}>
            <MapPin size={16} color="#6b7280" accessibilityHidden />
            <Text style={activityCardStyles.statLabel}>Distance</Text>
            <Text 
              style={activityCardStyles.statValue}
              accessibilityLabel={`Distance ${activity.distance.toFixed(2)} kilomètres`}
            >
              {activity.distance.toFixed(2)} km
            </Text>
          </View>
          <View style={activityCardStyles.statItem}>
            <Clock size={16} color="#6b7280" accessibilityHidden />
            <Text style={activityCardStyles.statLabel}>Temps</Text>
            <Text 
              style={activityCardStyles.statValue}
              accessibilityLabel={`Durée ${formatTime(activity.duration)}`}
            >
              {formatTime(activity.duration)}
            </Text>
          </View>
          <View style={activityCardStyles.statItem}>
            <Activity size={16} color="#6b7280" accessibilityHidden />
            <Text style={activityCardStyles.statLabel}>Allure</Text>
            <Text 
              style={activityCardStyles.statValue}
              accessibilityLabel={`Allure ${formatPace(activity.pace)} par kilomètre`}
            >
              {formatPace(activity.pace)}
            </Text>
          </View>
        </View>

        <View style={activityCardStyles.ecoStats}>
          <View style={activityCardStyles.ecoStatItem}>
            <Leaf size={16} color="#059669" accessibilityHidden />
            <Text style={activityCardStyles.ecoStatLabel}>CO2 économisé</Text>
            <Text 
              style={[activityCardStyles.ecoStatValue, { color: '#059669' }]}
              accessibilityLabel={`${activity.co2_saved.toFixed(2)} kilogrammes de CO2 économisés`}
            >
              {activity.co2_saved.toFixed(2)} kg
            </Text>
          </View>
          <View style={activityCardStyles.ecoStatItem}>
            <Heart size={16} color="#dc2626" accessibilityHidden />
            <Text style={activityCardStyles.ecoStatLabel}>Vie gagnée</Text>
            <Text 
              style={[activityCardStyles.ecoStatValue, { color: '#dc2626' }]}
              accessibilityLabel={`${activity.life_gained.toFixed(1)} heures d'espérance de vie gagnées`}
            >
              {activity.life_gained.toFixed(1)}h
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};