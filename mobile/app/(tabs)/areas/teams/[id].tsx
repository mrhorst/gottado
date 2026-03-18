import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import AppCard from '@/components/ui/AppCard'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { getTeam } from '@/services/teamService'
import { colors, spacing, typography } from '@/styles/theme'

const TeamDetailScreen = () => {
  const { id } = useLocalSearchParams()
  const teamId = Number(id)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => getTeam(teamId),
    enabled: Number.isFinite(teamId) && teamId > 0,
  })

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  if (isError || !data) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <Text style={s.errorText}>
            Error: {error instanceof Error ? error.message : 'Unable to load team.'}
          </Text>
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.title}>{data.team.name}</Text>
          {!!data.team.description && (
            <Text style={s.subtitle}>{data.team.description}</Text>
          )}
        </View>

        <AppCard style={s.summaryCard}>
          <Text style={s.summaryValue}>{data.members.length}</Text>
          <Text style={s.summaryLabel}>Members</Text>
        </AppCard>

        <View style={s.group}>
          <Text style={s.groupTitle}>Members</Text>
          {data.members.map((member) => (
            <AppCard key={member.userId} style={s.memberCard}>
              <View style={s.memberRow}>
                <View style={s.memberCopy}>
                  <Text style={s.memberName}>{member.name}</Text>
                  <Text style={s.memberEmail}>{member.email}</Text>
                </View>
                <View style={s.rolePill}>
                  <Text style={s.roleText}>{member.role}</Text>
                </View>
              </View>
            </AppCard>
          ))}
        </View>
      </ScrollView>
    </ScreenMotion>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  hero: {
    gap: 4,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  summaryCard: {
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 4,
  },
  memberCard: {
    gap: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  memberCopy: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    ...typography.h4,
    color: colors.text,
  },
  memberEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rolePill: {
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
  },
})

export default TeamDetailScreen
