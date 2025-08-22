# Manuel de Déploiement - EcoRun

## 1. Prérequis techniques

### Environnement de développement
- **Node.js** : Version 18.x ou supérieure
- **npm** : Version 8.x ou supérieure
- **Expo CLI** : `npm install -g @expo/cli`
- **Git** : Pour la gestion des versions
- **Compte Supabase** : Pour la base de données

### Outils requis
```bash
# Vérification des versions
node --version    # v18.x.x
npm --version     # 8.x.x
expo --version    # 0.x.x
git --version     # 2.x.x
```

## 2. Installation initiale

### Clonage du repository
```bash
# Cloner le projet
git clone [repository-url]
cd ecorun-app

# Vérifier la structure
ls -la
# Doit contenir : app/, lib/, components/, package.json, etc.
```

### Installation des dépendances
```bash
# Installation des packages npm
npm install

# Vérification de l'installation
npm list --depth=0
```

### Configuration des variables d'environnement
```bash
# Créer le fichier .env (si pas déjà présent)
touch .env

# Contenu du .env (sera configuré via Bolt)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Configuration Supabase

### Étape 1 : Création du projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anonyme

### Étape 2 : Configuration dans Bolt
1. Cliquer sur "Connect to Supabase" dans l'interface Bolt
2. Saisir les informations du projet Supabase
3. Les variables d'environnement seront configurées automatiquement

### Étape 3 : Application des migrations
```sql
-- Les migrations sont dans /supabase/migrations/
-- Elles seront appliquées automatiquement via Bolt

-- Vérification manuelle si nécessaire :
-- 1. Aller dans Supabase Dashboard > SQL Editor
-- 2. Exécuter le contenu des fichiers de migration dans l'ordre
```

## 4. Déploiement en développement

### Lancement du serveur de développement
```bash
# Démarrage avec Expo
npm run dev

# Alternative avec options
EXPO_NO_TELEMETRY=1 expo start

# Avec tunnel (pour tests sur device physique)
expo start --tunnel
```

### Vérification du déploiement
1. **Interface web** : Ouvrir l'URL affichée dans le terminal
2. **Expo Go** : Scanner le QR code avec l'app Expo Go
3. **Simulateur** : Appuyer sur 'i' (iOS) ou 'a' (Android)

### Tests de fonctionnement
```bash
# Vérifier que l'app se lance sans erreur
# Tester l'authentification
# Vérifier la connexion Supabase
# Tester le GPS (sur device physique uniquement)
```

## 5. Build de production

### Build web
```bash
# Build pour le web
npm run build:web

# Vérification du build
ls -la dist/
# Doit contenir les fichiers statiques
```

### Build mobile (EAS Build)
```bash
# Installation EAS CLI
npm install -g eas-cli

# Login EAS
eas login

# Configuration du build
eas build:configure

# Build Android
eas build --platform android

# Build iOS (nécessite compte Apple Developer)
eas build --platform ios
```

## 6. Déploiement production

### Déploiement web
```bash
# Via Expo
expo export --platform web
expo publish

# Via services tiers (Netlify, Vercel, etc.)
# Utiliser le dossier dist/ généré par le build
```

### Déploiement mobile
```bash
# Soumission aux stores
eas submit --platform android
eas submit --platform ios

# Ou téléchargement manuel des APK/IPA
# depuis le dashboard EAS
```

## 7. Configuration des environnements

### Environnement de développement
```json
// app.json - configuration dev
{
  "expo": {
    "name": "EcoRun Dev",
    "slug": "ecorun-dev",
    "version": "1.0.0-dev"
  }
}
```

### Environnement de production
```json
// app.json - configuration prod
{
  "expo": {
    "name": "EcoRun",
    "slug": "ecorun",
    "version": "1.0.0"
  }
}
```

### Variables d'environnement par environnement
```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key

# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
```

## 8. Vérifications post-déploiement

### Tests fonctionnels
```bash
# Checklist de vérification
□ Application se lance sans erreur
□ Authentification fonctionne
□ Connexion Supabase établie
□ GPS fonctionne (sur device)
□ Sauvegarde des activités
□ Cartes s'affichent correctement
□ Historique accessible
□ Profil utilisateur modifiable
```

### Tests de performance
```bash
# Métriques à vérifier
□ Temps de démarrage < 3s
□ Acquisition GPS < 10s
□ Sauvegarde activité < 5s
□ Chargement historique < 3s
□ Navigation fluide (60fps)
```

## 9. Monitoring et maintenance

### Logs et monitoring
```bash
# Logs Expo
expo logs

# Logs Supabase
# Accessible via le dashboard Supabase > Logs

# Monitoring des erreurs
# Configurer Sentry ou service similaire
```

### Métriques importantes
- **Taux d'erreur** : < 1%
- **Temps de réponse API** : < 2s
- **Disponibilité** : > 99%
- **Satisfaction utilisateur** : Retours positifs

## 10. Procédures de rollback

### Rollback rapide
```bash
# Retour à la version précédente
git checkout [previous-tag]
npm install
npm run build:web
expo publish
```

### Rollback base de données
```sql
-- Utiliser les migrations Supabase
-- Créer une migration de rollback si nécessaire
-- Tester en environnement de développement d'abord
```

## 11. Troubleshooting

### Problèmes courants

#### Erreur de build
```bash
# Nettoyer le cache
expo r -c
npm run dev
```

#### Problème Supabase
```bash
# Vérifier les variables d'environnement
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY

# Tester la connexion
npm run debug:supabase
```

#### Problème GPS
```bash
# Vérifier les permissions dans app.json
# Tester sur device physique uniquement
# Vérifier la configuration Expo Location
```

### Support et documentation
- **Documentation Expo** : [docs.expo.dev](https://docs.expo.dev)
- **Documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Support technique** : Issues GitHub du projet

## 12. Checklist de déploiement

### Avant déploiement
- [ ] Tests unitaires passent
- [ ] Tests fonctionnels validés
- [ ] Code review effectuée
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Documentation mise à jour

### Pendant déploiement
- [ ] Build réussi sans erreur
- [ ] Déploiement sans interruption
- [ ] Vérification des logs
- [ ] Tests de smoke réussis

### Après déploiement
- [ ] Application accessible
- [ ] Fonctionnalités principales testées
- [ ] Monitoring activé
- [ ] Équipe informée
- [ ] Documentation de déploiement mise à jour

Ce manuel garantit un déploiement fiable et reproductible de l'application EcoRun dans tous les environnements.