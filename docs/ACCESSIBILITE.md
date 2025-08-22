# Accessibilité - EcoRun

## 1. Mesures d'accessibilité implémentées

### Interface préparée pour l'accessibilité
L'application intègre une infrastructure complète de paramètres d'accessibilité, prête à être activée dans une version future.

### Système de paramètres accessibilité
```typescript
interface AppSettings {
  // Accessibilité visuelle
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  
  // Accessibilité auditive
  voiceGuidance: 'none' | 'basic' | 'detailed';
  
  // Accessibilité motrice
  hapticFeedback: boolean;
  
  // Accessibilité cognitive
  screenReader: boolean;
}
```

## 2. Adaptations pour personnes en situation de handicap

### Déficience visuelle
- **Tailles de police** : 4 niveaux configurables (85% à 130%)
- **Contraste élevé** : Palette de couleurs haute visibilité
- **Lecteur d'écran** : Détection automatique et adaptation
- **Navigation** : Structure claire avec landmarks

### Déficience auditive
- **Guidage vocal** : Infrastructure pour annonces pendant l'activité
- **Feedback visuel** : Notifications visuelles alternatives
- **Sous-titres** : Préparé pour contenus multimédias futurs

### Déficience motrice
- **Vibrations** : Feedback haptique configurable
- **Zones de touch** : Boutons suffisamment grands (44px minimum)
- **Navigation** : Accessible au clavier/switch control
- **Gestes** : Alternatives aux gestes complexes

### Déficience cognitive
- **Interface simple** : Navigation claire et cohérente
- **Animations réduites** : Respect des préférences système
- **Feedback clair** : Messages d'erreur explicites
- **Progression** : Indicateurs visuels des étapes

## 3. Détection automatique des préférences

### Intégration système
```typescript
// Détection automatique des préférences d'accessibilité
const detectSystemPreferences = async () => {
  // Lecteur d'écran
  const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
  
  // Animations réduites
  const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
  
  // Application automatique des paramètres
  if (screenReaderEnabled) {
    await updateSetting('screenReader', true);
    await updateSetting('voiceGuidance', 'detailed');
  }
};
```

### Respect des préférences système
- **prefers-reduced-motion** : Animations adaptées
- **prefers-color-scheme** : Thème automatique
- **font-size** : Respect des préférences système
- **contrast** : Adaptation automatique

## 4. Actions spécifiques pour l'accessibilité

### Navigation accessible
```typescript
// Structure sémantique claire
<View accessibilityRole="main">
  <Text accessibilityRole="header">Statistiques</Text>
  <TouchableOpacity 
    accessibilityRole="button"
    accessibilityLabel="Démarrer une activité de course"
    accessibilityHint="Ouvre le tracker GPS pour commencer à courir"
  >
    Démarrer
  </TouchableOpacity>
</View>
```

### Labels et descriptions
- **accessibilityLabel** : Description claire de chaque élément
- **accessibilityHint** : Explication de l'action
- **accessibilityRole** : Rôle sémantique défini
- **accessibilityState** : État des éléments interactifs

## 5. Adaptations pour le sport et handicap

### Approche inclusive du sport
Bien que l'application soit centrée sur la course et le vélo, elle reconnaît que :

- **Handisport** : Nombreuses disciplines adaptées
- **Parasport** : Compétitions paralympiques
- **Sport adapté** : Activités pour déficiences intellectuelles
- **Inclusion** : Sport pour tous, adaptations possibles

### Évolutions futures possibles
- **Fauteuil roulant** : Mode spécifique avec calculs adaptés
- **Handbike** : Variante vélo pour membres supérieurs
- **Course guidée** : Mode pour déficients visuels avec guide
- **Activités adaptées** : Autres sports accessibles

### Calculs écologiques adaptés
```typescript
// Préparation pour modes accessibles futurs
const ACTIVITY_CONFIG = {
  running: { co2Factor: 0.12 },
  biking: { co2Factor: 0.12 },
  // Futurs modes
  wheelchair: { co2Factor: 0.12 }, // Même bénéfice écologique
  handbike: { co2Factor: 0.12 },
};
```

## 6. Interface utilisateur accessible

### Design inclusif
- **Couleurs** : Contraste minimum 4.5:1 (WCAG AA)
- **Typographie** : Police lisible, tailles adaptables
- **Espacement** : Zones de touch suffisantes
- **Feedback** : Retour visuel et tactile

### Navigation cohérente
```typescript
// Navigation prévisible
const TabLayout = () => (
  <Tabs screenOptions={{
    tabBarAccessibilityRole: 'tablist',
    headerShown: false,
  }}>
    <Tabs.Screen 
      name="home"
      options={{
        title: 'Accueil',
        tabBarAccessibilityLabel: 'Accueil, onglet 1 sur 4',
      }}
    />
  </Tabs>
);
```

## 7. Tests d'accessibilité

### Vérifications automatiques
- **Contraste** : Validation des ratios de couleurs
- **Tailles** : Vérification des zones de touch
- **Labels** : Présence des descriptions
- **Navigation** : Ordre logique des éléments

### Tests manuels
- **Lecteur d'écran** : Test avec VoiceOver/TalkBack
- **Navigation clavier** : Accessibilité sans touch
- **Zoom** : Fonctionnement à 200% de zoom
- **Préférences** : Respect des paramètres système

## 8. Conformité aux standards

### WCAG 2.1 (préparé)
- **Niveau AA** : Objectif de conformité
- **Perceptible** : Contenu accessible à tous
- **Utilisable** : Interface navigable
- **Compréhensible** : Information claire
- **Robuste** : Compatible technologies d'assistance

### Standards mobiles
- **iOS** : Human Interface Guidelines
- **Android** : Material Design Accessibility
- **React Native** : Accessibility API
- **Expo** : Bonnes pratiques accessibilité

## 9. Documentation utilisateur accessible

### Manuel d'utilisation adapté
- **Format multiple** : Texte, audio (futur), vidéo sous-titrée
- **Langue simple** : Vocabulaire accessible
- **Structure claire** : Titres, listes, étapes
- **Exemples concrets** : Cas d'usage détaillés

### Support utilisateur
- **FAQ accessibilité** : Questions spécifiques
- **Contact** : Support dédié aux besoins spéciaux
- **Communauté** : Retours utilisateurs handicapés
- **Évolutions** : Roadmap inclusive