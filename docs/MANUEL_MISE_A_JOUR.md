# Manuel de Mise à Jour - EcoRun

## 1. Processus de mise à jour

### Vue d'ensemble
Ce manuel décrit les procédures pour mettre à jour l'application EcoRun de manière sécurisée et sans interruption de service.

### Types de mises à jour
- **Patch** (1.0.x) : Corrections de bugs, améliorations mineures
- **Minor** (1.x.0) : Nouvelles fonctionnalités, améliorations
- **Major** (x.0.0) : Changements majeurs, breaking changes

## 2. Préparation de la mise à jour

### Vérifications préalables
```bash
# Vérifier l'état du repository
git status
git pull origin main

# Vérifier les tests
npm run test
npm run lint

# Vérifier les dépendances
npm audit
npm outdated
```

### Sauvegarde
```bash
# Sauvegarde de la base de données Supabase
# Via le dashboard Supabase > Settings > Database > Backup

# Sauvegarde du code
git tag backup-$(date +%Y%m%d-%H%M%S)
git push origin --tags
```

## 3. Mise à jour des dépendances

### Dépendances npm
```bash
# Mise à jour des dépendances mineures
npm update

# Mise à jour majeure (avec précaution)
npm install package@latest

# Vérification après mise à jour
npm audit fix
npm run test
```

### Dépendances Expo
```bash
# Mise à jour du SDK Expo
expo install --fix

# Vérification de compatibilité
expo doctor
```

## 4. Mise à jour de la base de données

### Migrations Supabase
```sql
-- Créer une nouvelle migration
-- Fichier: supabase/migrations/YYYYMMDD_description.sql

/*
  # Description de la mise à jour
  
  1. Changements
    - Description des modifications
  
  2. Impact
    - Évaluation de l'impact sur les données existantes
*/

-- Exemple de migration
ALTER TABLE activities ADD COLUMN IF NOT EXISTS new_field text;

-- Mise à jour des données existantes si nécessaire
UPDATE activities SET new_field = 'default_value' WHERE new_field IS NULL;
```

### Application des migrations
1. **Test en développement** d'abord
2. **Validation** des données
3. **Application en production** via Supabase Dashboard

## 5. Mise à jour du code

### Nouvelles fonctionnalités
```bash
# Créer une branche de développement
git checkout -b feature/nouvelle-fonctionnalite

# Développement et tests
# ...

# Merge vers main
git checkout main
git merge feature/nouvelle-fonctionnalite
```

### Corrections de bugs
```bash
# Branche de correction
git checkout -b fix/correction-bug

# Implémentation de la correction
# ...

# Tests de non-régression
npm run test

# Merge
git checkout main
git merge fix/correction-bug
```

## 6. Versioning

### Mise à jour du numéro de version
```json
// package.json
{
  "version": "1.1.0"
}

// app.json
{
  "expo": {
    "version": "1.1.0"
  }
}
```

### Création du tag
```bash
# Tag de version
git tag v1.1.0
git push origin v1.1.0

# Notes de version
git tag -a v1.1.0 -m "Version 1.1.0 - Nouvelles fonctionnalités cartes"
```

## 7. Tests de mise à jour

### Tests automatisés
```bash
# Suite complète de tests
npm run test

# Tests d'intégration
npm run test:integration

# Tests de performance
npm run test:performance
```

### Tests manuels
- [ ] Authentification fonctionne
- [ ] Nouvelles fonctionnalités opérationnelles
- [ ] Fonctionnalités existantes préservées
- [ ] Migration des données réussie
- [ ] Performance maintenue

## 8. Déploiement de la mise à jour

### Environnement de staging
```bash
# Build de test
npm run build:web

# Déploiement staging
expo publish --release-channel staging

# Tests sur staging
# Validation par l'équipe
```

### Déploiement production
```bash
# Build production
npm run build:web

# Déploiement
expo publish --release-channel production

# Monitoring post-déploiement
```

## 9. Communication

### Notes de version
```markdown
# Version 1.1.0 - Date

## 🆕 Nouvelles fonctionnalités
- Cartes interactives avec 3 thèmes
- Amélioration de l'interface utilisateur

## 🐛 Corrections
- Correction du bug de sauvegarde GPS
- Amélioration de la précision des calculs

## 🔧 Améliorations techniques
- Optimisation des performances
- Mise à jour des dépendances de sécurité

## ⚠️ Notes importantes
- Aucune action requise de la part des utilisateurs
- Mise à jour automatique via les stores
```

### Communication utilisateurs
- **Email** : Notification des nouvelles fonctionnalités
- **In-app** : Message de bienvenue pour les nouveautés
- **Documentation** : Mise à jour du manuel utilisateur

## 10. Rollback en cas de problème

### Procédure d'urgence
```bash
# Retour à la version précédente
git checkout v1.0.9
npm install
npm run build:web
expo publish --release-channel production
```

### Rollback base de données
```sql
-- Migration de rollback si nécessaire
-- Toujours tester en développement d'abord

-- Exemple
ALTER TABLE activities DROP COLUMN IF EXISTS new_field;
```

## 11. Monitoring post-mise à jour

### Métriques à surveiller
- **Taux d'erreur** : Augmentation anormale
- **Performance** : Dégradation des temps de réponse
- **Utilisation** : Adoption des nouvelles fonctionnalités
- **Feedback** : Retours utilisateurs

### Outils de monitoring
```bash
# Logs Expo
expo logs --platform all

# Métriques Supabase
# Dashboard Supabase > Analytics

# Monitoring custom
# Intégration Sentry ou service similaire
```

## 12. Documentation post-mise à jour

### Mise à jour des manuels
- [ ] Manuel d'utilisation
- [ ] Manuel de déploiement
- [ ] Documentation technique
- [ ] Cahier de recettes

### Mise à jour du README
```markdown
## Version actuelle : 1.1.0

### Dernières nouveautés
- Cartes interactives
- Interface améliorée
- Performances optimisées
```

## 13. Checklist de mise à jour

### Avant la mise à jour
- [ ] Tests passent en local
- [ ] Code review effectuée
- [ ] Migrations testées
- [ ] Sauvegarde effectuée
- [ ] Communication préparée

### Pendant la mise à jour
- [ ] Déploiement staging réussi
- [ ] Tests de validation OK
- [ ] Migrations appliquées
- [ ] Déploiement production
- [ ] Monitoring activé

### Après la mise à jour
- [ ] Fonctionnalités vérifiées
- [ ] Métriques normales
- [ ] Utilisateurs informés
- [ ] Documentation mise à jour
- [ ] Équipe informée

## 14. Planification des mises à jour

### Calendrier type
- **Patches** : Selon les besoins (bugs critiques)
- **Minor** : Mensuel ou bimensuel
- **Major** : Trimestriel ou semestriel

### Fenêtres de maintenance
- **Heures creuses** : 2h-6h du matin
- **Jours** : Mardi ou mercredi (éviter lundi/vendredi)
- **Durée** : Maximum 2h pour les mises à jour majeures

### Communication préalable
- **7 jours** avant pour les mises à jour majeures
- **24h** avant pour les mises à jour mineures
- **Immédiat** pour les corrections critiques

Ce manuel garantit des mises à jour sûres et contrôlées de l'application EcoRun, minimisant les risques et maximisant la satisfaction utilisateur.