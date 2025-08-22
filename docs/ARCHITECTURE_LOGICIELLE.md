# Architecture Logicielle - EcoRun

## 1. Architecture générale

### Pattern architectural : Clean Architecture
```
┌─────────────────────────────────────────┐
│              Presentation               │
│  (Components, Screens, Navigation)      │
├─────────────────────────────────────────┤
│               Use Cases                 │
│        (Hooks, Business Logic)          │
├─────────────────────────────────────────┤
│              Data Layer                 │
│     (Services, API, Local Storage)      │
├─────────────────────────────────────────┤
│             Infrastructure              │
│    (Supabase, GPS, External APIs)       │
└─────────────────────────────────────────┘
```

## 2. Structure modulaire

### Organisation des fichiers
```
app/                    # Couche Présentation
├── _layout.tsx        # Layout racine + auth
├── (tabs)/            # Navigation principale
│   ├── home.tsx       # Écran accueil
│   ├── tracker.tsx    # Tracker GPS
│   ├── history.tsx    # Historique
│   └── profile.tsx    # Profil utilisateur

hooks/                  # Couche Use Cases
├── useAuth.ts         # Logique authentification
├── useTheme.ts        # Gestion thèmes
└── useFrameworkReady.ts

lib/                    # Couche Data
├── supabase.ts        # Services base de données
├── auth.ts            # Service authentification
├── settings.ts        # Gestion paramètres
└── backgroundTracking.ts

components/             # Composants réutilisables
├── ActivityCard.tsx   # Carte d'activité
└── MapView.tsx        # Composant carte

utils/                  # Utilitaires purs
├── calculations.ts    # Calculs GPS/écologiques
├── formatters.ts      # Formatage données
└── gpsOptimizer.ts    # Optimisation GPS

styles/                 # Système de design
├── colors.ts          # Palette couleurs
├── typography.ts      # Système typographique
└── spacing.ts         # Espacement cohérent
```

## 3. Bonnes pratiques implémentées

### Séparation des responsabilités
- **Composants** : Uniquement présentation
- **Hooks** : Logique métier réutilisable
- **Services** : Accès aux données
- **Utils** : Fonctions pures sans effet de bord

### Patterns utilisés
- **Custom Hooks** : Logique réutilisable
- **Service Layer** : Abstraction des APIs
- **Repository Pattern** : Accès uniforme aux données
- **Observer Pattern** : Gestion des paramètres

## 4. Maintenabilité

### TypeScript strict
```typescript
// Configuration stricte
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

### Interfaces bien définies
```typescript
interface Activity {
  id: string;
  user_id: string;
  activity_type: 'running' | 'biking';
  duration: number;
  distance: number;
  // ...
}
```

### Gestion d'erreurs robuste
```typescript
try {
  const activities = await activityService.getUserActivities(user.id);
  setActivities(activities);
} catch (error) {
  console.error('Erreur chargement:', error);
  Alert.alert('Erreur', 'Impossible de charger les activités');
}
```

## 5. Évolutivité

### Architecture extensible
- **Nouveaux types d'activité** : Ajout dans enum + configuration
- **Nouveaux calculs** : Extension des utils/calculations.ts
- **Nouvelles fonctionnalités** : Hooks réutilisables
- **Nouveaux thèmes** : Extension du système de couleurs

### Préparation futures évolutions
- **Mode sombre** : Infrastructure complète prête
- **Tracking background** : Code préparé pour build standalone
- **Paramètres avancés** : Framework extensible
- **Accessibilité** : Hooks et services préparés