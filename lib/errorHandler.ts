/**
 * Gestionnaire d'erreurs centralisé pour EcoRun
 * Capture, log et gère toutes les erreurs de l'application
 */

import { Alert } from 'react-native';
import { logger } from './logger';

export enum ErrorType {
  NETWORK = 'NETWORK',
  GPS = 'GPS',
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: any;
  timestamp: string;
  userId?: string;
}

class ErrorHandler {
  private errors: AppError[] = [];
  private maxErrors = 100;

  /**
   * Gérer une erreur avec logging et notification utilisateur
   */
  handleError(
    type: ErrorType,
    message: string,
    originalError?: Error,
    context?: any,
    showAlert: boolean = true
  ): void {
    const appError: AppError = {
      type,
      message,
      originalError,
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString(),
    };

    // Ajouter à la collection
    this.errors.push(appError);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Logger l'erreur
    logger.error('ERROR_HANDLER', message, {
      type,
      originalError: originalError?.message,
      context: appError.context,
    });

    // Afficher à l'utilisateur si demandé
    if (showAlert) {
      this.showUserError(type, message);
    }
  }

  /**
   * Gérer les erreurs réseau
   */
  handleNetworkError(error: Error, context?: any): void {
    const message = this.isOffline() 
      ? 'Pas de connexion internet. Vérifiez votre réseau.'
      : 'Erreur de connexion. Réessayez dans quelques instants.';

    this.handleError(ErrorType.NETWORK, message, error, context);
  }

  /**
   * Gérer les erreurs GPS
   */
  handleGPSError(error: Error, context?: any): void {
    let message = 'Erreur GPS. ';
    
    if (error.message.includes('permission')) {
      message += 'Autorisez l\'accès à la géolocalisation.';
    } else if (error.message.includes('unavailable')) {
      message += 'GPS indisponible. Sortez à l\'extérieur.';
    } else {
      message += 'Impossible d\'obtenir votre position.';
    }

    this.handleError(ErrorType.GPS, message, error, context);
  }

  /**
   * Gérer les erreurs d'authentification
   */
  handleAuthError(error: Error, context?: any): void {
    let message = '';
    
    if (error.message.includes('Invalid email format')) {
      message = 'Format d\'email invalide. Veuillez saisir un email valide.';
    } else if (error.message.includes('Password too short')) {
      message = 'Mot de passe trop court. Minimum 6 caractères requis.';
    } else if (error.message.includes('Email already exists')) {
      message = 'Cet email est déjà utilisé. Essayez de vous connecter.';
    } else if (error.message.includes('Invalid credentials')) {
      message = 'Email ou mot de passe incorrect. Vérifiez vos identifiants.';
    } else if (error.message.includes('Network error')) {
      message = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
    } else if (error.message.includes('network')) {
      message = 'Problème de connexion. Réessayez dans quelques instants.';
    } else {
      message = 'Erreur d\'authentification. Impossible de vous connecter.';
    }

    this.handleError(ErrorType.AUTH, message, error, context);
  }

  /**
   * Gérer les erreurs de base de données
   */
  handleDatabaseError(error: Error, operation: string, context?: any): void {
    let message = `Erreur lors de ${operation}. `;
    
    if (error.message.includes('network')) {
      message += 'Vérifiez votre connexion.';
    } else if (error.message.includes('permission')) {
      message += 'Accès non autorisé.';
    } else {
      message += 'Réessayez plus tard.';
    }

    this.handleError(ErrorType.DATABASE, message, error, { operation, ...context });
  }

  /**
   * Gérer les erreurs de validation
   */
  handleValidationError(field: string, value: any, rule: string): void {
    const message = `${field} invalide : ${rule}`;
    
    this.handleError(
      ErrorType.VALIDATION, 
      message, 
      undefined, 
      { field, value: this.sanitizeValue(value), rule },
      false // Pas d'alerte pour les validations
    );
  }

  /**
   * Wrapper pour les fonctions async avec gestion d'erreur
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorType: ErrorType,
    context?: any
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(
        errorType,
        `Erreur lors de l'opération ${errorType}`,
        error as Error,
        context
      );
      return null;
    }
  }

  /**
   * Afficher l'erreur à l'utilisateur
   */
  private showUserError(type: ErrorType, message: string): void {
    const title = this.getErrorTitle(type);
    
    Alert.alert(title, message, [
      { text: 'OK', style: 'default' }
    ]);
  }

  /**
   * Obtenir le titre selon le type d'erreur
   */
  private getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Problème de connexion';
      case ErrorType.GPS:
        return 'Erreur GPS';
      case ErrorType.AUTH:
        return 'Erreur d\'authentification';
      case ErrorType.DATABASE:
        return 'Erreur de données';
      case ErrorType.VALIDATION:
        return 'Données invalides';
      default:
        return 'Erreur';
    }
  }

  /**
   * Vérifier si hors ligne
   */
  private isOffline(): boolean {
    // En React Native, on pourrait utiliser NetInfo
    // Pour l'instant, on retourne false
    return false;
  }

  /**
   * Sanitiser le contexte pour éviter les données sensibles
   */
  private sanitizeContext(context: any): any {
    if (!context) return context;
    
    const sanitized = { ...context };
    const sensitiveFields = ['password', 'token', 'key', 'secret'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Sanitiser une valeur
   */
  private sanitizeValue(value: any): any {
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return value;
  }

  /**
   * Obtenir les erreurs récentes
   */
  getRecentErrors(count: number = 20): AppError[] {
    return this.errors.slice(-count);
  }

  /**
   * Obtenir les erreurs par type
   */
  getErrorsByType(type: ErrorType): AppError[] {
    return this.errors.filter(error => error.type === type);
  }

  /**
   * Statistiques d'erreurs
   */
  getErrorStats(): { [key in ErrorType]: number } {
    const stats = {
      [ErrorType.NETWORK]: 0,
      [ErrorType.GPS]: 0,
      [ErrorType.AUTH]: 0,
      [ErrorType.DATABASE]: 0,
      [ErrorType.VALIDATION]: 0,
      [ErrorType.UNKNOWN]: 0,
    };

    this.errors.forEach(error => {
      stats[error.type]++;
    });

    return stats;
  }

  /**
   * Nettoyer les erreurs anciennes
   */
  clearOldErrors(): void {
    this.errors = [];
  }

  /**
   * Exporter les erreurs pour debug
   */
  exportErrors(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      errorsCount: this.errors.length,
      errors: this.errors,
      stats: this.getErrorStats(),
    }, null, 2);
  }
}

// Instance singleton
export const errorHandler = new ErrorHandler();

// Helpers pour usage facile
export const handleNetworkError = (error: Error, context?: any) => 
  errorHandler.handleNetworkError(error, context);

export const handleGPSError = (error: Error, context?: any) => 
  errorHandler.handleGPSError(error, context);

export const handleAuthError = (error: Error, context?: any) => 
  errorHandler.handleAuthError(error, context);

export const handleDatabaseError = (error: Error, operation: string, context?: any) => 
  errorHandler.handleDatabaseError(error, operation, context);

export const handleValidationError = (field: string, value: any, rule: string) => 
  errorHandler.handleValidationError(field, value, rule);

export const withErrorHandling = <T>(
  operation: () => Promise<T>,
  errorType: ErrorType,
  context?: any
) => errorHandler.withErrorHandling(operation, errorType, context);