import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuditRunDetailQuery } from '@/hooks/useAuditRunsQuery'
import { useAuditRunsMutation } from '@/hooks/useAuditRunsMutation'
import { useAuditFindingsMutation } from '@/hooks/useAuditFindingsMutation'
import { addAdHocFinding } from '@/services/auditService'
import { colors, spacing, typography } from '@/styles/theme'
import type { AuditFinding, Severity } from '@/types/audit'
import { useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

const SCORE_OPTIONS = [0, 1, 2, 3, 4, 5]
const SEVERITY_OPTIONS: Severity[] = ['low', 'medium', 'high', 'critical']

// PRESTO canonical order
const PRESTO_ZONE_ORDER = [
  'People',
  'Routines',
  'Execution',
  'Standards',
  'Team Leadership',
  'Operations & Upkeep',
]

const getZoneSortKey = (zoneName: string) => {
  const idx = PRESTO_ZONE_ORDER.indexOf(zoneName)
  return idx >= 0 ? idx : 999
}

const confirm = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm()
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: onConfirm },
    ])
  }
}

export default function ConductAuditScreen() {
  const { runId } = useLocalSearchParams<{ runId: string }>()
  const numericRunId = Number(runId)
  const { run, isLoading } = useAuditRunDetailQuery(numericRunId)
  const { completeRun, isCompleting } = useAuditRunsMutation()
  const { batchAssessAsync, isBatchAssessing } =
    useAuditFindingsMutation(numericRunId)
  const queryClient = useQueryClient()
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null)
  const insets = useSafeAreaInsets()

  const [currentZoneName, setCurrentZoneName] = useState<string | null>(null)
  const [localFindings, setLocalFindings] = useState<
    Record<number, Partial<AuditFinding>>
  >({})
  const [isSaving, setIsSaving] = useState(false)

  // Ad-hoc issue form state (O&U zone)
  const [showAddIssue, setShowAddIssue] = useState(false)
  const [issueLabel, setIssueLabel] = useState('')
  const [issueDesc, setIssueDesc] = useState('')
  const [issueSeverity, setIssueSeverity] = useState<Severity>('medium')
  const [issueNotes, setIssueNotes] = useState('')
  const [isAddingIssue, setIsAddingIssue] = useState(false)

  // Sort zones in PRESTO order
  const zones = useMemo(() => {
    if (!run?.findings) return []
    const zoneMap: Record<string, AuditFinding[]> = {}
    for (const f of run.findings) {
      if (!zoneMap[f.zone]) zoneMap[f.zone] = []
      zoneMap[f.zone].push(f)
    }
    const entries = Object.entries(zoneMap)

    // Add O&U zone if missing on PRESTO templates
    const hasOU = entries.some(([name]) => name === 'Operations & Upkeep')
    if (!hasOU) {
      const prestoZones = ['People', 'Routines', 'Execution', 'Standards', 'Team Leadership']
      if (entries.some(([name]) => prestoZones.includes(name))) {
        entries.push(['Operations & Upkeep', []])
      }
    }

    // Sort in PRESTO order, non-PRESTO zones go to the end alphabetically
    entries.sort(([a], [b]) => getZoneSortKey(a) - getZoneSortKey(b))

    return entries.map(([name, findings]) => ({ name, findings }))
  }, [run?.findings])

  // Initialize zone on first load
  useEffect(() => {
    if (zones.length > 0 && currentZoneName === null) {
      setCurrentZoneName(zones[0].name)
    }
  }, [zones, currentZoneName])

  // Merge server findings into local state (preserve existing edits)
  useEffect(() => {
    if (run?.findings) {
      setLocalFindings((prev) => {
        const merged = { ...prev }
        for (const f of run.findings) {
          if (!merged[f.id]) {
            merged[f.id] = {
              score: f.score,
              passed: f.passed,
              severity: f.severity,
              notes: f.notes,
              flagged: f.flagged,
            }
          }
        }
        return merged
      })
    }
  }, [run?.findings])

  // Scroll to top on zone change
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }, [currentZoneName])

  const currentZoneIndex = useMemo(() => {
    if (!currentZoneName) return 0
    const idx = zones.findIndex((z) => z.name === currentZoneName)
    return idx >= 0 ? idx : 0
  }, [zones, currentZoneName])

  if (isLoading || !run) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  const currentZone = zones[currentZoneIndex]
  if (!currentZone) return null

  const isOUZone = currentZone.name === 'Operations & Upkeep'
  const isLastZone = currentZoneIndex === zones.length - 1
  const busy = isCompleting || isBatchAssessing || isSaving

  const updateLocal = (findingId: number, updates: Partial<AuditFinding>) => {
    setLocalFindings((prev) => ({
      ...prev,
      [findingId]: { ...prev[findingId], ...updates },
    }))
  }

  const collectAllFindings = () => {
    const all: Array<{
      id: number
      score?: number
      passed?: boolean
      severity?: string
      notes?: string
      flagged?: boolean
    }> = []
    for (const zone of zones) {
      for (const f of zone.findings) {
        const local = localFindings[f.id]
        if (local) {
          all.push({
            id: f.id,
            score: local.score ?? undefined,
            passed: local.passed ?? undefined,
            severity: local.severity ?? undefined,
            notes: local.notes ?? undefined,
            flagged: local.flagged ?? undefined,
          })
        }
      }
    }
    return all
  }

  const handleNext = () => {
    if (currentZoneIndex < zones.length - 1) {
      setCurrentZoneName(zones[currentZoneIndex + 1].name)
    }
  }

  const handlePrev = () => {
    if (currentZoneIndex > 0) {
      setCurrentZoneName(zones[currentZoneIndex - 1].name)
    }
  }

  const handleComplete = () => {
    confirm(
      'Complete Audit',
      'Finalize this audit and calculate scores?',
      async () => {
        setIsSaving(true)
        try {
          const allFindings = collectAllFindings()
          if (allFindings.length > 0) {
            await batchAssessAsync(allFindings)
          }
          completeRun(
            { runId: numericRunId },
            {
              onSuccess: () =>
                router.replace(`/(tabs)/audits/runs/${runId}`),
              onError: () => {
                setIsSaving(false)
                if (Platform.OS === 'web') {
                  window.alert('Failed to complete audit. Please try again.')
                } else {
                  Alert.alert('Error', 'Failed to complete audit.')
                }
              },
            }
          )
        } catch {
          setIsSaving(false)
          if (Platform.OS === 'web') {
            window.alert('Failed to save findings. Please try again.')
          } else {
            Alert.alert('Error', 'Failed to save findings. Please try again.')
          }
        }
      }
    )
  }

  const handleAddIssue = async () => {
    if (!issueLabel.trim()) return
    setIsAddingIssue(true)
    try {
      await addAdHocFinding(numericRunId, {
        label: issueLabel.trim(),
        description: issueDesc || undefined,
        severity: issueSeverity,
        notes: issueNotes || undefined,
      })
      setIssueLabel('')
      setIssueDesc('')
      setIssueSeverity('medium')
      setIssueNotes('')
      await queryClient.invalidateQueries({
        queryKey: ['auditRun', numericRunId],
      })
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Failed to add issue.')
      } else {
        Alert.alert('Error', 'Failed to add issue. Please try again.')
      }
    } finally {
      setIsAddingIssue(false)
    }
  }

  // Count how many findings have been assessed in the current zone
  const assessedCount = currentZone.findings.filter((f) => {
    const local = localFindings[f.id]
    if (!local) return false
    if (f.scoringType === 'pass_fail') return local.passed !== null && local.passed !== undefined
    return local.score !== null && local.score !== undefined
  }).length

  return (
    <View style={s.container}>
      {/* Progress bar */}
      <View style={s.progressBar}>
        {zones.map((z, i) => (
          <Pressable
            key={z.name}
            style={[
              s.progressSegment,
              i < currentZoneIndex && s.progressSegmentDone,
              i === currentZoneIndex && s.progressSegmentActive,
            ]}
            onPress={() => setCurrentZoneName(z.name)}
          />
        ))}
      </View>

      {/* Zone header */}
      <View style={s.zoneHeader}>
        <View style={s.zoneLetterBadge}>
          <Text style={s.zoneLetterText}>
            {currentZone.name.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.zoneTitle}>{currentZone.name}</Text>
          <Text style={s.zoneSubtitle}>
            {assessedCount}/{currentZone.findings.length} assessed
            {' \u2022 '}Zone {currentZoneIndex + 1} of {zones.length}
          </Text>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={s.content}>
        {/* O&U zone: Add Issue */}
        {isOUZone && (
          <>
            {showAddIssue ? (
              <View style={s.addIssueForm}>
                <View style={s.addIssueFormHeader}>
                  <Ionicons name='construct-outline' size={20} color='#FF9500' />
                  <Text style={s.addIssueFormTitle}>
                    Log Maintenance/Repair Issue
                  </Text>
                </View>
                <TextInput
                  style={s.input}
                  value={issueLabel}
                  onChangeText={setIssueLabel}
                  placeholder='Issue title (e.g., Broken door hinge)'
                  placeholderTextColor='#c7c7cc'
                />
                <TextInput
                  style={s.input}
                  value={issueDesc}
                  onChangeText={setIssueDesc}
                  placeholder='Description (optional)'
                  placeholderTextColor='#c7c7cc'
                />
                <Text style={s.inputLabel}>Severity</Text>
                <View style={s.severityRow}>
                  {SEVERITY_OPTIONS.map((sev) => (
                    <Pressable
                      key={sev}
                      style={[
                        s.severityButton,
                        issueSeverity === sev && s.severityButtonActive,
                      ]}
                      onPress={() => setIssueSeverity(sev)}
                    >
                      <Text
                        style={[
                          s.severityText,
                          issueSeverity === sev && { color: colors.primary },
                        ]}
                      >
                        {sev}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={s.input}
                  value={issueNotes}
                  onChangeText={setIssueNotes}
                  placeholder='Notes (optional)'
                  placeholderTextColor='#c7c7cc'
                />
                <View style={s.addIssueActions}>
                  <Pressable
                    style={[
                      s.addIssueSubmitBtn,
                      (!issueLabel.trim() || isAddingIssue) && { opacity: 0.5 },
                    ]}
                    onPress={handleAddIssue}
                    disabled={!issueLabel.trim() || isAddingIssue}
                  >
                    <Ionicons name='add-circle' size={18} color='#fff' />
                    <Text style={s.addIssueSubmitText}>
                      {isAddingIssue ? 'Adding...' : 'Add Issue'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={s.addIssueDoneBtn}
                    onPress={() => setShowAddIssue(false)}
                  >
                    <Text style={s.addIssueDoneText}>Done</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={s.addIssueButton}
                onPress={() => setShowAddIssue(true)}
              >
                <Ionicons name='add-circle-outline' size={22} color='#fff' />
                <Text style={s.addIssueButtonText}>Add Issue</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Findings list */}
        {currentZone.findings.map((finding) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            local={localFindings[finding.id] || {}}
            onUpdate={(updates) => updateLocal(finding.id, updates)}
          />
        ))}

        {isOUZone && currentZone.findings.length === 0 && !showAddIssue && (
          <View style={s.emptyZone}>
            <Ionicons name='construct-outline' size={40} color='#d1d1d6' />
            <Text style={s.emptyZoneText}>No issues logged yet</Text>
            <Text style={s.emptyZoneSubtext}>
              Tap "Add Issue" to log maintenance or repair items
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[s.navBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {currentZoneIndex > 0 && (
          <Pressable
            style={[s.navButton, s.prevButton]}
            onPress={handlePrev}
          >
            <Ionicons name='chevron-back' size={18} color={colors.text} />
            <Text style={[s.navButtonText, { color: colors.text }]}>
              Previous
            </Text>
          </Pressable>
        )}
        {isLastZone ? (
          <Pressable
            style={[s.navButton, s.completeButton, busy && { opacity: 0.6 }]}
            onPress={handleComplete}
            disabled={busy}
          >
            <Ionicons name='checkmark-circle' size={20} color='#fff' />
            <Text style={[s.navButtonText, { color: '#fff' }]}>
              {busy ? 'Saving...' : 'Complete Audit'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[s.navButton, s.nextButton]}
            onPress={handleNext}
          >
            <Text style={[s.navButtonText, { color: '#fff' }]}>
              Next Zone
            </Text>
            <Ionicons name='chevron-forward' size={18} color='#fff' />
          </Pressable>
        )}
      </View>
    </View>
  )
}

// Individual finding card component
const FindingCard = ({
  finding,
  local,
  onUpdate,
}: {
  finding: AuditFinding
  local: Partial<AuditFinding>
  onUpdate: (updates: Partial<AuditFinding>) => void
}) => {
  const isFailed =
    finding.scoringType === 'pass_fail'
      ? local.passed === false
      : (local.score ?? -1) <= 2

  const isAssessed =
    finding.scoringType === 'pass_fail'
      ? local.passed !== null && local.passed !== undefined
      : local.score !== null && local.score !== undefined

  return (
    <View
      style={[
        s.findingCard,
        isAssessed && (isFailed ? s.findingCardFailed : s.findingCardPassed),
      ]}
    >
      <Text style={s.findingLabel}>{finding.label}</Text>

      {finding.scoringType === 'score' ? (
        <View style={s.scoreRow}>
          {SCORE_OPTIONS.map((val) => (
            <Pressable
              key={val}
              style={[
                s.scoreButton,
                local.score === val && s.scoreButtonActive,
              ]}
              onPress={() => onUpdate({ score: val })}
            >
              <Text
                style={[
                  s.scoreButtonText,
                  local.score === val && s.scoreButtonTextActive,
                ]}
              >
                {val}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={s.passFail}>
          <Pressable
            style={[
              s.passButton,
              local.passed === true && s.passButtonActive,
            ]}
            onPress={() => onUpdate({ passed: true })}
          >
            <Ionicons
              name='checkmark'
              size={18}
              color={local.passed === true ? '#fff' : '#34C759'}
            />
            <Text
              style={[
                s.pfText,
                { color: local.passed === true ? '#fff' : '#34C759' },
              ]}
            >
              Pass
            </Text>
          </Pressable>
          <Pressable
            style={[
              s.failButton,
              local.passed === false && s.failButtonActive,
            ]}
            onPress={() => onUpdate({ passed: false })}
          >
            <Ionicons
              name='close'
              size={18}
              color={local.passed === false ? '#fff' : colors.iOSred}
            />
            <Text
              style={[
                s.pfText,
                { color: local.passed === false ? '#fff' : colors.iOSred },
              ]}
            >
              Fail
            </Text>
          </Pressable>
        </View>
      )}

      {/* Show severity + notes + flag only when assessed and failed */}
      {isAssessed && isFailed && (
        <View style={s.detailSection}>
          <Text style={s.inputLabel}>Severity</Text>
          <View style={s.severityRow}>
            {SEVERITY_OPTIONS.map((sev) => {
              const isActive = local.severity === sev
              return (
                <Pressable
                  key={sev}
                  style={[
                    s.severityButton,
                    isActive && getSeverityStyle(sev),
                  ]}
                  onPress={() => onUpdate({ severity: sev })}
                >
                  <Text
                    style={[
                      s.severityText,
                      isActive && { color: getSeverityColor(sev) },
                    ]}
                  >
                    {sev}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <TextInput
            style={s.notesInput}
            placeholder='Notes about this issue...'
            placeholderTextColor='#c7c7cc'
            value={local.notes || ''}
            onChangeText={(text) => onUpdate({ notes: text })}
            multiline
          />

          <Pressable
            style={[s.flagButton, local.flagged && s.flagButtonActive]}
            onPress={() => onUpdate({ flagged: !local.flagged })}
          >
            <Ionicons
              name={local.flagged ? 'flag' : 'flag-outline'}
              size={16}
              color={local.flagged ? '#fff' : colors.iOSred}
            />
            <Text
              style={[s.flagText, local.flagged && s.flagTextActive]}
            >
              {local.flagged ? 'Flagged for Action' : 'Flag for Action'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Show notes for passed items too, but compact */}
      {isAssessed && !isFailed && (
        <TextInput
          style={[s.notesInput, { minHeight: 36, marginTop: spacing.sm }]}
          placeholder='Notes (optional)...'
          placeholderTextColor='#c7c7cc'
          value={local.notes || ''}
          onChangeText={(text) => onUpdate({ notes: text })}
          multiline
        />
      )}
    </View>
  )
}

const getSeverityColor = (sev: Severity) => {
  switch (sev) {
    case 'low': return '#34C759'
    case 'medium': return '#FF9500'
    case 'high': return colors.iOSred
    case 'critical': return '#AF52DE'
  }
}

const getSeverityStyle = (sev: Severity) => ({
  borderColor: getSeverityColor(sev),
  backgroundColor: getSeverityColor(sev) + '15',
})

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#fff',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e5ea',
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
  },
  progressSegmentDone: {
    backgroundColor: '#34C759',
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  zoneLetterBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneLetterText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  zoneTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  zoneSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  findingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  findingCardPassed: {
    borderLeftColor: '#34C759',
  },
  findingCardFailed: {
    borderLeftColor: colors.iOSred,
  },
  findingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  scoreButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scoreButtonTextActive: {
    color: '#fff',
  },
  passFail: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  passButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#34C759',
    backgroundColor: '#fafafa',
  },
  passButtonActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  failButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.iOSred,
    backgroundColor: '#fafafa',
  },
  failButtonActive: {
    backgroundColor: colors.iOSred,
    borderColor: colors.iOSred,
  },
  pfText: {
    fontWeight: '700',
    fontSize: 15,
  },
  detailSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.sm,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  severityButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#8e8e93',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 10,
    padding: spacing.sm,
    fontSize: 16,
    marginBottom: spacing.sm,
    backgroundColor: '#fafafa',
    minHeight: 56,
    textAlignVertical: 'top',
    color: colors.text,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.iOSred,
    alignSelf: 'flex-start',
  },
  flagButtonActive: {
    backgroundColor: colors.iOSred,
    borderColor: colors.iOSred,
  },
  flagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.iOSred,
  },
  flagTextActive: {
    color: '#fff',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  prevButton: {
    backgroundColor: '#f2f2f7',
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  navButtonText: {
    ...typography.button,
  },
  addIssueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: spacing.md,
  },
  addIssueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addIssueForm: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  addIssueFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  addIssueFormTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 10,
    padding: spacing.sm,
    fontSize: 16,
    marginBottom: spacing.sm,
    backgroundColor: '#fafafa',
    color: colors.text,
  },
  addIssueActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addIssueSubmitBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 12,
  },
  addIssueSubmitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  addIssueDoneBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIssueDoneText: {
    color: '#8e8e93',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyZone: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyZoneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#c7c7cc',
  },
  emptyZoneSubtext: {
    fontSize: 14,
    color: '#c7c7cc',
  },
})
