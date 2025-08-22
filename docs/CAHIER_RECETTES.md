# Cahier de Recettes - EcoRun

## 1. Scénarios de tests fonctionnels

### Scénario 1 : Inscription et première connexion
**Objectif** : Vérifier le processus d'inscription complet

**Prérequis** : Application installée, connexion internet

**Étapes** :
1. Lancer l'application
2. Sélectionner "Créer un compte"
3. Saisir email valide : `test@example.com`
4. Saisir mot de passe : `motdepasse123`
5. Confirmer le mot de passe
6. Appuyer sur "Créer le compte"

**Résultats attendus** :
- ✅ Compte créé avec succès
- ✅ Profil utilisateur créé automatiquement
- ✅ Redirection vers l'écran d'accueil
- ✅ Email affiché dans le profil

**Résultats obtenus** : ✅ Conforme

---

### Scénario 2 : Démarrage d'une activité GPS
**Objectif** : Vérifier le tracking GPS en temps réel

**Prérequis** : Utilisateur connecté, permissions GPS accordées

**Étapes** :
1. Aller dans l'onglet "Activité"
2. Sélectionner "Course à pied"
3. Appuyer sur "Démarrer"
4. Attendre acquisition GPS (< 10 secondes)
5. Se déplacer pendant 2 minutes
6. Observer les métriques en temps réel

**Résultats attendus** :
- ✅ Acquisition GPS rapide
- ✅ Distance calculée correctement
- ✅ Temps affiché en temps réel
- ✅ CO2 économisé calculé
- ✅ Espérance de vie mise à jour

**Résultats obtenus** : ✅ Conforme

---

### Scénario 3 : Sauvegarde d'une activité
**Objectif** : Vérifier la persistance des données

**Prérequis** : Activité en cours depuis 5 minutes

**Étapes** :
1. Appuyer sur "Terminer"
2. Confirmer la fin d'activité
3. Vérifier le message de succès
4. Aller dans l'onglet "Historique"
5. Vérifier la présence de l'activité

**Résultats attendus** :
- ✅ Activité sauvegardée en base
- ✅ Données GPS préservées
- ✅ Calculs écologiques corrects
- ✅ Affichage dans l'historique
- ✅ Synchronisation Supabase

**Résultats obtenus** : ✅ Conforme

---

### Scénario 4 : Visualisation des détails d'activité
**Objectif** : Vérifier l'affichage des cartes et statistiques

**Prérequis** : Au moins une activité sauvegardée

**Étapes** :
1. Aller dans "Historique"
2. Cliquer sur une activité
3. Observer la carte du trajet
4. Tester les 3 thèmes de carte
5. Vérifier les statistiques affichées

**Résultats attendus** :
- ✅ Carte affichée correctement
- ✅ Trajet GPS visible
- ✅ Marqueurs début/fin présents
- ✅ 3 thèmes fonctionnels
- ✅ Statistiques cohérentes

**Résultats obtenus** : ✅ Conforme

---

### Scénario 5 : Calculs écologiques
**Objectif** : Vérifier la précision des calculs

**Prérequis** : Activité de 5km en 30 minutes

**Étapes** :
1. Terminer l'activité
2. Noter les valeurs calculées
3. Vérifier manuellement :
   - CO2 économisé = 5km × 0.12kg/km = 0.6kg
   - Vie gagnée = 0.5h × 7 = 3.5h

**Résultats attendus** :
- ✅ CO2 économisé : ~0.6kg
- ✅ Vie gagnée : ~3.5h
- ✅ Distance : 5.0km ±0.1
- ✅ Durée : 30min ±10s

**Résultats obtenus** : ✅ Conforme

---

### Scénario 6 : Gestion des erreurs réseau
**Objectif** : Vérifier la robustesse en cas de problème

**Prérequis** : Activité en cours, connexion internet

**Étapes** :
1. Désactiver le WiFi/4G pendant l'activité
2. Continuer l'activité 2 minutes
3. Réactiver la connexion
4. Terminer l'activité
5. Vérifier la sauvegarde

