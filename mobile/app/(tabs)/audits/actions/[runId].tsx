import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useAuditRunDetailQuery } from '@/hooks/useAuditRunsQuery'
import { useAuditActionsQuery } from '@/hooks/useAuditActionsQuery'
import { useAuditActionsMutation } from '@/hooks/useAuditActionsMutation'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { colors, spacing, typography } from '@/styles/theme'
import type { AuditFinding, Recurrence, Severity } from '@/types/audit'

const RECURRENCE_OPTIONS: Recurrence[] = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'semi_annual',
  'yearly',
]

const PRIORITY_OPTIONS: Severity[] = ['low', 'medium', 'high', 'critical']

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
  findingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  findingLabel: {
    ...typography.body1,
    fontWeight: '600',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.iOSred + '20',
  },
  severityText: {
    color: colors.iOSred,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    marginBottom: spacing.sm,
    backgroundColor: '#fafafa',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  optionLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
    color: colors.text,
  },
  optionTextActive: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionCard: {
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.body1,
    fontWeight: '600',
  },
  actionMeta: {
    ...typography.caption,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  promoteButton: {
    backgroundColor: '#34C759',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  promoteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  dismissButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#8e8e93',
  },
  dismissButtonText: {
    color: '#8e8e93',
    fontWeight: '600',
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  // SMART form styles
  smartForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  smartLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5856D6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  smartHint: {
    ...typography.caption,
    color: '#8e8e93',
    marginBottom: spacing.sm,
  },
  smartZoneTag: {
    backgroundColor: '#5856D620',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  smartZoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5856D6',
  },
  sectionOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 6,
  },
  sectionOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  smartSubmit: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
})

