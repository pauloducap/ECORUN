import { describe, it, expect, vi, beforeEach } from 'vitest';
import { activityService, profileService } from '../supabase';

// Import du client mocké globalement
import { supabase } from '../supabase';

describe('Supabase Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('activityService', () => {
    describe('getUserActivities', () => {
      it('should fetch user activities successfully', async () => {
        const mockActivities = [
          {
            id: '1',
            user_id: 'user-123',
            activity_type: 'running',
            duration: 1800,
            distance: 5.0,
            pace: 6.0,
            co2_saved: 0.6,
            life_gained: 3.5,
            positions: [],
            created_at: '2024-01-01T10:00:00Z'
          }
        ];

        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockActivities, error: null })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        const result = await activityService.getUserActivities('user-123');

        expect(supabase.from).toHaveBeenCalledWith('activities');
        expect(mockChain.select).toHaveBeenCalledWith('*');
        expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
        expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
        expect(result).toEqual(mockActivities);
      });

      it('should handle database errors', async () => {
        const mockError = new Error('Database connection failed');
        
        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: null, error: mockError })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        await expect(activityService.getUserActivities('user-123'))
          .rejects.toThrow('Database connection failed');
      });

      it('should return empty array when no activities', async () => {
        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: null, error: null })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        const result = await activityService.getUserActivities('user-123');

        expect(result).toEqual([]);
      });
    });

    describe('createActivity', () => {
      it('should create activity successfully', async () => {
        const newActivity = {
          user_id: 'user-123',
          activity_type: 'running' as const,
          duration: 1800,
          distance: 5.0,
          pace: 6.0,
          co2_saved: 0.6,
          life_gained: 3.5,
          positions: []
        };

        const createdActivity = {
          id: 'activity-123',
          ...newActivity,
          created_at: '2024-01-01T10:00:00Z'
        };

        const mockChain = {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: createdActivity, error: null })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        const result = await activityService.createActivity(newActivity);

        expect(supabase.from).toHaveBeenCalledWith('activities');
        expect(mockChain.insert).toHaveBeenCalledWith([{
          ...newActivity,
          positions: JSON.stringify([]) // Positions optimisées
        }]);
        expect(result.id).toBe('activity-123');
        expect(result.positions).toEqual([]); // Positions originales retournées
      });

      it('should handle creation errors', async () => {
        const newActivity = {
          user_id: 'user-123',
          activity_type: 'running' as const,
          duration: 1800,
          distance: 5.0,
          pace: 6.0,
          co2_saved: 0.6,
          life_gained: 3.5,
          positions: []
        };

        const mockError = new Error('Validation failed');
        
        const mockChain = {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: mockError })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        await expect(activityService.createActivity(newActivity))
          .rejects.toThrow('Validation failed');
      });
    });

    describe('deleteActivity', () => {
      it('should delete activity successfully', async () => {
        const mockChain = {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        await activityService.deleteActivity('activity-123');

        expect(supabase.from).toHaveBeenCalledWith('activities');
        expect(mockChain.delete).toHaveBeenCalled();
        expect(mockChain.eq).toHaveBeenCalledWith('id', 'activity-123');
      });

      it('should handle deletion errors', async () => {
        const mockError = new Error('Activity not found');
        
        const mockChain = {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: mockError })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        await expect(activityService.deleteActivity('activity-123'))
          .rejects.toThrow('Activity not found');
      });
    });
  });

  describe('profileService', () => {
    describe('getProfile', () => {
      it('should fetch user profile successfully', async () => {
        const mockProfile = {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          age: 30,
          weight: 70,
          height: 175,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        };

        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        const result = await profileService.getProfile('user-123');

        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(mockChain.select).toHaveBeenCalledWith('*');
        expect(mockChain.eq).toHaveBeenCalledWith('id', 'user-123');
        expect(result).toEqual(mockProfile);
      });

      it('should return null when profile not found', async () => {
        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { code: 'PGRST116' } // Not found error
          })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        const result = await profileService.getProfile('user-123');

        expect(result).toBeNull();
      });

      it('should throw on database errors', async () => {
        const mockError = new Error('Database error');
        
        const mockChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: mockError })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        await expect(profileService.getProfile('user-123'))
          .rejects.toThrow('Database error');
      });
    });

    describe('upsertProfile', () => {
      it('should create/update profile successfully', async () => {
        const profileData = {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        };

        const savedProfile = {
          ...profileData,
          age: null,
          weight: null,
          height: null,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        };

        const mockChain = {
          upsert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: savedProfile, error: null })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        const result = await profileService.upsertProfile(profileData);

        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(mockChain.upsert).toHaveBeenCalledWith([profileData]);
        expect(result).toEqual(savedProfile);
      });

      it('should handle upsert errors', async () => {
        const profileData = {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        };

        const mockError = new Error('Constraint violation');
        
        const mockChain = {
          upsert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: mockError })
        };

        vi.mocked(supabase.from).mockReturnValue(mockChain as any);

        await expect(profileService.upsertProfile({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        })).rejects.toThrow('Constraint violation');
      });
    });
  });
});