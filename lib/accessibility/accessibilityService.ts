/**
 * Service d'accessibilité pour EcoRun
 * Implémentation des fonctionnalités d'accessibilité selon WCAG 2.1 AA
 */

import { AccessibilityInfo, Platform } from 'react-native';
import { settingsService } from '@/lib/settings';
import { wcagChecker } from './wcagCompliance';

export interface AccessibilityState {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  highContrastEnabled: boolean;
  largeTextEnabled: boolean;
  voiceOverEnabled: boolean;
}

export class AccessibilityService {
  private currentState: AccessibilityState = {
    screenReaderEnabled: false,
    reduceMotionEnabled: false,
    highContrastEnabled: false,
    largeTextEnabled: false,
    voiceOverEnabled: false,
  };

  /**
   * Initialiser le service d'accessibilité
   */
  async initialize(): Promise<void> {
    try {
      // Détecter les préférences système
      await this.detectSystemPreferences();
      
      // Appliquer les paramètres utilisateur
      await this.applyUserSettings();
      
      // Écouter les changements système
      this.setupSystemListeners();
      
      console.log('♿ Service d\'accessibilité initialisé');
    } catch (error) {
      console.error('Erreur initialisation accessibilité:', error);
    }
  }

  /**
   * Détecter les préférences d'accessibilité système
   */
  private async detectSystemPreferences(): Promise<void> {
    try {
      // Lecteur d'écran
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.currentState.screenReaderEnabled = screenReaderEnabled;
      
      // Animations réduites
      const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      this.currentState.reduceMotionEnabled = reduceMotionEnabled;
      
      // Appliquer automatiquement si détecté
      if (screenReaderEnabled) {
        await settingsService.updateSetting('screenReader', true);
        await settingsService.updateSetting('voiceGuidance', 'detailed');
      }
      
      if (reduceMotionEnabled) {
        await settingsService.updateSetting('reducedMotion', true);
      }
      
    } catch (error) {
      console.warn('Impossible de détecter les préférences système:', error);
    }
  }

  /**
   * Appliquer les paramètres utilisateur
   */
  private async applyUserSettings(): Promise<void> {
    const settings = settingsService.getSettings();
    
    // Appliquer les paramètres d'accessibilité
    this.currentState.highContrastEnabled = settings.highContrast;
    this.currentState.largeTextEnabled = settings.fontSize !== 'normal';
  }