export default function ActionPlanScreen() {
  const { runId } = useLocalSearchParams<{ runId: string }>()
  const { run, isLoading: runLoading } = useAuditRunDetailQuery(Number(runId))
  const { actions, isLoading: actionsLoading } = useAuditActionsQuery(
    Number(runId)
  )
  const { createAction, promoteAction, dismissAction, isPromoting } =
    useAuditActionsMutation(Number(runId))
  const { sections } = useSectionQuery()

  const [expandedFinding, setExpandedFinding] = useState<number | null>(null)
  const [actionTitle, setActionTitle] = useState('')
  const [actionDesc, setActionDesc] = useState('')
  const [priority, setPriority] = useState<Severity>('medium')
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null)

  // SMART promotion form state
  const [promotingActionId, setPromotingActionId] = useState<number | null>(null)
  const [smartTitle, setSmartTitle] = useState('')
  const [smartDesc, setSmartDesc] = useState('')
  const [smartMeasurable, setSmartMeasurable] = useState('')
  const [smartSectionId, setSmartSectionId] = useState<number | null>(null)
  const [smartDueDate, setSmartDueDate] = useState('')

  if (runLoading || actionsLoading || !run) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  const flaggedFindings = run.findings.filter(
    (f) => f.flagged || (f.score !== null && f.score <= 2)
  )

  const handleCreateAction = (finding: AuditFinding) => {
    if (!actionTitle.trim()) return
    createAction({
      findingId: finding.id,
      title: actionTitle.trim(),
      description: actionDesc || undefined,
      priority,
      recurrence: recurrence || undefined,
    })
    setActionTitle('')
    setActionDesc('')
    setPriority('medium')
    setRecurrence(null)
    setExpandedFinding(null)
  }

  const openSmartForm = (actionId: number) => {
    if (!sections || sections.length === 0) {
      Alert.alert('No sections', 'Create a section first to promote actions.')
      return
    }
    const action = actions.find((a) => a.id === actionId)
    if (action) {
      setSmartTitle(action.title)
      setSmartDesc(action.description || '')
      setSmartMeasurable('')
      setSmartSectionId(null)
      setSmartDueDate('')
      setPromotingActionId(actionId)
    }
  }

  const handleSmartPromote = () => {
    if (!promotingActionId || !smartSectionId) return

    // Find the action's finding to get zone for relevanceTag
    const action = actions.find((a) => a.id === promotingActionId)
    const finding = action
      ? run.findings.find((f) => f.id === action.findingId)
      : null

    promoteAction({
      id: promotingActionId,
      sectionId: smartSectionId,
      title: smartTitle.trim() || undefined,
      description: smartDesc.trim() || undefined,
      dueDate: smartDueDate.trim() || undefined,
      measurableCriteria: smartMeasurable.trim() || undefined,
    })

    setPromotingActionId(null)
  }

  const existingActionFindingIds = new Set(actions.map((a) => a.findingId))

  // Find zone for a given action
  const getActionZone = (actionId: number): string => {
    const action = actions.find((a) => a.id === actionId)
    if (!action) return ''
    const finding = run.findings.find((f) => f.id === action.findingId)
    return finding?.zone || ''
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={flaggedFindings}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Action Plan</Text>

            {/* Existing actions */}
            {actions.length > 0 &&
              actions.map((action) => (
                <View key={action.id}>
                  <View style={styles.actionCard}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionMeta}>
                      Priority: {action.priority}
                      {action.recurrence
                        ? ` | Recurrence: ${action.recurrence.replace('_', ' ')}`
                        : ''}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            action.status === 'promoted'
                              ? '#34C75920'
                              : action.status === 'dismissed'
                                ? '#8e8e9320'
                                : colors.primary + '20',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          color:
                            action.status === 'promoted'
                              ? '#34C759'
                              : action.status === 'dismissed'
                                ? '#8e8e93'
                                : colors.primary,
                        }}
                      >
                        {action.status}
                      </Text>
                    </View>
                    {action.status === 'proposed' && (
                      <View style={styles.actionButtons}>
                        <Pressable
                          style={styles.promoteButton}
                          onPress={() => openSmartForm(action.id)}
                          disabled={isPromoting}
                        >
                          <Text style={styles.promoteButtonText}>
                            Promote to Task
                          </Text>
                        </Pressable>
                        <Pressable
                          style={styles.dismissButton}
                          onPress={() => dismissAction(action.id)}
                        >
                          <Text style={styles.dismissButtonText}>Dismiss</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* SMART promotion form */}
                  {promotingActionId === action.id && (
                    <View style={styles.smartForm}>
                      <Text style={{ ...typography.h3, marginBottom: spacing.sm }}>
                        SMART Task Definition
                      </Text>

                      {/* S — Specific */}
                      <Text style={styles.smartLabel}>S — Specific</Text>
                      <Text style={styles.smartHint}>What exactly needs to be done?</Text>
                      <TextInput
                        style={styles.input}
                        value={smartTitle}
                        onChangeText={setSmartTitle}
                        placeholder='Task title'
                      />
                      <TextInput
                        style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
                        value={smartDesc}
                        onChangeText={setSmartDesc}
                        placeholder='Detailed description'
                        multiline
                      />

                      {/* M — Measurable */}
                      <Text style={styles.smartLabel}>M — Measurable</Text>
                      <Text style={styles.smartHint}>How will you measure success?</Text>
                      <TextInput
                        style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
                        value={smartMeasurable}
                        onChangeText={setSmartMeasurable}
                        placeholder='e.g., 100% uniform compliance on next audit'
                        multiline
                      />

                      {/* A — Achievable */}
                      <Text style={styles.smartLabel}>A — Achievable</Text>
                      <Text style={styles.smartHint}>Assign to a section</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {sections?.map((s) => (
                            <Pressable
                              key={s.id}
                              style={[
                                styles.sectionOption,
                                smartSectionId === s.id && styles.sectionOptionActive,
                              ]}
                              onPress={() => setSmartSectionId(s.id)}
                            >
                              <Text
                                style={[
                                  styles.optionText,
                                  smartSectionId === s.id && styles.optionTextActive,
                                ]}
                              >
                                {s.name}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </ScrollView>

                      {/* R — Relevant */}
                      <Text style={styles.smartLabel}>R — Relevant</Text>
                      <Text style={styles.smartHint}>PRESTO zone this relates to</Text>
                      <View style={styles.smartZoneTag}>
                        <Text style={styles.smartZoneText}>
                          {getActionZone(action.id) || 'N/A'}
                        </Text>
                      </View>

                      {/* T — Time-bound */}
                      <Text style={styles.smartLabel}>T — Time-bound</Text>
                      <Text style={styles.smartHint}>When should this be completed?</Text>
                      <TextInput
                        style={styles.input}
                        value={smartDueDate}
                        onChangeText={setSmartDueDate}
                        placeholder='YYYY-MM-DD'
                      />

                      <Pressable
                        style={[
                          styles.smartSubmit,
                          (!smartSectionId || isPromoting) && { opacity: 0.5 },
                        ]}
                        onPress={handleSmartPromote}
                        disabled={!smartSectionId || isPromoting}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                          {isPromoting ? 'Promoting...' : 'Promote to Task'}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={{ alignItems: 'center', marginTop: spacing.sm }}
                        onPress={() => setPromotingActionId(null)}
                      >
                        <Text style={{ color: '#8e8e93' }}>Cancel</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
          </>
        }
        renderItem={({ item: finding }) => {
          const hasAction = existingActionFindingIds.has(finding.id)
          const isExpanded = expandedFinding === finding.id

          return (
            <View style={styles.findingCard}>
              <View style={styles.findingHeader}>
                <Text style={styles.findingLabel}>{finding.label}</Text>
                {finding.severity && (
                  <View style={styles.severityBadge}>
                    <Text style={styles.severityText}>{finding.severity}</Text>
                  </View>
                )}
              </View>

              {hasAction ? (
                <Text style={{ ...typography.caption, color: '#34C759' }}>
                  Action created
                </Text>
              ) : isExpanded ? (
                <View>
                  <TextInput
                    style={styles.input}
                    value={actionTitle}
                    onChangeText={setActionTitle}
                    placeholder='Action title'
                  />
                  <TextInput
                    style={styles.input}
                    value={actionDesc}
                    onChangeText={setActionDesc}
                    placeholder='Description (optional)'
                  />

                  <Text style={styles.optionLabel}>Priority</Text>
                  <View style={styles.optionsRow}>
                    {PRIORITY_OPTIONS.map((p) => (
                      <Pressable
                        key={p}
                        style={[
                          styles.option,
                          priority === p && styles.optionActive,
                        ]}
                        onPress={() => setPriority(p)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            priority === p && styles.optionTextActive,
                          ]}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.optionLabel}>Recurrence</Text>
                  <View style={styles.optionsRow}>
                    {RECURRENCE_OPTIONS.map((r) => (
                      <Pressable
                        key={r}
                        style={[
                          styles.option,
                          recurrence === r && styles.optionActive,
                        ]}
                        onPress={() =>
                          setRecurrence(recurrence === r ? null : r)
                        }
                      >
                        <Text
                          style={[
                            styles.optionText,
                            recurrence === r && styles.optionTextActive,
                          ]}
                        >
                          {r.replace('_', ' ')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Pressable
                    style={styles.createButton}
                    onPress={() => handleCreateAction(finding)}
                  >
                    <Text style={styles.createButtonText}>Create Action</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setExpandedFinding(finding.id)
                    setActionTitle(finding.label)
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>
                    + Create Action
                  </Text>
                </Pressable>
              )}
            </View>
          )
        }}
        ListEmptyComponent={
          <Text style={{ ...typography.body1, color: '#8e8e93', textAlign: 'center', marginTop: spacing.xl }}>
            No flagged or low-score findings
          </Text>
        }
      />
    </View>
  )
}
