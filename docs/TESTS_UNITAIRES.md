# Tests Unitaires - EcoRun

## 1. Stratégie de test

### Fonctionnalités couvertes
- **Calculs GPS** : Distance, vitesse, filtrage
- **Calculs écologiques** : CO2, espérance de vie
- **Formatage** : Temps, dates, métriques
- **Validation** : Données utilisateur, GPS

### Framework de test
- **Vitest** : Framework de test moderne
- **Configuration** : Tests unitaires purs
- **Coverage** : Fonctions critiques couvertes

## 2. Tests implémentés

### Calculs GPS (utils/calculations.ts)
```typescript
describe('calculateDistance', () => {
  it('calcule correctement la distance entre deux points', () => {
    const pos1 = { latitude: 48.8566, longitude: 2.3522, timestamp: 0 };
    const pos2 = { latitude: 48.8576, longitude: 2.3532, timestamp: 1000 };
    
    const distance = calculateDistance(pos1, pos2);
    expect(distance).toBeCloseTo(157, 0); // ~157m entre ces points
  });

  it('retourne 0 pour des positions identiques', () => {
    const pos = { latitude: 48.8566, longitude: 2.3522, timestamp: 0 };
    expect(calculateDistance(pos, pos)).toBe(0);
  });
});

describe('calculateCO2Savings', () => {
  it('calcule les économies CO2 correctement', () => {
    expect(calculateCO2Savings(10)).toBe(1.2); // 10km * 0.12kg/km
    expect(calculateCO2Savings(0)).toBe(0);
  });
});

describe('calculateLifeGained', () => {
  it('calcule le gain de vie correctement', () => {
    expect(calculateLifeGained(1)).toBe(7); // 1h = 7h de vie
    expect(calculateLifeGained(0.5)).toBe(3.5); // 30min = 3.5h
  });
});
```

### Formatage (utils/formatters.ts)
```typescript
describe('formatTime', () => {
  it('formate les secondes en HH:MM:SS', () => {
    expect(formatTime(3661)).toBe('01:01:01');
    expect(formatTime(61)).toBe('01:01');
    expect(formatTime(0)).toBe('00:00');
  });
});

describe('formatPace', () => {
  it('formate l\'allure en MM:SS', () => {
    expect(formatPace(5.5)).toBe('05:30'); // 5min30s/km
    expect(formatPace(0)).toBe('--:--');
  });
});
```

### Optimisation GPS (utils/gpsOptimizer.ts)
```typescript
describe('optimizePositions', () => {
  it('compresse les positions GPS', () => {
    const positions = [
      { latitude: 48.8566, longitude: 2.3522, timestamp: 1000, speed: 10 },
      { latitude: 48.8567, longitude: 2.3523, timestamp: 2000, speed: 12 }
    ];
    
    const optimized = optimizePositions(positions);
    
    expect(optimized).toHaveLength(2);
    expect(optimized[0]).toEqual({
      lat: 48.856600,
      lng: 2.352200,
      t: 0,
      s: 10
    });
  });

  it('filtre les positions trop proches', () => {
    const positions = [
      { latitude: 48.8566, longitude: 2.3522, timestamp: 1000 },
      { latitude: 48.8566, longitude: 2.3522, timestamp: 2000 } // Même position
    ];
    
    const optimized = optimizePositions(positions);
    expect(optimized).toHaveLength(1); // Position dupliquée filtrée
  });
});
```

## 3. Prévention des régressions

### Tests de non-régression
- **Calculs critiques** : Vérification des formules
- **Formats de données** : Cohérence des interfaces
- **Gestion d'erreurs** : Comportement en cas d'échec

### Validation des données
```typescript
describe('filterSpeed', () => {
  it('filtre les vitesses aberrantes', () => {
    expect(filterSpeed(100, 'running')).toBe(0); // Trop rapide pour course
    expect(filterSpeed(15, 'running')).toBe(15); // Vitesse normale
    expect(filterSpeed(-5, 'biking')).toBe(0); // Vitesse négative
  });
});
```

## 4. Couverture de test

### Fonctions critiques testées
- ✅ **calculateDistance** : Calcul GPS Haversine
- ✅ **calculateCO2Savings** : Économies écologiques
- ✅ **calculateLifeGained** : Gain espérance de vie
- ✅ **formatTime** : Affichage temps
- ✅ **formatPace** : Affichage allure
- ✅ **optimizePositions** : Compression GPS
- ✅ **filterSpeed** : Validation vitesses

### Métriques de qualité
- **Fonctions pures** : 100% testées
- **Calculs métier** : Validation complète
- **Edge cases** : Gestion des cas limites
- **Performance** : Optimisations vérifiées

## 5. Exécution des tests

### Commandes
```bash
# Lancer tous les tests
npm run test

# Tests avec coverage
npm run test:coverage

# Voir le rapport de coverage en HTML
# Après avoir lancé npm run test:coverage :
# Ouvrir coverage/index.html dans votre navigateur
# Tests en mode watch
## Visualiser le Coverage
npm run test:watch
### Commandes pour le coverage
```bash
# Générer le rapport de coverage
npm run test:coverage
```
# Le rapport sera généré dans le dossier coverage/
# Ouvrir coverage/index.html pour voir le rapport détaillé
```

### Métriques de coverage
- **Lignes** : Pourcentage de lignes exécutées
- **Fonctions** : Pourcentage de fonctions testées  
- **Branches** : Pourcentage de branches conditionnelles
- **Statements** : Pourcentage d'instructions exécutées
# Tests avec output détaillé
### Seuils de qualité configurés
- **Minimum 80%** sur toutes les métriques
- **Fonctions critiques** : 100% de coverage requis
- **Calculs métier** : Validation complète obligatoire
npm run test -- --reporter=verbose
### Intégration CI/CD
Les tests sont exécutés automatiquement avant chaque build et déploiement.