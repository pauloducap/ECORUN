import { describe, it, expect, vi, beforeEach } from 'vitest';
import { debugSupabase } from '../debug';
import { supabase } from '../supabase';

// Mock console.log pour capturer les logs
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Debug Supabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should test Supabase connection successfully', async () => {
    // Mock successful auth check
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } }
    });

    // Mock successful table access
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    };
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    await debugSupabase();

    expect(mockConsoleLog).toHaveBeenCalledWith('🔍 Diagnostic Supabase...');
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ Connexion Supabase OK');
    expect(mockConsoleLog).toHaveBeenCalledWith('👤 Utilisateur actuel:', 'test@example.com');
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ Table profiles accessible');
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ Table activities accessible');
  });

  it('should handle connection errors', async () => {
    // Mock auth error
    vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Connection failed'));

    await debugSupabase();

    expect(mockConsoleLog).toHaveBeenCalledWith('🔍 Diagnostic Supabase...');
    expect(mockConsoleLog).toHaveBeenCalledWith('💥 Erreur générale:', expect.any(Error));
  });

  it('should detect table access issues', async () => {
    // Mock successful auth
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } }
    });

    // Mock table error
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Table not found' } 
      })
    };
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    await debugSupabase();

    expect(mockConsoleLog).toHaveBeenCalledWith('❌ Table profiles:', 'Table not found');
    expect(mockConsoleLog).toHaveBeenCalledWith('❌ Table activities:', 'Table not found');
  });

  it('should test user signup functionality', async () => {
    // Mock successful auth and tables
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } }
    });

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    };
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    // Mock successful signup
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: 'new-user', email: 'test-123@example.com' } },
      error: null
    });

    await debugSupabase();

    expect(mockConsoleLog).toHaveBeenCalledWith('🧪 Test d\'inscription...');
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ Inscription test OK');
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '📧 Email de test:', 
      expect.stringMatching(/test-\d+@example\.com/)
    );
  });

  it('should handle signup errors', async () => {
    // Mock successful auth and tables
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } }
    });

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    };
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    // Mock signup error
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already exists' }
    });

    await debugSupabase();

    expect(mockConsoleLog).toHaveBeenCalledWith('❌ Erreur inscription:', 'Email already exists');
  });

  it('should handle no authenticated user', async () => {
    // Mock no user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null }
    });

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    };
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);

    await debugSupabase();

    expect(mockConsoleLog).toHaveBeenCalledWith('👤 Utilisateur actuel:', 'Aucun');
  });
});