**Résultats attendus** :
- ✅ Tracking continue hors ligne
- ✅ Données GPS préservées
- ✅ Synchronisation à la reconnexion
- ✅ Aucune perte de données
- ✅ Message d'erreur informatif

**Résultats obtenus** : ✅ Conforme

## 2. Tests de sécurité

### Scénario 7 : Isolation des données utilisateur
**Objectif** : Vérifier que chaque utilisateur ne voit que ses données

**Prérequis** : 2 comptes utilisateur différents

**Étapes** :
1. Se connecter avec utilisateur A
2. Créer une activité
3. Se déconnecter
4. Se connecter avec utilisateur B
5. Vérifier l'historique

**Résultats attendus** :
- ✅ Utilisateur B ne voit pas les activités de A
- ✅ Profils séparés
- ✅ Statistiques indépendantes
- ✅ RLS Supabase fonctionnel

**Résultats obtenus** : ✅ Conforme

## 3. Tests d'accessibilité

### Scénario 8 : Navigation au lecteur d'écran
**Objectif** : Vérifier l'accessibilité de base

**Prérequis** : VoiceOver/TalkBack activé

**Étapes** :
1. Naviguer dans l'application
2. Tester tous les boutons principaux
3. Vérifier les labels des éléments
4. Tester la navigation par gestes

**Résultats attendus** :
- ✅ Tous les éléments sont annoncés
- ✅ Navigation logique
- ✅ Boutons identifiés correctement
- ✅ Contenu accessible

**Résultats obtenus** : ⚠️ Partiellement conforme (infrastructure prête)

## 4. Tests de performance

### Scénario 9 : Performance GPS
**Objectif** : Vérifier les performances du tracking

**Prérequis** : Device avec GPS, activité longue (30min)

**Étapes** :
1. Démarrer une activité
2. Mesurer le temps d'acquisition GPS
3. Observer la consommation mémoire
4. Vérifier la fluidité de l'interface
5. Mesurer l'impact batterie

**Résultats attendus** :
- ✅ Acquisition GPS < 10 secondes
- ✅ Mémoire < 150MB
- ✅ Interface fluide (60fps)
- ✅ Consommation batterie raisonnable

**Résultats obtenus** : ✅ Conforme

## 5. Tests de régression

### Scénario 10 : Mise à jour de profil
**Objectif** : Vérifier que les modifications persistent

**Prérequis** : Utilisateur connecté

**Étapes** :
1. Aller dans le profil
2. Modifier le pseudo
3. Sauvegarder
4. Fermer et rouvrir l'app
5. Vérifier la persistance

**Résultats attendus** :
- ✅ Pseudo modifié sauvegardé
- ✅ Persistance après redémarrage
- ✅ Synchronisation Supabase
- ✅ Affichage cohérent

**Résultats obtenus** : ✅ Conforme

## 6. Résultats de validation

### Fonctionnalités principales
- ✅ **Authentification** : 100% fonctionnel
- ✅ **Tracking GPS** : 100% fonctionnel
- ✅ **Calculs écologiques** : 100% fonctionnel
- ✅ **Sauvegarde données** : 100% fonctionnel
- ✅ **Cartes interactives** : 100% fonctionnel
- ✅ **Historique** : 100% fonctionnel

### Sécurité et robustesse
- ✅ **RLS Supabase** : 100% fonctionnel
- ✅ **Gestion erreurs** : 100% fonctionnel
- ✅ **Validation données** : 100% fonctionnel
- ✅ **Isolation utilisateurs** : 100% fonctionnel

### Performance
- ✅ **Temps de réponse** : Conformes aux attentes
- ✅ **Consommation mémoire** : Dans les limites
- ✅ **Fluidité interface** : 60fps maintenu
- ✅ **Optimisations GPS** : Efficaces

### Points d'amélioration identifiés
- ⚠️ **Accessibilité** : Infrastructure prête, activation future
- ⚠️ **Mode sombre** : Interface préparée, thème global à activer
- ⚠️ **Tracking background** : Code prêt, nécessite build standalone

## 7. Validation finale

**Statut global** : ✅ **VALIDÉ**

L'application répond à tous les critères fonctionnels définis et présente une architecture robuste permettant les évolutions futures planifiées.