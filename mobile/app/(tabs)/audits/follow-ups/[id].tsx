import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuditRunDetailQuery } from '@/hooks/useAuditRunsQuery'
import { useAuditFollowUpsQuery } from '@/hooks/useAuditFollowUpsQuery'
import { colors, spacing, typography } from '@/styles/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  heading: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    ...typography.body2,
    color: '#8e8e93',
  },
  infoValue: {
    ...typography.body2,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
    marginBottom: spacing.md,
  },
  scoreSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: spacing.md,
  },
  scoreButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  scoreButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scoreButtonText: {
    fontWeight: '600',
    color: colors.text,
  },
  scoreButtonTextActive: {
    color: '#fff',
  },
  followUpItem: {
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.button,
    color: '#fff',
  },
  scheduleButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: spacing.sm,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  zoneName: {
    ...typography.body2,
    flex: 1,
  },
  zoneScore: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
})

const SCORE_STEPS = [0, 20, 40, 60, 80, 100]

const getScoreColor = (score: number | null) => {
  if (score === null) return '#8e8e93'
  if (score >= 80) return '#34C759'
  if (score >= 50) return '#FF9500'
  return colors.iOSred
}

export default function FollowUpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { run, isLoading: runLoading } = useAuditRunDetailQuery(Number(id))
  const {
    followUps,
    isLoading: fuLoading,
    scheduleFollowUp,
    completeFollowUp,
    isScheduling,
  } = useAuditFollowUpsQuery(Number(id))
  const router = useRouter()

  const [notes, setNotes] = useState('')
  const [reScore, setReScore] = useState<number | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')

  // Calculate zone-level scores from findings
  const zoneScores = useMemo(() => {
    if (!run?.findings) return null
    const zones: Record<string, { earned: number; possible: number }> = {}

    for (const f of run.findings) {
      if (!zones[f.zone]) zones[f.zone] = { earned: 0, possible: 0 }

      if (f.scoringType === 'pass_fail') {
        zones[f.zone].possible += 1
        if (f.passed) zones[f.zone].earned += 1
      } else {
        zones[f.zone].possible += 5
        zones[f.zone].earned += f.score ?? 0
      }
    }

    const result: Record<string, number> = {}
    for (const [zone, { earned, possible }] of Object.entries(zones)) {
      result[zone] = possible > 0 ? Math.round((earned / possible) * 100) : 0
    }
    return result
  }, [run?.findings])

  if (runLoading || fuLoading || !run) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  const actionsCompleted = run.actions.filter(
    (a) => a.status === 'promoted'
  ).length
  const actionsTotal = run.actions.length

  const handleSchedule = () => {
    if (!scheduleDate.trim()) return
    scheduleFollowUp(scheduleDate)
    setScheduleDate('')
  }

  const handleComplete = (followUpId: number) => {
    completeFollowUp({
      id: followUpId,
      notes: notes || undefined,
      score: reScore ?? undefined,
    })
    setNotes('')
    setReScore(null)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Follow-Up Review</Text>

      {/* Original audit summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Original Audit</Text>
        <Text
          style={[
            styles.scoreText,
            { color: getScoreColor(run.overallScore) },
          ]}
        >
          {run.overallScore ?? '--'}%
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Actions</Text>
          <Text style={styles.infoValue}>
            {actionsCompleted}/{actionsTotal} promoted
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>
            {run.completedAt
              ? new Date(run.completedAt).toLocaleDateString()
              : '--'}
          </Text>
        </View>
      </View>

      {/* Zone Score Breakdown */}
      {zoneScores && Object.keys(zoneScores).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Zone Scores</Text>
          {Object.entries(zoneScores).map(([zone, score]) => (
            <View key={zone} style={styles.zoneRow}>
              <Text style={styles.zoneName}>{zone}</Text>
              <Text
                style={[styles.zoneScore, { color: getScoreColor(score) }]}
              >
                {score}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Existing follow-ups */}
      {followUps.length > 0 && (
        <>
          <Text style={styles.label}>Scheduled Follow-Ups</Text>
          {followUps.map((fu) => (
            <View key={fu.id} style={styles.followUpItem}>
              <View>
                <Text style={{ fontWeight: '600' }}>
                  {new Date(fu.scheduledDate).toLocaleDateString()}
                </Text>
                <Text style={{ ...typography.caption, textTransform: 'capitalize' }}>
                  {fu.status}
                </Text>
              </View>
              {fu.status === 'scheduled' && (
                <Pressable
                  style={{
                    backgroundColor: '#34C759',
                    borderRadius: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                  onPress={() => handleComplete(fu.id)}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                    Complete
                  </Text>
                </Pressable>
              )}
              {fu.score !== null && (
                <Text
                  style={{
                    fontWeight: '700',
                    color: getScoreColor(fu.score),
                    fontSize: 16,
                  }}
                >
                  {fu.score}%
                </Text>
              )}
            </View>
          ))}
        </>
      )}

      {/* Re-score */}
      <Text style={styles.label}>Re-Assessment Score (optional)</Text>
      <View style={styles.scoreSlider}>
        {SCORE_STEPS.map((s) => (
          <Pressable
            key={s}
            style={[
              styles.scoreButton,
              reScore === s && styles.scoreButtonActive,
            ]}
            onPress={() => setReScore(reScore === s ? null : s)}
          >
            <Text
              style={[
                styles.scoreButtonText,
                reScore === s && styles.scoreButtonTextActive,
              ]}
            >
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notes */}
      <Text style={styles.label}>Review Notes</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        placeholder='How is the action plan progressing?'
        multiline
      />

      {/* Schedule new follow-up */}
      <Text style={styles.label}>Schedule New Follow-Up</Text>
      <TextInput
        style={styles.dateInput}
        value={scheduleDate}
        onChangeText={setScheduleDate}
        placeholder='YYYY-MM-DD'
      />
      <Pressable
        style={[styles.scheduleButton, !scheduleDate.trim() && { opacity: 0.5 }]}
        onPress={handleSchedule}
        disabled={!scheduleDate.trim() || isScheduling}
      >
        <Text style={styles.buttonText}>
          {isScheduling ? 'Scheduling...' : 'Schedule Follow-Up'}
        </Text>
      </Pressable>

      <View style={{ height: spacing.xl * 2 }} />
    </ScrollView>
  )
}
