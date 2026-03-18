import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/styles/theme'
import { useActionItemsQuery } from '@/hooks/useActionItemsQuery'
import { useActionItemsMutation } from '@/hooks/useActionItemsMutation'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import type { ActionItem, Recurrence, Severity } from '@/types/audit'
import type { SectionProps } from '@/types/section'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { SharedValue } from 'react-native-reanimated'
import ScreenMotion from '@/components/ui/ScreenMotion'

const PRIORITY_COLORS: Record<Severity, string> = {
  low: '#34C759',
  medium: '#FF9500',
  high: '#FF3B30',
  critical: '#AF52DE',
}

const PRIORITY_LABELS: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const RECURRENCE_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  yearly: 'Yearly',
}

const ActionItemsScreen = () => {
  const { actionItems, isLoading } = useActionItemsQuery()
  const { width } = useWindowDimensions()
  const isWide = width > 700
  const [promoteItem, setPromoteItem] = useState<ActionItem | null>(null)

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  if (actionItems.length === 0) {
    return (
      <ScreenMotion>
        <View style={s.container}>
          <View style={s.emptyContainer}>
            <Ionicons name='checkmark-done-circle-outline' size={48} color='#d1d1d6' />
            <Text style={s.emptyText}>No pending action items</Text>
            <Text style={s.emptySubtext}>
              Action items from audit runs will appear here
            </Text>
          </View>
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <View style={s.container}>
        <View style={s.summaryBar}>
          <Text style={s.summaryText}>
            {actionItems.length} pending action{actionItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <FlatList
          data={actionItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            s.content,
            isWide && { maxWidth: 800, alignSelf: 'center', width: '100%' },
          ]}
          renderItem={({ item }) => (
            <SwipeableActionItem
              item={item}
              onPromote={() => setPromoteItem(item)}
            />
          )}
        />
        {promoteItem && (
          <PromoteModal
            item={promoteItem}
            onClose={() => setPromoteItem(null)}
          />
        )}
      </View>
    </ScreenMotion>
  )
}

const SwipeableActionItem = ({
  item,
  onPromote,
}: {
  item: ActionItem
  onPromote: () => void
}) => {
  const swipeRef = useRef<React.ComponentRef<typeof ReanimatedSwipeable>>(null)
  const { dismiss } = useActionItemsMutation()

  const handleDismiss = useCallback(() => {
    const doDismiss = () => {
      dismiss.mutate(item.id)
      swipeRef.current?.close()
    }
    if (Platform.OS === 'web') {
      if (window.confirm(`Dismiss "${item.title}"?`)) doDismiss()
    } else {
      Alert.alert('Dismiss Action', `Dismiss "${item.title}"? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dismiss', style: 'destructive', onPress: doDismiss },
      ])
    }
  }, [item, dismiss])

  const renderRightActions = useCallback(
    (_prog: SharedValue<number>, _drag: SharedValue<number>) => (
      <View style={s.swipeActionsRow}>
        <Pressable
          style={[s.swipeBtn, { backgroundColor: '#34C759' }]}
          onPress={() => {
            swipeRef.current?.close()
            onPromote()
          }}
        >
          <Ionicons name='arrow-up-circle' size={20} color='#fff' />
          <Text style={s.swipeBtnText}>Promote</Text>
        </Pressable>
        <Pressable
          style={[s.swipeBtn, { backgroundColor: '#8e8e93' }]}
          onPress={() => {
            swipeRef.current?.close()
            handleDismiss()
          }}
        >
          <Ionicons name='close-circle' size={20} color='#fff' />
          <Text style={s.swipeBtnText}>Dismiss</Text>
        </Pressable>
      </View>
    ),
    [onPromote, handleDismiss]
  )

  const priorityColor = PRIORITY_COLORS[item.priority]
  const auditDate = new Date(item.auditDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      overshootLeft={false}
      renderRightActions={renderRightActions}
      containerStyle={s.swipeableContainer}
    >
      <Pressable style={s.itemRow} onPress={onPromote}>
        <View style={[s.priorityStripe, { backgroundColor: priorityColor }]} />
        <View style={s.itemContent}>
          <Text style={s.itemTitle} numberOfLines={2}>{item.title}</Text>
          {item.description && (
            <Text style={s.itemDescription} numberOfLines={1}>{item.description}</Text>
          )}
          <View style={s.itemMeta}>
            <View style={s.auditBadge}>
              <Ionicons name='clipboard-outline' size={11} color='#8e8e93' />
              <Text style={s.metaText}>{item.auditName}</Text>
            </View>
            <Text style={s.metaText}>{auditDate}</Text>
            {item.recurrence && (
              <View style={s.recurrenceBadge}>
                <Ionicons name='repeat-outline' size={11} color={colors.primary} />
                <Text style={s.recurrenceText}>{RECURRENCE_LABELS[item.recurrence]}</Text>
              </View>
            )}
            {item.assignedUserName && (
              <View style={s.assigneeBadge}>
                <Ionicons name='person-outline' size={11} color='#8e8e93' />
                <Text style={s.metaText}>{item.assignedUserName}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={[s.priorityPill, { backgroundColor: priorityColor + '18' }]}>
          <Text style={[s.priorityText, { color: priorityColor }]}>
            {PRIORITY_LABELS[item.priority]}
          </Text>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  )
}

const PromoteModal = ({
  item,
  onClose,
}: {
  item: ActionItem
  onClose: () => void
}) => {
  const router = useRouter()
  const { sections } = useSectionQuery()
  const { promote } = useActionItemsMutation()
  const [selectedSection, setSelectedSection] = useState<SectionProps | null>(null)
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [dueDate, setDueDate] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence | null>(item.recurrence ?? null)
  const [createdTaskId, setCreatedTaskId] = useState<number | null>(null)

  const writableSections = sections?.filter((s) => s.role !== 'viewer') ?? []

  const handlePromote = async () => {
    if (!selectedSection) return
    try {
      const result = await promote.mutateAsync({
        actionId: item.id,
        payload: {
          sectionId: selectedSection.id,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          deadlineTime: deadlineTime || undefined,
          recurrence,
        },
      })
      setCreatedTaskId(result.task.id)
    } catch {
      Alert.alert('Error', 'Failed to promote action to task.')
    }
  }

  const handleViewTask = () => {
    onClose()
    if (createdTaskId) {
      router.push(`/(tabs)/tasks/${createdTaskId}`)
    }
  }

  return (
    <Modal visible animationType='slide' presentationStyle='pageSheet'>
      <View style={s.modalContainer}>
        <View style={s.modalHeader}>
          <Pressable onPress={onClose}>
            <Text style={s.modalCancel}>Cancel</Text>
          </Pressable>
          <Text style={s.modalTitle}>Promote to Task</Text>
          <Pressable onPress={handlePromote} disabled={!selectedSection || promote.isPending}>
            <Text style={[s.modalDone, !selectedSection && { color: '#c7c7cc' }]}>
              {promote.isPending ? 'Saving...' : 'Create'}
            </Text>
          </Pressable>
        </View>

        {createdTaskId ? (
          <View style={s.successContainer}>
            <Ionicons name='checkmark-circle' size={56} color='#34C759' />
            <Text style={s.successTitle}>Task Created</Text>
            <Text style={s.successSubtext}>
              &quot;{title}&quot; has been added to your tasks
              {recurrence ? ` as a ${RECURRENCE_LABELS[recurrence].toLowerCase()} task` : ''}.
            </Text>
            <Pressable style={s.viewTaskBtn} onPress={handleViewTask}>
              <Ionicons name='open-outline' size={18} color='#fff' />
              <Text style={s.viewTaskBtnText}>View Task</Text>
            </Pressable>
            <Pressable onPress={onClose}>
              <Text style={s.dismissLink}>Dismiss</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.modalContent} keyboardShouldPersistTaps='handled'>
            <View style={s.sourceCard}>
              <Ionicons name='clipboard-outline' size={16} color='#8e8e93' />
              <Text style={s.sourceText}>
                From: {item.auditName} ({new Date(item.auditDate).toLocaleDateString()})
              </Text>
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Task Title</Text>
              <TextInput
                style={s.input}
                value={title}
                onChangeText={setTitle}
                placeholder='Task title'
                placeholderTextColor='#c7c7cc'
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Description</Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder='Optional details'
                placeholderTextColor='#c7c7cc'
                multiline
                textAlignVertical='top'
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Due Date (optional)</Text>
              <TextInput
                style={s.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder='YYYY-MM-DD'
                placeholderTextColor='#c7c7cc'
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Deadline Time (optional)</Text>
              <TextInput
                style={s.input}
                value={deadlineTime}
                onChangeText={setDeadlineTime}
                placeholder='HH:MM'
                placeholderTextColor='#c7c7cc'
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Recurrence</Text>
              <View style={s.recurrenceGrid}>
                {(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'yearly'] as Recurrence[]).map((option) => {
                  const isSelected = recurrence === option
                  return (
                    <Pressable
                      key={option}
                      style={[s.recurrenceChip, isSelected && s.recurrenceChipSelected]}
                      onPress={() => setRecurrence(isSelected ? null : option)}
                    >
                      <Text style={[s.recurrenceChipText, isSelected && s.recurrenceChipTextSelected]}>
                        {RECURRENCE_LABELS[option]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Area</Text>
              <View style={s.sectionList}>
                {writableSections.map((section) => {
                  const isSelected = selectedSection?.id === section.id
                  return (
                    <Pressable
                      key={section.id}
                      style={[s.sectionOption, isSelected && s.sectionOptionSelected]}
                      onPress={() => setSelectedSection(section)}
                    >
                      <Text style={[s.sectionOptionText, isSelected && s.sectionOptionTextSelected]}>
                        {section.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  summaryBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textMuted,
    textAlign: 'center',
  },
  swipeableContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 14,
    overflow: 'hidden',
  },
  swipeActionsRow: {
    flexDirection: 'row',
  },
  swipeBtn: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  swipeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
  priorityStripe: {
    width: 6,
  },
  itemContent: {
    flex: 1,
    padding: spacing.md,
    gap: 6,
  },
  itemTitle: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.text,
  },
  itemDescription: {
    ...typography.body2,
    color: colors.textMuted,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  auditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  recurrenceText: {
    ...typography.caption,
    color: colors.primary,
  },
  priorityPill: {
    alignSelf: 'center',
    marginRight: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    color: colors.textMuted,
    fontSize: 16,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
  },
  modalDone: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: spacing.md,
  },
  sourceText: {
    ...typography.body2,
    color: colors.textMuted,
    flex: 1,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 120,
  },
  recurrenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurrenceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recurrenceChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '14',
  },
  recurrenceChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  recurrenceChipTextSelected: {
    color: colors.primary,
  },
  sectionList: {
    gap: 8,
  },
  sectionOption: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  sectionOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  sectionOptionText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
  },
  sectionOptionTextSelected: {
    color: colors.primary,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  successTitle: {
    ...typography.h3,
    color: colors.text,
  },
  successSubtext: {
    ...typography.body2,
    color: colors.textMuted,
    textAlign: 'center',
  },
  viewTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  viewTaskBtnText: {
    ...typography.button,
    color: '#fff',
  },
  dismissLink: {
    ...typography.body2,
    color: colors.textMuted,
  },
})

export default ActionItemsScreen
