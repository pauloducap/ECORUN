import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock React Native Alert
vi.mock('react-native', () => ({
  Alert: {
    alert: vi.fn(),
  },
}));

// Mock du profileService
const mockProfileService = {
  upsertProfile: vi.fn(),
  getProfile: vi.fn(),
};

// Mock de Supabase
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  profileService: mockProfileService,
}));

describe('Authentication Service', () => {
  let authService: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Import dynamique pour éviter les problèmes de hoisting
    const authModule = await import('../auth');
    authService = authModule.authService;
  });

  describe('signUp', () => {
    it('should create user account successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.signUp('test@example.com', 'password123');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com'
      });
    });

    it('should validate email format', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid email format' }
      });

      const result = await authService.signUp('invalid-email', 'password123');
      
      expect(result).toBeNull();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'invalid-email',
        password: 'password123'
      });
    });

    it('should validate password length', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Password too short' }
      });

      const result = await authService.signUp('test@example.com', '123');
      
      expect(result).toBeNull();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123'
      });
    });

    it('should handle Supabase errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already exists' }
      });

      const result = await authService.signUp('test@example.com', 'password123');
      
      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com'
      });
    });

    it('should handle invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      });

      const result = await authService.signIn('test@example.com', 'wrongpassword');
      
      expect(result).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await authService.signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Network error' }
      });

      // Ne devrait pas lever d'exception
      await expect(authService.signOut()).resolves.toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser }
      });

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com'
      });
    });

    it('should return null when no user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null }
      });

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state listener', () => {
      const callback = vi.fn();
      const mockUnsubscribe = { data: { subscription: { unsubscribe: vi.fn() } } };
      
      mockSupabase.auth.onAuthStateChange.mockReturnValue(mockUnsubscribe);

      const result = authService.onAuthStateChange(callback);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(result).toBe(mockUnsubscribe);
    });

    it('should call callback with user data on auth change', () => {
      const callback = vi.fn();
      let authChangeHandler: Function;

      mockSupabase.auth.onAuthStateChange.mockImplementation((handler) => {
        authChangeHandler = handler;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      authService.onAuthStateChange(callback);

      // Simuler un changement d'auth avec utilisateur
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' }
      };
      authChangeHandler!('SIGNED_IN', mockSession);

      expect(callback).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com'
      });
    });

    it('should call callback with null when user signs out', () => {
      const callback = vi.fn();
      let authChangeHandler: Function;

      mockSupabase.auth.onAuthStateChange.mockImplementation((handler) => {
        authChangeHandler = handler;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      authService.onAuthStateChange(callback);

      // Simuler déconnexion
      authChangeHandler!('SIGNED_OUT', null);

      expect(callback).toHaveBeenCalledWith(null);
    });
  });
});