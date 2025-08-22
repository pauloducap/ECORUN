/**
 * Système de logging centralisé pour EcoRun
 * Gère les logs de développement et production de manière sécurisée
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
}

class Logger {
  private isDevelopment = __DEV__;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Limite pour éviter la surcharge mémoire

  /**
   * Log de debug (développement uniquement)
   */
  debug(category: string, message: string, data?: any): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, category, message, data);
    }
  }

  /**
   * Log d'information
   */
  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  /**
   * Log d'avertissement
   */
  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  /**
   * Log d'erreur
   */
  error(category: string, message: string, error?: Error | any): void {
    const errorData = error instanceof Error 
      ? { 
          name: error.name, 
          message: error.message, 
          stack: this.isDevelopment ? error.stack : undefined 
        }
      : error;
    
    this.log(LogLevel.ERROR, category, message, errorData);
  }

  /**
   * Log d'activité utilisateur (sans données sensibles)
   */
  userActivity(userId: string, action: string, data?: any): void {
    const sanitizedUserId = this.sanitizeUserId(userId);
    const sanitizedData = this.sanitizeData(data);
    
    this.log(LogLevel.INFO, 'USER_ACTIVITY', action, {
      userId: sanitizedUserId,
      ...sanitizedData
    });
  }

  /**
   * Log d'authentification
   */
  authEvent(event: 'login' | 'logout' | 'signup', email?: string, success?: boolean): void {
    const sanitizedEmail = email ? this.sanitizeEmail(email) : undefined;
    
    this.log(LogLevel.INFO, 'AUTH', `${event}_${success ? 'success' : 'failure'}`, {
      email: sanitizedEmail,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log d'erreur GPS
   */
  gpsError(error: string, position?: any): void {
    const sanitizedPosition = position ? {
      accuracy: position.accuracy,
      timestamp: position.timestamp,
      // Pas de coordonnées exactes pour la vie privée
    } : undefined;

    this.error('GPS', error, sanitizedPosition);
  }

  /**
   * Log d'erreur Supabase
   */
  supabaseError(operation: string, error: any): void {
    const sanitizedError = {
      code: error?.code,
      message: error?.message,
      hint: error?.hint,
      // Pas de détails sensibles
    };

    this.error('SUPABASE', `Operation failed: ${operation}`, sanitizedError);
  }

  /**
   * Méthode privée pour créer un log
   */
  private log(level: LogLevel, category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: this.sanitizeData(data),
    };

    // Ajouter à la collection interne
    this.logs.push(entry);
    
    // Limiter le nombre de logs en mémoire
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Afficher dans la console selon le niveau
    this.consoleLog(entry);
  }

  /**
   * Affichage console selon le niveau
   */
  private consoleLog(entry: LogEntry): void {
    const prefix = `[${entry.category}] ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.data);
        break;
      case LogLevel.INFO:
        console.log(prefix, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.data);
        break;
    }
  }

  /**
   * Sanitisation des données sensibles
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Supprimer les champs sensibles
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'latitude', 'longitude'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Sanitisation de l'ID utilisateur
   */
  private sanitizeUserId(userId: string): string {
    return userId.substring(0, 8) + '***';
  }

  /**
   * Sanitisation de l'email
   */
  private sanitizeEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.substring(0, 3)}***@${domain}`;
  }

  /**
   * Récupérer les logs récents
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Récupérer les logs par catégorie
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Récupérer les erreurs récentes
   */
  getRecentErrors(count: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.level === LogLevel.ERROR)
      .slice(-count);
  }

  /**
   * Exporter les logs (pour debug ou support)
   */
  exportLogs(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      logsCount: this.logs.length,
      logs: this.logs,
    }, null, 2);
  }

  /**
   * Nettoyer les logs anciens
   */
  clearOldLogs(): void {
    this.logs = [];
  }
}

// Instance singleton
export const logger = new Logger();

// Helpers pour usage facile
export const logDebug = (category: string, message: string, data?: any) => 
  logger.debug(category, message, data);

export const logInfo = (category: string, message: string, data?: any) => 
  logger.info(category, message, data);

export const logWarn = (category: string, message: string, data?: any) => 
  logger.warn(category, message, data);

export const logError = (category: string, message: string, error?: any) => 
  logger.error(category, message, error);

export const logUserActivity = (userId: string, action: string, data?: any) => 
  logger.userActivity(userId, action, data);

export const logAuthEvent = (event: 'login' | 'logout' | 'signup', email?: string, success?: boolean) => 
  logger.authEvent(event, email, success);