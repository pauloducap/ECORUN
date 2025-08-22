# Frameworks et Paradigmes de Développement - EcoRun

## 1. Frameworks utilisés

### React Native + Expo
**Choix stratégique** : Développement cross-platform avec écosystème mature

```typescript
// Configuration Expo moderne
{
  "expo": {
    "name": "EcoRun",
    "platforms": ["ios", "android"],
    "jsEngine": "hermes",        // Performance optimisée
    "newArchEnabled": true,      // Nouvelle architecture React Native
    "plugins": [
      "expo-router",             // Navigation moderne
      "expo-location",           // GPS haute précision
      "expo-notifications"       // Push notifications
    ]
  }
}
```

**Avantages exploités** :
- **Développement rapide** : Un code, deux plateformes
- **Écosystème riche** : Plugins natifs prêts à l'emploi
- **Hot reload** : Développement itératif efficace
- **OTA Updates** : Mises à jour sans store

### Expo Router v4
**Navigation moderne** basée sur le système de fichiers

```typescript
// Structure de navigation intuitive
app/
├── _layout.tsx           # Layout racine
├── (tabs)/              # Navigation par onglets
│   ├── _layout.tsx      # Configuration tabs
│   ├── home.tsx         # Écran d'accueil
│   ├── tracker.tsx      # Tracker GPS
│   └── profile.tsx      # Profil utilisateur
└── auth.tsx             # Authentification
```

**Paradigme file-based routing** :
- **Convention over configuration** : Structure claire
- **Type safety** : Routes typées automatiquement
- **Nested layouts** : Layouts imbriqués naturellement

### Supabase (Backend-as-a-Service)
**Backend moderne** avec sécurité intégrée

```typescript
// Configuration sécurisée
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,    // Gestion automatique des tokens
    persistSession: true,      // Sessions persistantes
    detectSessionInUrl: false, // Sécurité renforcée
  },
});
```

**Fonctionnalités exploitées** :
- **PostgreSQL** : Base de données relationnelle robuste
- **Row Level Security** : Sécurité au niveau des lignes
- **Real-time** : Synchronisation temps réel
- **Auth** : Authentification complète intégrée

## 2. Paradigmes de développement

### Clean Architecture
**Séparation des responsabilités** en couches distinctes

```typescript
// Couche Présentation (UI)
const HomeScreen = () => {
  const { user } = useAuth();           // Hook métier
  const stats = useUserStats(user.id);  // Logique réutilisable
  
  return <StatsDisplay stats={stats} />; // Composant pur
};

// Couche Use Cases (Hooks)
export const useUserStats = (userId: string) => {
  const [stats, setStats] = useState<UserStats>();
  
  useEffect(() => {
    const loadStats = async () => {
      const activities = await activityService.getUserActivities(userId);
      setStats(calculateStats(activities));
    };
    loadStats();
  }, [userId]);
  
  return stats;
};

// Couche Data (Services)
export const activityService = {
  async getUserActivities(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }
};
```

**Bénéfices** :
- **Testabilité** : Chaque couche testable indépendamment
- **Maintenabilité** : Changements isolés par couche
- **Réutilisabilité** : Logique métier réutilisable
- **Évolutivité** : Ajout de fonctionnalités facilité

### Functional Programming
**Programmation fonctionnelle** avec fonctions pures

```typescript
// Fonctions pures pour les calculs
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  const R = 6371000; // Rayon terrestre
  const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
  const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1.latitude * Math.PI / 180) * 
    Math.cos(pos2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * R;
};

// Composition de fonctions
export const calculateEcoMetrics = (positions: Position[]) => 
  pipe(
    positions,
    calculateTotalDistance,
    distance => ({
      co2Saved: calculateCO2Savings(distance),
      lifeGained: calculateLifeGained(distance / averageSpeed)
    })
  );
```

**Avantages** :
- **Prédictibilité** : Pas d'effets de bord
- **Testabilité** : Tests simples et fiables
- **Composabilité** : Fonctions combinables
- **Parallélisation** : Calculs parallélisables

### Reactive Programming
**Programmation réactive** avec hooks et observables