  /**
   * Configurer les listeners pour les changements système
   */
  private setupSystemListeners(): void {
    // Écouter les changements de lecteur d'écran
    AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      this.currentState.screenReaderEnabled = enabled;
      this.handleScreenReaderChange(enabled);
    });

    // Écouter les changements d'animations réduites
    AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      this.currentState.reduceMotionEnabled = enabled;
      this.handleReduceMotionChange(enabled);
    });
  }

  /**
   * Gérer l'activation/désactivation du lecteur d'écran
   */
  private async handleScreenReaderChange(enabled: boolean): Promise<void> {
    console.log(`📱 Lecteur d'écran ${enabled ? 'activé' : 'désactivé'}`);
    
    if (enabled) {
      // Activer le guidage vocal détaillé
      await settingsService.updateSetting('voiceGuidance', 'detailed');
      await settingsService.updateSetting('screenReader', true);
      
      // Désactiver les animations pour éviter la confusion
      await settingsService.updateSetting('reducedMotion', true);
    }
  }

  /**
   * Gérer l'activation des animations réduites
   */
  private async handleReduceMotionChange(enabled: boolean): Promise<void> {
    console.log(`🎬 Animations réduites ${enabled ? 'activées' : 'désactivées'}`);
    await settingsService.updateSetting('reducedMotion', enabled);
  }

  /**
   * Annoncer un message au lecteur d'écran
   */
  announceToScreenReader(message: string, priority: 'low' | 'high' = 'low'): void {
    if (this.currentState.screenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
      console.log(`📢 Annonce lecteur d'écran: ${message}`);
    }
  }

  /**
   * Vérifier si une fonctionnalité d'accessibilité est active
   */
  isFeatureEnabled(feature: keyof AccessibilityState): boolean {
    return this.currentState[feature];
  }

  /**
   * Obtenir l'état complet d'accessibilité
   */
  getAccessibilityState(): AccessibilityState {
    return { ...this.currentState };
  }

  /**
   * Générer un rapport d'accessibilité
   */
  generateAccessibilityReport(): string {
    const settings = settingsService.getSettings();
    
    let report = `# Rapport d'Accessibilité - EcoRun\n\n`;
    report += `**Référentiel : WCAG 2.1 AA + React Native Accessibility Guidelines**\n\n`;
    
    report += `## État Actuel\n\n`;
    report += `### Préférences Système Détectées\n`;
    report += `- 📱 Lecteur d'écran : ${this.currentState.screenReaderEnabled ? 'Actif' : 'Inactif'}\n`;
    report += `- 🎬 Animations réduites : ${this.currentState.reduceMotionEnabled ? 'Actif' : 'Inactif'}\n`;
    report += `- 🔍 Contraste élevé : ${this.currentState.highContrastEnabled ? 'Actif' : 'Inactif'}\n\n`;
    
    report += `### Paramètres Utilisateur\n`;
    report += `- 📝 Taille de police : ${settings.fontSize}\n`;
    report += `- 🔊 Guidage vocal : ${settings.voiceGuidance}\n`;
    report += `- 📳 Retour haptique : ${settings.hapticFeedback ? 'Activé' : 'Désactivé'}\n`;
    report += `- 🌙 Thème : ${settings.theme}\n\n`;
    
    report += `## Conformité WCAG 2.1 AA\n\n`;
    
    const wcagResults = wcagChecker.runFullWCAGAudit();
    
    wcagResults.forEach(result => {
      report += `### ${result.guideline} (Niveau ${result.level})\n`;
      report += `**Statut : ${result.compliant ? '✅ CONFORME' : '❌ NON CONFORME'}**\n\n`;
      
      if (result.implemented.length > 0) {
        report += `**Implémenté :**\n`;
        result.implemented.forEach(item => {
          report += `- ✅ ${item}\n`;
        });
        report += '\n';
      }
      
      if (result.missing.length > 0) {
        report += `**À implémenter (Priorité ${result.priority}) :**\n`;
        result.missing.forEach(item => {
          report += `- ⚠️ ${item}\n`;
        });
        report += '\n';
      }
    });
    
    return report;
  }

  /**
   * Recommandations spécifiques pour personnes en situation de handicap
   */
  getHandicapRecommendations(): string {
    return `# Recommandations Accessibilité par Type de Handicap\n\n` +
    
    `## 👁️ Déficience Visuelle\n` +
    `### Cécité\n` +
    `- ✅ Support VoiceOver/TalkBack complet\n` +
    `- ✅ Navigation au clavier/gestes\n` +
    `- ✅ Descriptions audio des éléments\n` +
    `- 🔄 Guidage vocal pendant activité (à activer)\n\n` +
    
    `### Malvoyance\n` +
    `- ✅ Contraste élevé disponible\n` +
    `- ✅ Tailles de police ajustables (85% à 130%)\n` +
    `- ✅ Zoom jusqu'à 200% supporté\n` +
    `- 🔄 Mode sombre pour réduire fatigue oculaire (à activer)\n\n` +
    
    `## 👂 Déficience Auditive\n` +
    `- ✅ Interface entièrement visuelle\n` +
    `- ✅ Feedback visuel pour toutes les actions\n` +
    `- ✅ Pas de dépendance au son\n` +
    `- 🔄 Sous-titres pour futurs contenus audio\n\n` +
    
    `## 🤲 Déficience Motrice\n` +
    `- ✅ Zones de touch suffisantes (44px minimum)\n` +
    `- ✅ Pas de gestes complexes requis\n` +
    `- ✅ Retour haptique configurable\n` +
    `- ✅ Navigation alternative au touch\n\n` +
    
    `## 🧠 Déficience Cognitive\n` +
    `- ✅ Interface simple et cohérente\n` +
    `- ✅ Instructions claires étape par étape\n` +
    `- ✅ Feedback immédiat sur les actions\n` +
    `- ✅ Pas de limite de temps stricte\n\n` +
    
    `## 🏃‍♂️ Adaptations pour le Sport\n` +
    `### Handisport et Parasport\n` +
    `- 🔄 Mode fauteuil roulant (futur)\n` +
    `- 🔄 Handbike (futur)\n` +
    `- 🔄 Course guidée pour déficients visuels (futur)\n` +
    `- ✅ Calculs écologiques adaptables\n\n`;
  }
}

// Instance singleton
export const accessibilityService = new AccessibilityService();

// Helper pour audit rapide
export const runAccessibilityAudit = () => {
  console.log('♿ Audit d\'accessibilité en cours...');
  const report = accessibilityService.generateAccessibilityReport();
  console.log(report);
  return report;
};