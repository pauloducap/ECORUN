import { StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles/spacing';
import { typography } from '@/styles/typography';

export const activityCardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
  },
  stats: {
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    paddingTop: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
  },
  ecoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
  },
  ecoStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  ecoStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  ecoStatValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});