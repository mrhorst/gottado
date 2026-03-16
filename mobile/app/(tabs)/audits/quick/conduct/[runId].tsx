import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuditRunDetailQuery } from '@/hooks/useAuditRunsQuery'
import { useAuditRunsMutation } from '@/hooks/useAuditRunsMutation'
import { useAuditFindingsMutation } from '@/hooks/useAuditFindingsMutation'
import { colors, spacing, typography } from '@/styles/theme'
import type { AuditFinding } from '@/types/audit'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
  },
  progressText: {
    ...typography.caption,
    color: '#8e8e93',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e5ea',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrollContent: {
    padding: spacing.md,
  },
  findingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  findingCardPassed: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  findingCardFailed: {
    borderLeftWidth: 4,
    borderLeftColor: colors.iOSred,
  },
  checkpointLabel: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  checkpointDesc: {
    ...typography.body2,
    color: '#8e8e93',
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  passButton: {
    flex: 1,
    backgroundColor: '#34C75920',
    borderWidth: 2,
    borderColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  passButtonActive: {
    backgroundColor: '#34C759',
  },
  failButton: {
    flex: 1,
    backgroundColor: `${colors.iOSred}20`,
    borderWidth: 2,
    borderColor: colors.iOSred,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  failButtonActive: {
    backgroundColor: colors.iOSred,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
  },
  buttonTextActive: {
    color: '#fff',
  },
  failButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.iOSred,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    margin: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: '#c7c7cc',
  },
  completeButtonText: {
    ...typography.button,
    color: '#fff',
    fontSize: 18,
  },
  zoneHeader: {
    ...typography.h3,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

// Finding card with big pass/fail buttons
const QuickFindingCard = ({
  finding,
  passed,
  onPass,
  onFail,
}: {
  finding: AuditFinding
  passed: boolean | null
  onPass: () => void
  onFail: () => void
}) => {
  return (
    <View
      style={[
        styles.findingCard,
        passed === true && styles.findingCardPassed,
        passed === false && styles.findingCardFailed,
      ]}
    >
      <Text style={styles.checkpointLabel}>{finding.label}</Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.passButton, passed === true && styles.passButtonActive]}
          onPress={onPass}
        >
          <Text
            style={[
              styles.buttonText,
              passed === true && styles.buttonTextActive,
            ]}
          >
            ✓ PASS
          </Text>
        </Pressable>

        <Pressable
          style={[styles.failButton, passed === false && styles.failButtonActive]}
          onPress={onFail}
        >
          <Text
            style={[
              styles.failButtonText,
              passed === false && styles.buttonTextActive,
            ]}
          >
            ✗ FAIL
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function QuickAuditConduct() {
  const { runId } = useLocalSearchParams<{ runId: string }>()
  const numericRunId = parseInt(runId, 10)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { run, isLoading } = useAuditRunDetailQuery(numericRunId)
  const { completeRun } = useAuditRunsMutation()
  const { assessFinding } = useAuditFindingsMutation()

  // Local state for pass/fail
  const [localFindings, setLocalFindings] = useState<
    Record<number, { passed: boolean | null }>
  >({})

  // Sync with run data on load
  useEffect(() => {
    if (run?.findings) {
      const initial: Record<number, { passed: boolean | null }> = {}
      run.findings.forEach((f) => {
        initial[f.id] = {
          passed: f.passed,
        }
      })
      setLocalFindings(initial)
    }
  }, [run])

  const findingsByZone = useMemo(() => {
    if (!run?.findings) return []
    const grouped = new Map<string, AuditFinding[]>()
    run.findings.forEach((f) => {
      const zone = f.zone || 'General'
      if (!grouped.has(zone)) grouped.set(zone, [])
      grouped.get(zone)!.push(f)
    })
    return Array.from(grouped.entries())
  }, [run?.findings])

  const assessedCount = useMemo(() => {
    return Object.values(localFindings).filter((f) => f.passed !== null).length
  }, [localFindings])

  const totalCount = run?.findings?.length || 0
  const progress = totalCount > 0 ? assessedCount / totalCount : 0
  const allAssessed = assessedCount === totalCount && totalCount > 0

  const updateFinding = useCallback(
    async (findingId: number, passed: boolean) => {
      setLocalFindings((prev) => ({
        ...prev,
        [findingId]: { passed },
      }))

      try {
        await assessFinding({
          runId: numericRunId,
          findingId,
          passed,
          severity: passed ? undefined : 'medium',
        })
      } catch {
        // Error handled by mutation
      }
    },
    [assessFinding, numericRunId]
  )

  const handleComplete = async () => {
    if (!allAssessed) {
      Alert.alert(
        'Not Complete',
        `${totalCount - assessedCount} items not assessed. Finish them or mark remaining as passed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark All Passed',
            onPress: async () => {
              // Auto-pass remaining
              const remaining = run?.findings?.filter(
                (f) => localFindings[f.id]?.passed === null
              )
              for (const f of remaining || []) {
                await updateFinding(f.id, true)
              }
              finishAudit()
            },
          },
          {
            text: 'Continue Audit',
            style: 'default',
          },
        ]
      )
      return
    }

    finishAudit()
  }

  const finishAudit = async () => {
    try {
      await completeRun(numericRunId)
      router.replace(`/(tabs)/audits/runs/${numericRunId}`)
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading || !run) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {run.templateName}
        </Text>
        <Text style={styles.progressText}>
          {assessedCount}/{totalCount}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Findings */}
      <ScrollView style={styles.scrollContent}>
        {findingsByZone.map(([zone, findings]) => (
          <View key={zone}>
            <Text style={styles.zoneHeader}>{zone}</Text>
            {findings.map((finding) => (
              <QuickFindingCard
                key={finding.id}
                finding={finding}
                passed={localFindings[finding.id]?.passed ?? null}
                onPass={() => updateFinding(finding.id, true)}
                onFail={() => updateFinding(finding.id, false)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Complete button */}
      <Pressable
        style={[
          styles.completeButton,
          !allAssessed && styles.completeButtonDisabled,
        ]}
        onPress={handleComplete}
      >
        <Text style={styles.completeButtonText}>
          {allAssessed ? 'Complete Audit ✓' : `${totalCount - assessedCount} remaining`}
        </Text>
      </Pressable>
    </View>
  )
}
