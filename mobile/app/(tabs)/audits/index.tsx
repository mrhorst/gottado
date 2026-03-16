import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuditDashboardQuery } from '@/hooks/useAuditDashboardQuery'
import { colors, spacing, typography } from '@/styles/theme'
import ScreenMotion from '@/components/ui/ScreenMotion'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  scoreLabel: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  buttonText: {
    ...typography.button,
    color: '#fff',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  outlineButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  recentName: {
    ...typography.body1,
    flex: 1,
  },
  recentScore: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Zone scores
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  zoneName: {
    ...typography.body2,
    flex: 1,
  },
  zoneScore: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  zoneTrend: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 55,
    textAlign: 'right',
  },
})

const PRESTO_ZONE_ORDER = [
  'People',
  'Routines',
  'Execution',
  'Standards',
  'Team Leadership',
  'Operations & Upkeep',
]

const sortZoneEntries = (entries: [string, number][]) =>
  entries.sort(([a], [b]) => {
    const ai = PRESTO_ZONE_ORDER.indexOf(a)
    const bi = PRESTO_ZONE_ORDER.indexOf(b)
    return (ai >= 0 ? ai : 999) - (bi >= 0 ? bi : 999)
  })

const getScoreColor = (score: number | null) => {
  if (score === null) return '#8e8e93'
  if (score >= 80) return '#34C759'
  if (score >= 50) return '#FF9500'
  return colors.iOSred
}

export default function AuditsHome() {
  const { dashboard, isLoading } = useAuditDashboardQuery()
  const router = useRouter()

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  const zoneScores = dashboard?.zoneScores
  const previousZoneScores = dashboard?.previousZoneScores

  return (
    <ScreenMotion>
      <ScrollView style={styles.container}>

      {/* Average Score Card */}
      <View style={styles.card}>
        <Text style={styles.scoreText}>
          {dashboard?.averageScore ?? '--'}
        </Text>
        <Text style={styles.scoreLabel}>Average Score</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {dashboard?.pendingActionsCount ?? 0}
            </Text>
            <Text style={styles.statLabel}>Pending Actions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {dashboard?.upcomingFollowUps.length ?? 0}
            </Text>
            <Text style={styles.statLabel}>Upcoming Follow-ups</Text>
          </View>
        </View>
      </View>

      {/* Zone Score Breakdown */}
      {zoneScores && Object.keys(zoneScores).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Zone Breakdown</Text>
          {sortZoneEntries(Object.entries(zoneScores)).map(([zone, score]) => {
            const prevScore = previousZoneScores?.[zone]
            const diff = prevScore != null ? score - prevScore : null

            return (
              <View key={zone} style={styles.zoneRow}>
                <Text style={styles.zoneName}>{zone}</Text>
                <Text
                  style={[styles.zoneScore, { color: getScoreColor(score) }]}
                >
                  {score}%
                </Text>
                {diff !== null && (
                  <Text
                    style={[
                      styles.zoneTrend,
                      {
                        color:
                          diff > 0
                            ? '#34C759'
                            : diff < 0
                              ? colors.iOSred
                              : '#8e8e93',
                      },
                    ]}
                  >
                    {diff > 0 ? `+${diff}` : diff === 0 ? '=' : `${diff}`}
                  </Text>
                )}
              </View>
            )
          })}
        </View>
      )}

      {/* Quick Actions */}
      <Pressable
        style={[styles.button, { backgroundColor: '#34C759' }]}
        onPress={() => router.push('/(tabs)/audits/quick')}
      >
        <Text style={styles.buttonText}>⚡ Quick Audit (5 min)</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: '#5856D6' }]}
        onPress={() => router.push('/(tabs)/audits/reports')}
      >
        <Text style={styles.buttonText}>📊 Partner Report</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/(tabs)/audits/templates')}
      >
        <Text style={styles.buttonText}>Start Full Audit</Text>
      </Pressable>

      <Pressable
        style={styles.outlineButton}
        onPress={() => router.push('/(tabs)/audits/runs')}
      >
        <Text style={styles.outlineButtonText}>View History</Text>
      </Pressable>

      <Pressable
        style={styles.outlineButton}
        onPress={() => router.push('/(tabs)/audits/templates')}
      >
        <Text style={styles.outlineButtonText}>Manage Templates</Text>
      </Pressable>

      {/* Recent Audits */}
      {dashboard?.recentRuns && dashboard.recentRuns.length > 0 && (
        <View style={[styles.card, { marginTop: spacing.md }]}>
          <Text style={styles.cardTitle}>Recent Audits</Text>
          {dashboard.recentRuns.map((run) => (
            <Pressable
              key={run.id}
              style={styles.recentItem}
              onPress={() => router.push(`/(tabs)/audits/runs/${run.id}`)}
            >
              <Text style={styles.recentName}>{run.templateName}</Text>
              <Text
                style={[
                  styles.recentScore,
                  { color: getScoreColor(run.overallScore) },
                ]}
              >
                {run.overallScore ?? '--'}%
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      </ScrollView>
    </ScreenMotion>
  )
}
