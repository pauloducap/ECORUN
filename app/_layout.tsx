import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/lib/settings';
import Auth from './auth';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import colors from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { typography } from '@/styles/typography';

// Précharger les images
const preloadImages = async () => {
  try {
    console.log('🖼️ Préchargement des images...');
    await Asset.loadAsync([
      require('../assets/images/newlogo2.png'),
      require('../assets/images/4c038fe0-ff94-46f0-8688-86c2fcdcb797.png'),
    ]);
    console.log('✅ Images préchargées');
  } catch (error) {
    console.warn('⚠️ Erreur préchargement images:', error);
  }
};

// Écran de chargement avec logo

// Écran de chargement avec logo
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.logoContainer}>
      <Image
        source={require('../assets/images/newlogo2.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.appName}>EcoRun</Text>
    <Text style={styles.loadingText}>Chargement...</Text>
  </View>
);

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading } = useAuth();
  const [initialLoading, setInitialLoading] = useState(false);
  
  // Initialiser les paramètres
  useEffect(() => {
    settingsService.initialize();
  }, []);

  // Chargement initial de 3 secondes quand l'utilisateur se connecte
  useEffect(() => {
    if (!loading && user && !initialLoading) {
      console.log('🔄 Démarrage du chargement initial...');
      setInitialLoading(true);
      
      // Précharger les images en parallèle
      preloadImages();
      
      // Timer de sécurité - 3 secondes maximum
      const timer = setTimeout(() => {
        console.log('✅ Chargement initial terminé');
        setInitialLoading(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  // Afficher le loading pendant l'auth ou pendant le chargement initial
  if (loading || initialLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <Stack 
        screenOptions={{ headerShown: false }}
        initialRouteName="(tabs)"
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
  },
});