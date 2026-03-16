import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuditRunDetailQuery } from '@/hooks/useAuditRunsQuery'
import { colors, spacing, typography } from '@/styles/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreBig: {
    fontSize: 64,
    fontWeight: '700',
  },
  scoreLabel: {
    ...typography.caption,
    marginTop: 4,
  },
  dateText: {
    ...typography.body2,
    color: '#8e8e93',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  findingRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  findingLabel: {
    ...typography.body1,
    flex: 1,
  },
  findingScore: {
    fontWeight: '700',
    fontSize: 16,
  },
  flagBadge: {
    backgroundColor: colors.iOSred + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  flagBadgeText: {
    color: colors.iOSred,
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    ...typography.button,
    color: '#fff',
  },
  outlineButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  outlineButtonText: {
    ...typography.button,
    color: colors.primary,
  },
})

const getScoreColor = (score: number | null) => {
  if (score === null) return '#8e8e93'
  if (score >= 80) return '#34C759'
  if (score >= 50) return '#FF9500'
  return colors.iOSred
}

export default function RunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { run, isLoading } = useAuditRunDetailQuery(Number(id))
  const router = useRouter()

  if (isLoading || !run) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  // Group findings by zone
  const zoneMap: Record<string, typeof run.findings> = {}
  for (const f of run.findings) {
    if (!zoneMap[f.zone]) zoneMap[f.zone] = []
    zoneMap[f.zone].push(f)
  }

  const flaggedFindings = run.findings.filter((f) => f.flagged)

  return (
    <ScrollView style={styles.container}>
      {/* Score card */}
      <View style={styles.scoreCard}>
        <Text
          style={[
            styles.scoreBig,
            { color: getScoreColor(run.overallScore) },
          ]}
        >
          {run.overallScore ?? '--'}%
        </Text>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <Text style={styles.dateText}>
          {run.completedAt
            ? `Completed ${new Date(run.completedAt).toLocaleDateString()}`
            : `Started ${new Date(run.startedAt).toLocaleDateString()}`}
        </Text>
      </View>

      {/* Flagged findings */}
      {flaggedFindings.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Flagged Items ({flaggedFindings.length})
          </Text>
          {flaggedFindings.map((f) => (
            <View key={f.id} style={styles.findingRow}>
              <Text style={styles.findingLabel}>{f.label}</Text>
              {f.severity && (
                <View style={styles.flagBadge}>
                  <Text style={styles.flagBadgeText}>{f.severity}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}

      {/* Findings by zone */}
      {Object.entries(zoneMap).map(([zone, findings]) => (
        <View key={zone}>
          <Text style={styles.sectionTitle}>{zone}</Text>
          {findings.map((f) => (
            <View key={f.id} style={styles.findingRow}>
              <Text style={styles.findingLabel}>{f.label}</Text>
              <Text
                style={[
                  styles.findingScore,
                  {
                    color:
                      f.scoringType === 'pass_fail'
                        ? f.passed
                          ? '#34C759'
                          : colors.iOSred
                        : getScoreColor(
                            f.score !== null ? (f.score / 5) * 100 : null
                          ),
                  },
                ]}
              >
                {f.scoringType === 'pass_fail'
                  ? f.passed
                    ? 'Pass'
                    : 'Fail'
                  : `${f.score ?? '-'}/5`}
              </Text>
              {f.flagged && (
                <View style={styles.flagBadge}>
                  <Text style={styles.flagBadgeText}>!</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ))}

      {/* Action buttons */}
      {run.status === 'completed' && (
        <>
          <Pressable
            style={styles.button}
            onPress={() =>
              router.push(`/(tabs)/audits/actions/${id}`)
            }
          >
            <Text style={styles.buttonText}>Create Action Plan</Text>
          </Pressable>
          <Pressable
            style={styles.outlineButton}
            onPress={() => {
              // Will navigate to follow-up scheduling
              // For now this is handled in the follow-ups screen
            }}
          >
            <Text style={styles.outlineButtonText}>Schedule Follow-Up</Text>
          </Pressable>
        </>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  )
}
