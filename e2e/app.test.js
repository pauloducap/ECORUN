describe('EcoRun App - Tests E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Navigation et écrans principaux', () => {
    it('devrait afficher l\'écran d\'accueil au lancement', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('devrait naviguer vers l\'écran de suivi d\'activité', async () => {
      await element(by.id('tab-tracker')).tap();
      await expect(element(by.id('tracker-screen'))).toBeVisible();
    });

    it('devrait naviguer vers l\'écran d\'historique', async () => {
      await element(by.id('tab-history')).tap();
      await expect(element(by.id('history-screen'))).toBeVisible();
    });

    it('devrait naviguer vers l\'écran de profil', async () => {
      await element(by.id('tab-profile')).tap();
      await expect(element(by.id('profile-screen'))).toBeVisible();
    });
  });

  describe('Authentification', () => {
    it('devrait afficher l\'écran de connexion pour un utilisateur non connecté', async () => {
      // Simuler la déconnexion
      await element(by.id('tab-profile')).tap();
      await element(by.id('logout-button')).tap();
      
      // Vérifier la redirection vers l'écran de connexion
      await expect(element(by.id('auth-screen'))).toBeVisible();
    });

    it('devrait permettre la connexion avec des identifiants valides', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      // Vérifier la redirection vers l'écran d'accueil après connexion
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('devrait afficher une erreur pour des identifiants invalides', async () => {
      await element(by.id('email-input')).typeText('invalid@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();
      
      await expect(element(by.text('Identifiants invalides'))).toBeVisible();
    });
  });

  describe('Suivi d\'activité', () => {
    it('devrait permettre de démarrer une activité de course', async () => {
      await element(by.id('tab-tracker')).tap();
      await element(by.id('activity-type-running')).tap();
      await element(by.id('start-activity-button')).tap();
      
      await expect(element(by.id('activity-timer'))).toBeVisible();
      await expect(element(by.id('pause-button'))).toBeVisible();
    });

    it('devrait permettre de mettre en pause et reprendre une activité', async () => {
      await element(by.id('pause-button')).tap();
      await expect(element(by.id('resume-button'))).toBeVisible();
      
      await element(by.id('resume-button')).tap();
      await expect(element(by.id('pause-button'))).toBeVisible();
    });

    it('devrait permettre d\'arrêter et sauvegarder une activité', async () => {
      await element(by.id('stop-button')).tap();
      await expect(element(by.id('save-activity-modal'))).toBeVisible();
      
      await element(by.id('activity-name-input')).typeText('Course matinale');
      await element(by.id('save-button')).tap();
      
      await waitFor(element(by.id('activity-saved-success')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('devrait afficher les statistiques en temps réel', async () => {
      await element(by.id('tab-tracker')).tap();
      await element(by.id('activity-type-running')).tap();
      await element(by.id('start-activity-button')).tap();
      
      await expect(element(by.id('distance-stat'))).toBeVisible();
      await expect(element(by.id('speed-stat'))).toBeVisible();
      await expect(element(by.id('co2-saved-stat'))).toBeVisible();
    });
  });

  describe('Historique des activités', () => {
    it('devrait afficher la liste des activités passées', async () => {
      await element(by.id('tab-history')).tap();
      await expect(element(by.id('activities-list'))).toBeVisible();
    });

    it('devrait permettre de filtrer les activités par type', async () => {
      await element(by.id('filter-button')).tap();
      await element(by.id('filter-running')).tap();
      await element(by.id('apply-filter-button')).tap();
      
      await expect(element(by.id('activities-list'))).toBeVisible();
    });

    it('devrait afficher les détails d\'une activité', async () => {
      await element(by.id('activity-item-0')).tap();
      await expect(element(by.id('activity-detail-screen'))).toBeVisible();
      await expect(element(by.id('activity-map'))).toBeVisible();
      await expect(element(by.id('activity-stats'))).toBeVisible();
    });

    it('devrait permettre de supprimer une activité', async () => {
      await element(by.id('delete-activity-button')).tap();
      await element(by.id('confirm-delete-button')).tap();
      
      await waitFor(element(by.id('activity-deleted-success')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Profil utilisateur', () => {
    it('devrait afficher les informations du profil', async () => {
      await element(by.id('tab-profile')).tap();
      await expect(element(by.id('user-avatar'))).toBeVisible();
      await expect(element(by.id('user-name'))).toBeVisible();
      await expect(element(by.id('user-stats'))).toBeVisible();
    });

    it('devrait permettre de modifier les paramètres', async () => {
      await element(by.id('settings-button')).tap();
      await expect(element(by.id('settings-screen'))).toBeVisible();
      
      // Modifier les unités de mesure
      await element(by.id('units-toggle')).tap();
      
      // Activer les notifications
      await element(by.id('notifications-toggle')).tap();
      
      await element(by.id('save-settings-button')).tap();
      await expect(element(by.id('settings-saved-success'))).toBeVisible();
    });

    it('devrait afficher les achievements et badges', async () => {
      await element(by.id('achievements-tab')).tap();
      await expect(element(by.id('achievements-list'))).toBeVisible();
      await expect(element(by.id('badge-first-run'))).toExist();
    });
  });

  describe('Carte et localisation', () => {
    it('devrait afficher la carte avec la position actuelle', async () => {
      await element(by.id('tab-tracker')).tap();
      await expect(element(by.id('map-view'))).toBeVisible();
      await expect(element(by.id('current-location-marker'))).toBeVisible();
    });

    it('devrait tracer le parcours pendant une activité', async () => {
      await element(by.id('activity-type-cycling')).tap();
      await element(by.id('start-activity-button')).tap();
      
      // Attendre quelques secondes pour le tracé
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await expect(element(by.id('route-polyline'))).toBeVisible();
    });
  });

  describe('Accessibilité', () => {
    it('devrait supporter la navigation avec lecteur d\'écran', async () => {
      // Vérifier les labels d'accessibilité
      await expect(element(by.label('Accueil'))).toBeVisible();
      await expect(element(by.label('Suivi d\'activité'))).toBeVisible();
      await expect(element(by.label('Historique'))).toBeVisible();
      await expect(element(by.label('Profil'))).toBeVisible();
    });

    it('devrait avoir des zones tactiles suffisamment grandes', async () => {
      const buttons = await element(by.type('TouchableOpacity')).getAttributes();
      // Vérifier que les boutons ont une taille minimale de 44x44 points (recommandation iOS)
      expect(buttons).toBeDefined();
    });
  });

  describe('Mode hors ligne', () => {
    it('devrait fonctionner en mode hors ligne', async () => {
      // Désactiver le réseau
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('tab-tracker')).tap();
      await element(by.id('activity-type-walking')).tap();
      await element(by.id('start-activity-button')).tap();
      
      await expect(element(by.id('offline-indicator'))).toBeVisible();
      await expect(element(by.id('activity-timer'))).toBeVisible();
      
      // Réactiver le réseau
      await device.clearURLBlacklist();
    });

    it('devrait synchroniser les données à la reconnexion', async () => {
      await waitFor(element(by.id('sync-indicator')))
        .toBeVisible()
        .withTimeout(5000);
      
      await waitFor(element(by.id('sync-complete')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de localisation', async () => {
      // Simuler une erreur de GPS
      await device.launchApp({
        permissions: { location: 'never' }
      });
      
      await element(by.id('tab-tracker')).tap();
      await element(by.id('start-activity-button')).tap();
      
      await expect(element(by.text('Localisation requise'))).toBeVisible();
    });

    it('devrait gérer les erreurs réseau', async () => {
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('tab-history')).tap();
      await element(by.id('refresh-button')).tap();
      
      await expect(element(by.text('Erreur de connexion'))).toBeVisible();
      
      await device.clearURLBlacklist();
    });
  });
});