```typescript
// Hook réactif pour le tracking GPS
export const useGPSTracking = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  useEffect(() => {
    if (!isTracking) return;
    
    const subscription = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation },
      (location) => {
        const newPosition = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        };
        setPosition(newPosition);
      }
    );
    
    return () => subscription.then(sub => sub.remove());
  }, [isTracking]);
  
  return { position, isTracking, setIsTracking };
};
```

**Patterns réactifs** :
- **Observer** : Écoute des changements d'état
- **Publisher-Subscriber** : Communication découplée
- **Data flow** : Flux de données unidirectionnel

### Component-Driven Development
**Développement par composants** réutilisables

```typescript
// Composant atomique
export const EcoMetric: React.FC<EcoMetricProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color 
}) => (
  <View style={styles.container}>
    <Icon size={24} color={color} />
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color }]}>{value}</Text>
    <Text style={styles.unit}>{unit}</Text>
  </View>
);

// Composant composé
export const EcoMetricsDisplay: React.FC<{ metrics: EcoMetrics }> = ({ metrics }) => (
  <View style={styles.metricsContainer}>
    <EcoMetric
      icon={Leaf}
      label="CO2 économisé"
      value={metrics.co2Saved.toFixed(2)}
      unit="kg"
      color={colors.success}
    />
    <EcoMetric
      icon={Heart}
      label="Vie gagnée"
      value={metrics.lifeGained.toFixed(1)}
      unit="h"
      color={colors.error}
    />
  </View>
);
```

**Principes appliqués** :
- **Single Responsibility** : Un composant, une responsabilité
- **Composition** : Assemblage de composants simples
- **Props interface** : Contrats clairs entre composants
- **Réutilisabilité** : Composants génériques

## 3. Patterns architecturaux

### Repository Pattern
**Abstraction de l'accès aux données**

```typescript
// Interface du repository
interface ActivityRepository {
  getUserActivities(userId: string): Promise<Activity[]>;
  createActivity(activity: CreateActivityData): Promise<Activity>;
  deleteActivity(id: string): Promise<void>;
}

// Implémentation Supabase
export class SupabaseActivityRepository implements ActivityRepository {
  async getUserActivities(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new RepositoryError(error.message);
    return data?.map(this.mapToActivity) || [];
  }
  
  private mapToActivity(data: any): Activity {
    return {
      ...data,
      positions: this.restorePositions(data.positions)
    };
  }
}
```

### Service Layer Pattern
**Logique métier centralisée**

```typescript
// Service de calculs écologiques
export class EcoCalculationService {
  private readonly CO2_EMISSIONS_CAR = 0.12; // kg/km
  private readonly LIFE_MULTIPLIER = 7; // 1h sport = 7h vie
  
  calculateCO2Savings(distanceKm: number): number {
    return distanceKm * this.CO2_EMISSIONS_CAR;
  }
  
  calculateLifeGained(durationHours: number): number {
    return durationHours * this.LIFE_MULTIPLIER;
  }
  
  calculateEcoMetrics(activity: ActivityData): EcoMetrics {
    const distanceKm = activity.distance / 1000;
    const durationHours = activity.duration / 3600;
    
    return {
      co2Saved: this.calculateCO2Savings(distanceKm),
      lifeGained: this.calculateLifeGained(durationHours),
      distance: distanceKm,
      duration: activity.duration
    };
  }
}
```

### Observer Pattern
**Gestion des événements et notifications**

```typescript
// Gestionnaire d'événements GPS
export class GPSEventManager {
  private listeners: Map<string, Function[]> = new Map();
  
  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    
    // Retourne fonction de désabonnement
    return () => {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }
  
  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

// Usage dans un hook
export const useGPSEvents = () => {
  useEffect(() => {
    const unsubscribe = gpsEventManager.subscribe('position_update', (position) => {
      console.log('Nouvelle position:', position);
    });
    
    return unsubscribe;
  }, []);
};
```

## 4. Paradigmes de sécurité

### Security by Design
**Sécurité intégrée dès la conception**

