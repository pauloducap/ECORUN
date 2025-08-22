import { supabase } from './supabase';
import { profileService } from './supabase';
import { handleAuthError, handleDatabaseError } from './errorHandler';
import { logger } from './logger';

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Service d'authentification centralisé
 * Gère l'inscription, connexion, déconnexion avec Supabase
 */
export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe (minimum 6 caractères)
   * @returns Utilisateur créé ou null en cas d'erreur
   */
  async signUp(email: string, password: string): Promise<AuthUser | null> {
    try {
      logger.info('AUTH', `Tentative d'inscription pour: ${email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        handleAuthError(error, { operation: 'signUp', email });
        
        return null;
      }

      logger.info('AUTH', `Inscription réussie pour: ${data.user?.id}`);

      if (data.user) {
        // Créer le profil manuellement
        try {
          logger.info('PROFILE', 'Création du profil utilisateur');
          await profileService.upsertProfile({
            id: data.user.id,
            name: email.split('@')[0], // Utiliser la partie avant @ comme nom
            email: email,
          });
          logger.info('PROFILE', 'Profil créé avec succès');
        } catch (profileError) {
          handleDatabaseError(profileError as Error, 'création profil', { userId: data.user.id });
          // Si c'est juste un conflit (profil existe déjà), continuer
          if ((profileError as any).code !== '23505') {
            return null;
          }
        }

        return {
          id: data.user.id,
          email: data.user.email || email,
        };
      }

      return null;
    } catch (error) {
      handleAuthError(error as Error, { operation: 'signUp', email });
      return null;
    }
  },

  /**
   * Connexion d'un utilisateur existant
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns Utilisateur connecté ou null en cas d'erreur
   */
  async signIn(email: string, password: string): Promise<AuthUser | null> {
    try {
      logger.info('AUTH', `Tentative de connexion pour: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        handleAuthError(error, { operation: 'signIn', email });
        return null;
      }

      logger.info('AUTH', `Connexion réussie pour: ${data.user?.id}`);

      if (data.user) {
        // Vérifier/créer le profil si nécessaire
        try {
          logger.info('PROFILE', 'Vérification du profil utilisateur');
          const existingProfile = await profileService.getProfile(data.user.id);
          if (!existingProfile) {
            logger.warn('PROFILE', 'Profil manquant, création automatique');
            await profileService.upsertProfile({
              id: data.user.id,
              name: data.user.email?.split('@')[0] || 'Utilisateur',
              email: data.user.email || '',
            });
            logger.info('PROFILE', 'Profil créé lors de la connexion');
          } else {
            logger.info('PROFILE', 'Profil existant trouvé');
          }
        } catch (profileError) {
          handleDatabaseError(profileError as Error, 'vérification profil', { userId: data.user.id });
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email || email,
        };
      }

      return null;
    } catch (error) {
      handleAuthError(error as Error, { operation: 'signIn', email });
      return null;
    }
  },

  /**
   * Déconnexion de l'utilisateur actuel
   */
  async signOut(): Promise<void> {
    try {
      logger.info('AUTH', 'Déconnexion utilisateur');
      const { error } = await supabase.auth.signOut();
      if (error) {
        handleAuthError(error, { operation: 'signOut' });
      }
    } catch (error) {
      handleAuthError(error as Error, { operation: 'signOut' });
    }
  },

  /**
   * Récupérer l'utilisateur actuellement connecté
   * @returns Utilisateur actuel ou null
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return {
          id: user.id,
          email: user.email || '',
        };
      }

      return null;
    } catch (error) {
      handleAuthError(error as Error, { operation: 'getCurrentUser' });
      return null;
    }
  },

  /**
   * Écouter les changements d'état d'authentification
   * @param callback - Fonction appelée lors des changements
   * @returns Fonction de désabonnement
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      logger.info('AUTH', `Changement d'état: ${event}`);
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
        });
      } else {
        callback(null);
      }
    });
  },
};