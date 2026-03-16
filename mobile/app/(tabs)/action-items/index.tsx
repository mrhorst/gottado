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
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/styles/theme'
import { useActionItemsQuery } from '@/hooks/useActionItemsQuery'
import { useActionItemsMutation } from '@/hooks/useActionItemsMutation'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import type { ActionItem, Severity } from '@/types/audit'
import type { SectionProps } from '@/types/section'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { SharedValue } from 'react-native-reanimated'

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

const ActionItemsScreen = () => {
  const { actionItems, isLoading } = useActionItemsQuery()
  const { width } = useWindowDimensions()
  const isWide = width > 700
  const [promoteItem, setPromoteItem] = useState<ActionItem | null>(null)

  if (isLoading) {
    return (
      <View style={[s.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  if (actionItems.length === 0) {
    return (
      <View style={s.container}>
        <View style={s.emptyContainer}>
          <Ionicons name='checkmark-done-circle-outline' size={48} color='#d1d1d6' />
          <Text style={s.emptyText}>No pending action items</Text>
          <Text style={s.emptySubtext}>
            Action items from audit runs will appear here
          </Text>
        </View>
      </View>
    )
  }

  return (
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
  const { sections } = useSectionQuery()
  const { promote } = useAuditActionsMutation()
  const [selectedSection, setSelectedSection] = useState<SectionProps | null>(null)
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [dueDate, setDueDate] = useState('')

  const writableSections = sections?.filter((s) => s.role !== 'viewer') ?? []

  const handlePromote = async () => {
    if (!selectedSection) return
    try {
      await promote.mutateAsync({
        actionId: item.id,
        payload: {
          sectionId: selectedSection.id,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
        },
      })
      onClose()
    } catch {
      Alert.alert('Error', 'Failed to promote action to task.')
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

        <ScrollView contentContainerStyle={s.modalContent} keyboardShouldPersistTaps='handled'>
          {/* Source info */}
          <View style={s.sourceCard}>
            <Ionicons name='clipboard-outline' size={16} color='#8e8e93' />
            <Text style={s.sourceText}>
              From: {item.auditName} ({new Date(item.auditDate).toLocaleDateString()})
            </Text>
          </View>

          {/* Title */}
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

          {/* Description */}
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

          {/* Due Date */}
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

          {/* Section picker */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Assign to Section</Text>
            {writableSections.length === 0 ? (
              <Text style={s.emptySubtext}>No writable sections available.</Text>
            ) : (
              <View style={s.sectionList}>
                {writableSections.map((sec) => {
                  const isSelected = selectedSection?.id === sec.id
                  return (
                    <Pressable
                      key={sec.id}
                      style={[s.sectionOption, isSelected && s.sectionOptionSelected]}
                      onPress={() => setSelectedSection(sec)}
                    >
                      <View style={s.sectionOptionLeft}>
                        <View style={[s.radioOuter, isSelected && s.radioOuterSelected]}>
                          {isSelected && <View style={s.radioInner} />}
                        </View>
                        <Text style={[s.sectionOptionText, isSelected && s.sectionOptionTextSelected]}>
                          {sec.name}
                        </Text>
                      </View>
                      <Text style={s.sectionRoleBadge}>{sec.role}</Text>
                    </Pressable>
                  )
                })}
              </View>
            )}
          </View>
        </ScrollView>
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
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  summaryText: {
    fontSize: 13,
    color: '#8e8e93',
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...typography.h3,
    color: '#c7c7cc',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#c7c7cc',
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  priorityStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  itemContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemDescription: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  auditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#8e8e93',
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  swipeActionsRow: {
    flexDirection: 'row',
    width: 160,
  },
  swipeBtn: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  swipeableContainer: {
    overflow: 'hidden',
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalCancel: {
    fontSize: 17,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  modalDone: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  sourceText: {
    fontSize: 13,
    color: '#8e8e93',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    overflow: 'hidden',
  },
  sectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  sectionOptionSelected: {
    backgroundColor: colors.primary + '08',
  },
  sectionOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  sectionOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sectionOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  sectionRoleBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
})

export default ActionItemsScreen