```sql
-- Row Level Security au niveau base
CREATE POLICY "Users can only access own data"
  ON activities FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

```typescript
// Validation côté client
const validateActivityData = (data: Partial<Activity>): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.duration || data.duration <= 0) {
    errors.push('Durée invalide');
  }
  
  if (!data.distance || data.distance < 0) {
    errors.push('Distance invalide');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### Privacy by Design
**Confidentialité intégrée**

```typescript
// Anonymisation des données GPS
export const anonymizeGPSData = (positions: Position[]): AnonymizedPosition[] => {
  return positions.map(pos => ({
    // Réduction de précision pour protection vie privée
    lat: Math.round(pos.latitude * 100000) / 100000,  // ~1m précision
    lng: Math.round(pos.longitude * 100000) / 100000,
    timestamp: pos.timestamp - positions[0].timestamp, // Temps relatif
    // Suppression des métadonnées sensibles
  }));
};
```

## 5. Paradigmes de performance

### Lazy Loading
**Chargement à la demande**

```typescript
// Lazy loading des composants lourds
const MapView = lazy(() => import('@/components/MapView'));
const ActivityDetail = lazy(() => import('@/screens/ActivityDetail'));

// Usage avec Suspense
const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Router>
      <Route path="/map" component={MapView} />
      <Route path="/activity/:id" component={ActivityDetail} />
    </Router>
  </Suspense>
);
```

### Memoization
**Optimisation des recalculs**

```typescript
// Mémorisation des calculs coûteux
export const useEcoMetrics = (activities: Activity[]) => {
  return useMemo(() => {
    return activities.reduce((acc, activity) => ({
      totalCO2: acc.totalCO2 + activity.co2_saved,
      totalLife: acc.totalLife + activity.life_gained,
      totalDistance: acc.totalDistance + activity.distance,
    }), { totalCO2: 0, totalLife: 0, totalDistance: 0 });
  }, [activities]);
};

// Mémorisation des composants
export const ActivityCard = memo<ActivityCardProps>(({ activity }) => {
  return (
    <View style={styles.card}>
      <Text>{activity.activity_type}</Text>
      <Text>{formatDistance(activity.distance)}</Text>
    </View>
  );
});
```

## 6. Paradigmes de test

### Test-Driven Development (TDD)
**Tests d'abord, code ensuite**

```typescript
// Test d'abord
describe('calculateDistance', () => {
  it('should calculate distance between two GPS points', () => {
    const pos1 = { latitude: 48.8566, longitude: 2.3522, timestamp: 0 };
    const pos2 = { latitude: 48.8576, longitude: 2.3532, timestamp: 1000 };
    
    const distance = calculateDistance(pos1, pos2);
    
    expect(distance).toBeCloseTo(157, 0); // ~157m attendu
  });
});

// Implémentation ensuite
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  // Implémentation de la formule Haversine
  // ...
};
```

### Behavior-Driven Development (BDD)
**Tests comportementaux**

```typescript
// Scénarios utilisateur
describe('Activity Tracking', () => {
  describe('When user starts a running activity', () => {
    it('should initialize GPS tracking', async () => {
      const tracker = new ActivityTracker();
      
      await tracker.startActivity('running');
      
      expect(tracker.isTracking).toBe(true);
      expect(tracker.activityType).toBe('running');
    });
    
    it('should calculate eco metrics in real-time', async () => {
      const tracker = new ActivityTracker();
      await tracker.startActivity('running');
      
      // Simuler mouvement
      tracker.updatePosition(mockPosition1);
      tracker.updatePosition(mockPosition2);
      
      const metrics = tracker.getCurrentMetrics();
      expect(metrics.co2Saved).toBeGreaterThan(0);
      expect(metrics.lifeGained).toBeGreaterThan(0);
    });
  });
});
```

## 7. Conclusion sur les paradigmes

### Synergie des approches
L'application EcoRun combine harmonieusement :
- **Frameworks modernes** : React Native + Expo + Supabase
- **Architecture propre** : Clean Architecture + patterns éprouvés
- **Paradigmes fonctionnels** : Fonctions pures + composition
- **Sécurité intégrée** : Security & Privacy by Design
- **Performance optimisée** : Lazy loading + memoization
- **Qualité assurée** : TDD + BDD

### Bénéfices obtenus
- **Maintenabilité** : Code structuré et modulaire
- **Évolutivité** : Architecture extensible
- **Performance** : Optimisations ciblées
- **Sécurité** : Protection des données utilisateur
- **Qualité** : Tests automatisés et validation continue

Cette approche multi-paradigme garantit un code **professionnel, robuste et évolutif**, répondant aux exigences d'une application mobile moderne.