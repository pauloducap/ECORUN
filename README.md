# EcoRun

## Description

EcoRun est une application mobile de tracking sportif qui calcule l'impact écologique de vos activités. Elle permet de suivre vos courses à pied et sorties vélo tout en mesurant les économies de CO2 réalisées et le gain d'espérance de vie.

Projet réalisé dans le cadre du M2 - Développement d'applications logicielles.

## Fonctionnalités principales

- **Authentification** : Inscription et connexion avec email/mot de passe
- **Tracking GPS** : Suivi en temps réel de vos activités (course et vélo)
- **Calculs écologiques** : 
  - CO2 économisé par rapport à un trajet en voiture
  - Espérance de vie gagnée grâce à l'activité physique
- **Historique** : Consultation de toutes vos activités passées
- **Visualisation** : Carte interactive de vos parcours
- **Profil** : Gestion de votre compte et statistiques globales

## Technologies utilisées

### Frontend
- React Native avec Expo SDK 53
- TypeScript
- Expo Router pour la navigation
- React Native WebView pour les cartes

### Backend
- Supabase (authentification et base de données)
- PostgreSQL
- Row Level Security (RLS) pour la sécurité des données

### Outils de développement
- VS Code
- Git
- ESLint et Prettier
- npm

## Installation

### Prérequis
- Node.js 18 ou supérieur
- npm
- Compte Supabase (gratuit)

### Étapes d'installation

1. Cloner le projet
```bash
git clone [url-du-repo]
cd project
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer Supabase
- Créer un projet sur [supabase.com](https://supabase.com)
- Récupérer l'URL et la clé anon du projet
- Les ajouter dans le fichier `.env` (voir `.env.example`)

4. Appliquer les migrations de base de données
- Dans Supabase, aller dans SQL Editor
- Exécuter les fichiers dans `supabase/migrations/` dans l'ordre

## Commandes disponibles

```bash

# Lancer l'application avec expo en clear
npx expo start --clear

# Lancer l'application en développement
npm run dev

# Lancer les tests
npm run test

# Vérifier le code (linting)
npm run lint

# Formater le code
npm run format

# Build pour le web
npm run build:web

# Nettoyer le cache
npm run clean
```
## Compatibilité et limitations

### Version Web
La version web est disponible uniquement pour tester rapidement l'interface, le CSS et la connexion Supabase.

**Limitations importantes** :
- La carte interactive ne fonctionne pas sur web
- L'enregistrement des activités n'est pas disponible  
- Le tracking GPS n'est pas supporté

**Note** : Si vous rencontrez un chargement infini sur la page de chargement, supprimez les cookies du site et rechargez la page.

### Versions mobiles
**L'expérience optimale est sur mobile (iOS et Android)** :
- Toutes les fonctionnalités sont disponibles
- Le tracking GPS et l'enregistrement fonctionnent parfaitement
- Utiliser Expo Go pour le développement

## Tests unitaires

Le projet contient une suite complète de tests unitaires (8 fichiers, 1200+ lignes de code) couvrant :
- Les calculs GPS et écologiques
- L'authentification
- Les composants UI
- Les services et hooks

**Note importante** : Les tests peuvent rencontrer des problèmes d'exécution selon votre version de Node.js en raison d'incompatibilités entre Vitest v1.6.0 et certaines versions de Node. Le code des tests est correct et complet. Pour une exécution optimale, utilisez Node.js v20.19.0 ou supérieur.
## Structure du projet

```
project/
├── app/                    # Écrans de l'application
│   ├── (tabs)/            # Écrans avec navigation par onglets
│   │   ├── home.tsx       # Accueil avec statistiques
│   │   ├── tracker.tsx    # Tracking GPS
│   │   ├── history.tsx    # Historique des activités
│   │   └── profile.tsx    # Profil utilisateur
│   └── auth.tsx           # Écran de connexion/inscription
├── components/            # Composants réutilisables
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Services et configurations
│   ├── supabase.ts       # Configuration Supabase
│   └── auth.ts           # Gestion de l'authentification
├── utils/                 # Fonctions utilitaires
│   ├── calculations.ts   # Calculs GPS et écologiques
│   └── formatters.ts     # Formatage des données
├── styles/               # Styles et thèmes
├── supabase/             # Migrations SQL
└── docs/                 # Documentation technique
```

## Documentation

La documentation complète du projet est disponible dans le dossier `/docs` :

- **ARCHITECTURE_LOGICIELLE.md** : Architecture technique de l'application
- **MANUEL_UTILISATION.md** : Guide d'utilisation pour les utilisateurs
- **MANUEL_DEPLOIEMENT.md** : Instructions de déploiement
- **TESTS_UNITAIRES.md** : Documentation des tests
- **MESURES_SECURITE.md** : Mesures de sécurité implémentées
- **ACCESSIBILITE.md** : Fonctionnalités d'accessibilité
- **CAHIER_RECETTES.md** : Scénarios de tests fonctionnels

Pour plus de détails sur chaque aspect du projet, consulter les documents correspondants.

## Notes de développement

L'application fonctionne avec Expo Go pour le développement. Certaines fonctionnalités comme le tracking en arrière-plan nécessitent un build standalone qui n'est pas encore réalisé.

Base de données : Les tables `profiles` et `activities` stockent les données utilisateur avec RLS activé pour garantir que chaque utilisateur n'accède qu'à ses propres données.

---

Projet développé par Paul-Antoine Abeille-Toussaint - M2 YNOV
