import { createClient } from '@supabase/supabase-js';
import {
  optimizePositions,
  restorePositions,
  OptimizedPosition,
} from '@/utils/gpsOptimizer';

// Fallback pour les tests ou développement local
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://hetrneympgymsrqliten.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldHJuZXltcGd5bXNycWxpdGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU1MDIsImV4cCI6MjA3MTIwMTUwMn0.kISuo5l_EDhnW8KAjIFTlw1wndNtw0oULrgrZamgC04';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types
export interface Profile {
  id: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  created_at: string;
  updated_at: string;
}

export interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
}

export interface StoredActivity extends Omit<Activity, 'positions'> {
  positions: OptimizedPosition[];
}
export interface Activity {
  id: string;
  user_id: string;
  activity_type: 'running' | 'biking';
  duration: number;
  distance: number;
  pace: number;
  co2_saved: number;
  life_gained: number;
  positions: Position[];
  created_at: string;
}

// Services
export const activityService = {
  async getUserActivities(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Restore optimized positions to full format
    return (data || []).map((activity) => ({
      ...activity,
      positions: activity.positions
        ? restorePositions(
            typeof activity.positions === 'string'
              ? JSON.parse(activity.positions)
              : activity.positions,
            new Date(activity.created_at).getTime()
          )
        : [],
    }));
  },

  async getActivity(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) return null;

    // Restore optimized positions
    return {
      ...data,
      positions: data.positions
        ? restorePositions(
            typeof data.positions === 'string'
              ? JSON.parse(data.positions)
              : data.positions,
            new Date(data.created_at).getTime()
          )
        : [],
    };
  },

  async createActivity(
    activity: Omit<Activity, 'id' | 'created_at'>
  ): Promise<Activity> {
    // Optimize positions before storage
    const optimizedPositions = optimizePositions(activity.positions);

    const { data, error } = await supabase
      .from('activities')
      .insert([
        {
          ...activity,
          positions: JSON.stringify(optimizedPositions),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Return with restored positions
    return {
      ...data,
      positions: activity.positions, // Return original positions
    };
  },

  async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase.from('activities').delete().eq('id', id);

    if (error) throw error;
  },
};

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    console.log('🔍 Recherche profil pour:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    console.log('✅ Profil trouvé:', !!data);
    return data;
  },

  async upsertProfile(
    profile: Omit<Profile, 'created_at' | 'updated_at'>
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([profile])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
