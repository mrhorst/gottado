import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AppCard from '@/components/ui/AppCard'
import AppButton from '@/components/ui/AppButton'
import EmptyState from '@/components/ui/EmptyState'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useTeamsQuery } from '@/hooks/useTeamsQuery'
import { colors, spacing, typography } from '@/styles/theme'

const TeamsScreen = () => {
  const { teams, isLoading, isError, error } = useTeamsQuery()
  const router = useRouter()

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  if (isError) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <Text style={s.errorText}>Error: {error?.message}</Text>
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.title}>Teams</Text>
          <Text style={s.subtitle}>
            Manage ownership across areas without changing access control.
          </Text>
          <View style={s.heroAction}>
            <AppButton
              label='New Team'
              onPress={() => router.push('/(tabs)/areas/teams/new')}
              accessibilityLabel='Create team'
              icon={<Ionicons name='add-circle' size={18} color='#fff' />}
              style={s.createButton}
            />
          </View>
        </View>

        {teams.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No teams yet'
              description='Create teams first, then assign them to areas.'
              icon='people-outline'
            />
          </AppCard>
        ) : (
          teams.map((team) => (
            <Pressable
              key={team.id}
              onPress={() => router.push(`/(tabs)/areas/teams/${team.id}`)}
            >
              <AppCard style={s.teamCard}>
                <View style={s.teamHeader}>
                  <View style={s.teamCopy}>
                    <Text style={s.teamName}>{team.name}</Text>
                    {!!team.description && (
                      <Text style={s.teamDescription}>{team.description}</Text>
                    )}
                  </View>
                  <Ionicons name='chevron-forward' size={18} color='#c7c7cc' />
                </View>
                <View style={s.metaPill}>
                  <Text style={s.metaValue}>{team.memberCount}</Text>
                  <Text style={s.metaLabel}>members</Text>
                </View>
              </AppCard>
            </Pressable>
          ))
        )}
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
    maxWidth: 360,
  },
  heroAction: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
  createButton: {
    minWidth: 132,
  },
  teamCard: {
    gap: spacing.sm,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  teamCopy: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    ...typography.h4,
    color: colors.text,
  },
  teamDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  metaPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
  },
})

export default TeamsScreen
