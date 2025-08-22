import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { 
  User, 
  CreditCard as Edit3, 
  Settings, 
  Bell, 
  Shield, 
  CircleHelp as HelpCircle, 
  LogOut, 
  ChevronRight, 
  Save, 
  X,
  Moon,
  Sun,
  Monitor,
  Eye,
  Volume2,
  Smartphone,
  Globe,
  Download,
  Upload,
  Trash2,
  Accessibility
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { settingsService, AppSettings, ThemeMode } from '@/lib/settings';
import { profileService, activityService } from '@/lib/supabase';
import { colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles/spacing';
import { typography } from '@/styles/typography';

interface UserStats {
  totalActivities: number;
  totalDistance: number;
  totalCO2Saved: number;
  totalLifeGained: number;
}

interface MenuItem {
  icon: typeof Bell;
  title: string;
  description: string;
  onPress: () => void;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { colors, fontSizeMultiplier } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(settingsService.getSettings());
  const [userName, setUserName] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [userStats, setUserStats] = useState<UserStats>({
    totalActivities: 0,
    totalDistance: 0,
    totalCO2Saved: 0,
    totalLifeGained: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    
    // Écouter les changements de paramètres
    const unsubscribe = settingsService.subscribe(setAppSettings);
    return unsubscribe;
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Charger le profil utilisateur
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        setUserName(profile.name);
        setTempUserName(profile.name);
      } else {
        // Créer un profil par défaut si inexistant
        const defaultName = user.email?.split('@')[0] || 'Éco-Coureur';
        await profileService.upsertProfile({
          id: user.id,
          name: defaultName,
          email: user.email || '',
        });
        setUserName(defaultName);
        setTempUserName(defaultName);
      }
      
      // Charger les statistiques des activités
      const activities = await activityService.getUserActivities(user.id);
      
      const stats = activities.reduce((acc, activity) => ({
        totalActivities: acc.totalActivities + 1,
        totalDistance: acc.totalDistance + activity.distance,
        totalCO2Saved: acc.totalCO2Saved + activity.co2_saved,
        totalLifeGained: acc.totalLifeGained + activity.life_gained,
      }), {
        totalActivities: 0,
        totalDistance: 0,
        totalCO2Saved: 0,
        totalLifeGained: 0,
      });
      
      setUserStats(stats);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };
  const menuItems: MenuItem[] = [
    {
      icon: Settings,
      title: 'Paramètres avancés',
      description: 'Thème, accessibilité, confidentialité',
      onPress: () => setShowSettings(true),
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Gérer vos notifications',
      onPress: () => Alert.alert('Notifications', 'Fonctionnalité à venir'),
    },
    {
      icon: Shield,
      title: 'Confidentialité',
      description: 'Données et sécurité',
      onPress: () => Alert.alert('Confidentialité', 'Fonctionnalité à venir'),
    },
    {
      icon: HelpCircle,
      title: 'Aide & Support',
      description: 'FAQ et contact',
      onPress: () => Alert.alert('Aide', 'Fonctionnalité à venir'),
    },
  ];

  const handleEdit = () => {
    setTempUserName(userName);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      await profileService.upsertProfile({
        id: user.id,
        name: tempUserName,
        email: user.email || '',
      });
      
      setUserName(tempUserName);
      setIsEditing(false);
      Alert.alert('Succès', 'Pseudo mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le pseudo');
    }
  };

  const handleCancel = () => {
    setTempUserName(userName);
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    await settingsService.updateSetting(key, value);
  };

  const exportData = async () => {
    try {
      const data = await settingsService.exportUserData();
      Alert.alert(
        'Données exportées',
        'Vos données ont été préparées pour l\'export.\n\nEn production, elles seraient téléchargées automatiquement.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'exporter les données');
    }
  };

  const resetSettings = () => {
    Alert.alert(
      'Réinitialiser les paramètres',
      'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: async () => {
            await settingsService.resetAllSettings();
            Alert.alert('Succès', 'Paramètres réinitialisés');
          }
        },
      ]
    );
  };

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { backgroundColor: colors.white, borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.gray800 }]}>Paramètres</Text>
          <TouchableOpacity onPress={() => setShowSettings(false)}>
            <X size={24} color={colors.gray600} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Apparence */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.gray800 }]}>Apparence</Text>
            
            <View style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  {appSettings.theme === 'light' ? <Sun size={20} color={colors.gray500} /> :
                   appSettings.theme === 'dark' ? <Moon size={20} color={colors.gray500} /> :
                   <Monitor size={20} color={colors.gray500} />}
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: colors.gray800 }]}>Thème</Text>
                  <Text style={[styles.settingDescription, { color: colors.gray500 }]}>
                    {appSettings.theme === 'light' ? 'Clair' :
                     appSettings.theme === 'dark' ? 'Sombre' : 'Automatique'}
                  </Text>
                </View>
              </View>
              <View style={styles.themeButtons}>
                {(['light', 'dark', 'system'] as ThemeMode[]).map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.themeButton,
                      { backgroundColor: colors.gray100 },
                      appSettings.theme === theme && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => updateSetting('theme', theme)}
                  >
                    {theme === 'light' && <Sun size={16} color={appSettings.theme === theme ? colors.white : colors.gray600} />}
                    {theme === 'dark' && <Moon size={16} color={appSettings.theme === theme ? colors.white : colors.gray600} />}
                    {theme === 'system' && <Monitor size={16} color={appSettings.theme === theme ? colors.white : colors.gray600} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Eye size={20} color={colors.gray500} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.gray800 }]}>Contraste élevé</Text>
                  <Text style={[styles.settingDescription, { color: colors.gray500 }]}>
                    Améliore la lisibilité
                  </Text>
                </View>
              </View>
              <Switch
                value={appSettings.highContrast}
                onValueChange={(value) => updateSetting('highContrast', value)}
                trackColor={{ false: colors.gray300, true: colors.primary }}
              />
            </View>
          </View>

          {/* Accessibilité */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.gray800 }]}>Accessibilité</Text>
            
            <View style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Accessibility size={20} color={colors.gray500} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.gray800 }]}>Taille de police</Text>
                  <Text style={[styles.settingDescription, { color: colors.gray500 }]}>
                    {appSettings.fontSize === 'small' ? 'Petite' :
                     appSettings.fontSize === 'normal' ? 'Normale' :
                     appSettings.fontSize === 'large' ? 'Grande' : 'Très grande'}
                  </Text>
                </View>
              </View>
              <View style={styles.fontSizeButtons}>
                {(['small', 'normal', 'large', 'xlarge'] as const).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeButton,
                      { backgroundColor: colors.gray100 },
                      appSettings.fontSize === size && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => updateSetting('fontSize', size)}
                  >
                    <Text style={[
                      styles.fontSizeButtonText,
                      { color: appSettings.fontSize === size ? colors.white : colors.gray600 }
                    ]}>
                      {size === 'small' ? 'A' : size === 'normal' ? 'A' : size === 'large' ? 'A' : 'A'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Volume2 size={20} color={colors.gray500} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.gray800 }]}>Guidage vocal</Text>
                  <Text style={[styles.settingDescription, { color: colors.gray500 }]}>
                    Annonces pendant l'activité
                  </Text>
                </View>
              </View>
              <Switch
                value={appSettings.voiceGuidance !== 'none'}
                onValueChange={(value) => updateSetting('voiceGuidance', value ? 'basic' : 'none')}
                trackColor={{ false: colors.gray300, true: colors.primary }}
              />
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Smartphone size={20} color={colors.gray500} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.gray800 }]}>Vibrations</Text>
                  <Text style={[styles.settingDescription, { color: colors.gray500 }]}>
                    Retour haptique
                  </Text>
                </View>
              </View>
              <Switch
                value={appSettings.hapticFeedback}
                onValueChange={(value) => updateSetting('hapticFeedback', value)}
                trackColor={{ false: colors.gray300, true: colors.primary }}
              />
            </View>
          </View>

          {/* Confidentialité RGPD */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.gray800 }]}>Confidentialité & RGPD</Text>
            
            <View style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Shield size={20} color={colors.gray500} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.gray800 }]}>Collecte de données</Text>
                  <Text style={[styles.settingDescription, { color: colors.gray500 }]}>
                    Amélioration de l'app
                  </Text>
                </View>
              </View>
              <Switch
                value={appSettings.dataCollection}
                onValueChange={(value) => updateSetting('dataCollection', value)}
                trackColor={{ false: colors.gray300, true: colors.primary }}
              />
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Globe size={20} color={colors.gray500} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.gray800 }]}>Historique GPS</Text>
                  <Text style={[styles.settingDescription, { color: colors.gray500 }]}>
                    Sauvegarder les trajets
                  </Text>
                </View>
              </View>
              <Switch
                value={appSettings.locationHistory}
                onValueChange={(value) => updateSetting('locationHistory', value)}
                trackColor={{ false: colors.gray300, true: colors.primary }}
              />
            </View>

            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}
              onPress={exportData}
            >
              <View style={styles.settingInfo}>
                <Download size={20} color={colors.gray500} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.gray800 }]}>Exporter mes données</Text>
                  <Text style={[styles.settingDescription, { color: colors.gray500 }]}>
                    Télécharger toutes vos données
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.gray300} />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.settingsSection}>
            <TouchableOpacity
              style={[styles.dangerButton, { backgroundColor: colors.white, borderColor: '#fecaca' }]}
              onPress={resetSettings}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.dangerButtonText, { color: colors.error }]}>
                Réinitialiser les paramètres
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <User size={48} color={colors.white} />
          </View>
          
          {!isEditing ? (
            <>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Edit3 size={16} color={colors.primary} />
                <Text style={styles.editButtonText}>Modifier le pseudo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pseudo</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempUserName}
                  onChangeText={setTempUserName}
                  placeholder="Votre pseudo"
                />
              </View>
              
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <X size={16} color={colors.error} />
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Save size={16} color={colors.white} />
                  <Text style={styles.saveButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Text style={styles.sectionTitle}>Statistiques rapides</Text>
          <View style={styles.statsRow}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{userStats.totalActivities}</Text>
              <Text style={styles.quickStatLabel}>Activités totales</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{userStats.totalDistance.toFixed(1)} km</Text>
              <Text style={styles.quickStatLabel}>Distance totale</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{userStats.totalCO2Saved.toFixed(1)} kg</Text>
              <Text style={styles.quickStatLabel}>CO2 économisé</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIcon}>
                <item.icon size={20} color={colors.gray500} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.gray300} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>EcoRun v1.0.0</Text>
        </View>
      </ScrollView>
      
      {renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  userName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
    marginBottom: spacing.lg,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  editForm: {
    width: '100%',
    marginTop: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  halfInput: {
    flex: 0.48,
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.white,
    color: colors.gray800,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: '#fef2f2',
    flex: 0.48,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    flex: 0.48,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  quickStats: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatCard: {
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
  quickStatValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  quickStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray800,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
  },
  logoutSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
  versionSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  settingsSection: {
    marginVertical: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  themeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  dangerButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.gray500,
  },
});