import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { useCallback, useRef, useState } from 'react'
import { SectionProps } from '@/types/section'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { UserTasks } from '@/services/taskService'
import { colors, spacing, typography } from '@/styles/theme'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  LinearTransition,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'
import ScreenMotion from '@/components/ui/ScreenMotion'
import PriorityBadge from '@/components/ui/PriorityBadge'
import { getTaskActionMode } from '@/utils/taskInteraction'

const formatTime12h = (time24: string) => {
  const [h, m] = time24.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

const getTaskStatus = (task: UserTasks): 'late' | 'due_today' | 'upcoming' | 'none' => {
  if (task.complete) return 'none'

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  if (task.dueDate) {
    if (task.dueDate < today) return 'late'
    if (task.dueDate === today) {
      if (task.deadlineTime) {
        const [dh, dm] = task.deadlineTime.split(':').map(Number)
        if (now.getHours() > dh || (now.getHours() === dh && now.getMinutes() > dm)) {
          return 'late'
        }
      }
      return 'due_today'
    }
    return 'upcoming'
  }

  // Recurring tasks with deadline time but no specific due date
  if (task.deadlineTime && task.recurrence) {
    const [dh, dm] = task.deadlineTime.split(':').map(Number)
    if (now.getHours() > dh || (now.getHours() === dh && now.getMinutes() > dm)) {
      return 'late'
    }
    return 'due_today'
  }

  return 'none'
}

const TasksScreen = () => {
  const { sections, isLoading: sectionsLoading } = useSectionQuery()
  const { tasks, isLoading: tasksLoading, allPendingTasks, allCompletedTasks } =
    useTasksQuery()
  const { width } = useWindowDimensions()
  const isWide = width > 700
  const [showCompletedSections, setShowCompletedSections] = useState(false)

  const isLoading = sectionsLoading || tasksLoading

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  const totalTasks = tasks.length
  const completedCount = allCompletedTasks.length
  const pendingCount = allPendingTasks.length
  const progress = totalTasks > 0 ? completedCount / totalTasks : 0
  const sectionsWithTasks = (sections ?? []).filter((sec) =>
    tasks.some((t) => t.sectionName === sec.name)
  )
  const activeSections = sectionsWithTasks.filter(
    (sec) => tasks.some((t) => t.sectionName === sec.name && !t.complete)
  )
  const completedSections = sectionsWithTasks.filter(
    (sec) => !tasks.some((t) => t.sectionName === sec.name && !t.complete)
  )

  if (!sections || sections.length === 0 || totalTasks === 0) {
    return (
      <ScreenMotion>
        <View style={s.container}>
          <View style={s.emptyContainer}>
            <Ionicons name='checkmark-done-outline' size={48} color='#d1d1d6' />
            <Text style={s.emptyText}>
              {totalTasks === 0 ? 'No tasks yet' : 'No sections yet'}
            </Text>
            <Text style={s.emptySubtext}>
              Tasks will appear here once created
            </Text>
          </View>
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <View style={s.container}>
      {/* Progress summary */}
      <View style={s.summaryBar}>
        <Text style={s.summaryText}>
          {completedCount}/{totalTasks} completed
          {pendingCount > 0 && ` \u2022 ${pendingCount} pending`}
        </Text>
        <View style={s.progressBarBg}>
          <View
            style={[s.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>

      <FlatList
        data={activeSections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          s.content,
          isWide && { maxWidth: 800, alignSelf: 'center', width: '100%' },
        ]}
        renderItem={({ item }) => (
          <Animated.View layout={LinearTransition.springify().damping(18).stiffness(170)}>
            <SectionGroup section={item} />
          </Animated.View>
        )}
        ListFooterComponent={
          completedSections.length > 0 ? (
            <View style={s.completedSectionsWrap}>
              <Pressable
                style={s.completedSectionsToggle}
                onPress={() => setShowCompletedSections((prev) => !prev)}
              >
                <Ionicons
                  name={showCompletedSections ? 'chevron-down' : 'chevron-forward'}
                  size={15}
                  color='#8e8e93'
                />
                <Text style={s.completedSectionsText}>
                  Completed Sections ({completedSections.length})
                </Text>
              </Pressable>
              {showCompletedSections && (
                <Animated.View
                  entering={FadeInDown.duration(220)}
                  exiting={FadeOutUp.duration(180)}
                  layout={LinearTransition.springify().damping(18).stiffness(170)}
                >
                  {completedSections.map((sec) => (
                    <Animated.View
                      key={sec.id}
                      layout={LinearTransition.springify().damping(18).stiffness(170)}
                    >
                      <SectionGroup section={sec} />
                    </Animated.View>
                  ))}
                </Animated.View>
              )}
            </View>
          ) : null
        }
      />
      </View>
    </ScreenMotion>
  )
}

const SectionGroup = ({ section }: { section: SectionProps }) => {
  const { sectionPendingTasks, sectionCompletedTasks, sectionTotalTasks } =
    useTasksQuery()
  const { toggleComplete, deleteTask, completeWithPicture } = useTasksMutation()
  const router = useRouter()

  const completed = sectionCompletedTasks(section)
  const pending = sectionPendingTasks(section)
  const total = sectionTotalTasks(section)

  const [showCompleted, setShowCompleted] = useState(false)
  const [showOneTime, setShowOneTime] = useState(true)
  const [showRecurring, setShowRecurring] = useState(true)

  const launchCamera = useCallback(async (task: UserTasks) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to complete this task.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      try {
        await completeWithPicture({ id: task.id, imageUri: result.assets[0].uri })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        Alert.alert('Upload failed', msg)
      }
    }
  }, [completeWithPicture])

  const handleToggle = useCallback(
    (task: UserTasks) => {
      // If completing a task that requires a picture, launch camera
      if (!task.complete && task.requiresPicture) {
        launchCamera(task)
        return
      }
      toggleComplete({ id: task.id, complete: !task.complete })
    },
    [toggleComplete, launchCamera]
  )

  const handleEdit = useCallback(
    (task: UserTasks) => {
      router.push(`/(tabs)/tasks/${task.id}`)
    },
    [router]
  )

  const handleOpenDetails = useCallback(
    (task: UserTasks) => {
      router.push(`/(tabs)/tasks/details/${task.id}`)
    },
    [router]
  )

  const handleDelete = useCallback(
    (task: UserTasks) => {
      const doDelete = () => deleteTask(task.id)
      if (Platform.OS === 'web') {
        if (window.confirm(`Delete "${task.title}"?`)) doDelete()
      } else {
        Alert.alert('Delete Task', `Delete "${task.title}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ])
      }
    },
    [deleteTask]
  )

  if (total === 0) return null

  const allDone = pending.length === 0
  const oneTimePending = pending.filter((task) => !task.recurrence)
  const recurringPending = pending.filter((task) => !!task.recurrence)

  return (
    <View style={s.sectionCard}>
      <View style={s.sectionHeader}>
        <View style={s.sectionHeaderLeft}>
          <Text style={s.sectionName}>{section.name}</Text>
          <Text style={s.sectionCount}>
            {completed.length}/{total}
          </Text>
        </View>
        {allDone && <Text style={s.sectionDone}>All done</Text>}
      </View>

      {oneTimePending.length > 0 && (
        <>
          <Pressable style={s.groupHeader} onPress={() => setShowOneTime((prev) => !prev)}>
            <Ionicons
              name={showOneTime ? 'chevron-down' : 'chevron-forward'}
              size={14}
              color='#8e8e93'
            />
            <Text style={s.groupHeaderText}>One-Time Tasks ({oneTimePending.length})</Text>
          </Pressable>
          {showOneTime && (
            <Animated.View
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(140)}
              layout={LinearTransition.springify().damping(18).stiffness(170)}
            >
              {oneTimePending.map((task) => (
                <SwipeableTaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onOpenDetails={handleOpenDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  done={false}
                />
              ))}
            </Animated.View>
          )}
        </>
      )}

      {recurringPending.length > 0 && (
        <>
          <Pressable style={s.groupHeader} onPress={() => setShowRecurring((prev) => !prev)}>
            <Ionicons
              name={showRecurring ? 'chevron-down' : 'chevron-forward'}
              size={14}
              color='#8e8e93'
            />
            <Text style={s.groupHeaderText}>Recurring Tasks ({recurringPending.length})</Text>
          </Pressable>
          {showRecurring && (
            <Animated.View
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(140)}
              layout={LinearTransition.springify().damping(18).stiffness(170)}
            >
              {RECURRENCE_ORDER.map((recurrence) => {
                const recurrenceTasks = recurringPending.filter((task) => task.recurrence === recurrence)
                if (recurrenceTasks.length === 0) return null
                return (
                  <View key={recurrence}>
                    <View style={s.recurrenceGroupHeader}>
                      <Text style={s.recurrenceGroupText}>
                        {RECURRENCE_LABELS[recurrence]} Tasks
                      </Text>
                    </View>
                    {recurrenceTasks.map((task) => (
                      <SwipeableTaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onOpenDetails={handleOpenDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        done={false}
                      />
                    ))}
                  </View>
                )
              })}
            </Animated.View>
          )}
        </>
      )}

      {completed.length > 0 && (
        <Pressable
          style={s.completedToggle}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Ionicons
            name={showCompleted ? 'chevron-down' : 'chevron-forward'}
            size={14}
            color='#8e8e93'
          />
          <Text style={s.completedToggleText}>
            {completed.length} completed
          </Text>
        </Pressable>
      )}

      {showCompleted &&
        (
          <Animated.View
            entering={FadeInDown.duration(220)}
            exiting={FadeOutUp.duration(180)}
            layout={LinearTransition.springify().damping(18).stiffness(170)}
          >
            {completed.map((task) => (
              <SwipeableTaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onOpenDetails={handleOpenDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                done
              />
            ))}
          </Animated.View>
        )}
    </View>
  )
}

const SwipeableTaskItem = ({
  task,
  onToggle,
  onOpenDetails,
  onEdit,
  onDelete,
  done,
}: {
  task: UserTasks
  onToggle: (t: UserTasks) => void
  onOpenDetails: (t: UserTasks) => void
  onEdit: (t: UserTasks) => void
  onDelete: (t: UserTasks) => void
  done: boolean
}) => {
  const swipeableRef = useRef<React.ComponentRef<typeof ReanimatedSwipeable>>(null)

  const renderRightActions = useCallback(
    (_prog: SharedValue<number>, _drag: SharedValue<number>) => (
      <View style={s.swipeActionsRow}>
        <Pressable
          style={[s.swipeBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            swipeableRef.current?.close()
            onEdit(task)
          }}
        >
          <Ionicons name='create-outline' size={20} color='#fff' />
          <Text style={s.swipeBtnText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[s.swipeBtn, { backgroundColor: colors.iOSred }]}
          onPress={() => {
            swipeableRef.current?.close()
            onDelete(task)
          }}
        >
          <Ionicons name='trash-outline' size={20} color='#fff' />
          <Text style={s.swipeBtnText}>Delete</Text>
        </Pressable>
      </View>
    ),
    [task, onEdit, onDelete]
  )

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
      layout={LinearTransition.springify().damping(18).stiffness(170)}
    >
      {getTaskActionMode(Platform.OS) === 'none' ? (
        <TaskItem
          task={task}
          onToggle={onToggle}
          onOpenDetails={onOpenDetails}
          done={done}
        />
      ) : (
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        overshootLeft={false}
        renderRightActions={renderRightActions}
        containerStyle={s.swipeableContainer}
      >
        <TaskItem
          task={task}
          onToggle={onToggle}
          onOpenDetails={onOpenDetails}
          done={done}
        />
      </ReanimatedSwipeable>
      )}
    </Animated.View>
  )
}

const RECURRENCE_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: '6 months',
  yearly: 'Yearly',
}

const RECURRENCE_ORDER: (keyof typeof RECURRENCE_LABELS)[] = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'semi_annual',
  'yearly',
]

const TaskItem = ({
  task,
  onToggle,
  onOpenDetails,
  done,
}: {
  task: UserTasks
  onToggle: (t: UserTasks) => void
  onOpenDetails: (t: UserTasks) => void
  done: boolean
}) => {
  const status = getTaskStatus(task)
  const isLate = status === 'late'
  const isDueToday = status === 'due_today'
  const checkboxScale = useSharedValue(1)

  const checkboxAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }))

  const handleCheckboxPress = () => {
    checkboxScale.value = withSequence(
      withTiming(0.86, { duration: 90 }),
      withTiming(1.06, { duration: 90 }),
      withTiming(1, { duration: 70 })
    )
    onToggle(task)
  }

  return (
    <View style={[s.taskRow, isLate && s.taskRowLate]}>
      <Animated.View style={checkboxAnimStyle}>
        <Pressable
          style={[s.checkbox, done && s.checkboxDone, isLate && !done && s.checkboxLate]}
          onPress={handleCheckboxPress}
        >
          {done && <Ionicons name='checkmark' size={14} color='#fff' />}
        </Pressable>
      </Animated.View>
      <Pressable
        style={s.taskContent}
        onPress={() => onOpenDetails(task)}
      >
        <Text style={done ? s.taskTitleDone : s.taskTitle}>{task.title}</Text>
        {/* Due date/time + recurrence info row */}
        <View style={s.metaRow}>
          {!!task.priority && (
            <PriorityBadge priority={task.priority} />
          )}
          {task.recurrence && (
            <View style={s.recurrencePill}>
              <Ionicons name='repeat' size={11} color='#8e8e93' />
              <Text style={s.metaText}>
                {RECURRENCE_LABELS[task.recurrence] || task.recurrence}
              </Text>
            </View>
          )}
          {task.requiresPicture && (
            <View style={s.recurrencePill}>
              <Ionicons name='camera' size={11} color='#8e8e93' />
              <Text style={s.metaText}>Photo</Text>
            </View>
          )}
          {task.relevanceTag && (
            <View style={s.auditSourcePill}>
              <Ionicons name='clipboard-outline' size={11} color='#AF52DE' />
              <Text style={s.auditSourceText}>{task.relevanceTag}</Text>
            </View>
          )}
          {task.lastCompletedAt && (
            <Text style={s.metaText}>
              Last:{' '}
              {new Date(task.lastCompletedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Due date + time badge */}
      {!done && (task.dueDate || task.deadlineTime) && (
        <View
          style={[
            s.dueBadge,
            isLate && s.dueBadgeLate,
            isDueToday && !isLate && s.dueBadgeToday,
          ]}
        >
          {isLate && (
            <Text style={[s.dueBadgeText, s.dueBadgeTextLate, { fontWeight: '800', marginRight: 2 }]}>
              LATE
            </Text>
          )}
          {task.dueDate && (
            <Text style={[s.dueBadgeText, isLate && s.dueBadgeTextLate, isDueToday && !isLate && s.dueBadgeTextToday]}>
              {task.dueDate === new Date().toISOString().split('T')[0]
                ? 'Today'
                : new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
            </Text>
          )}
          {task.deadlineTime && (
            <Text style={[s.dueBadgeText, isLate && s.dueBadgeTextLate, isDueToday && !isLate && s.dueBadgeTextToday]}>
              {task.dueDate ? ' \u2022 ' : ''}{formatTime12h(task.deadlineTime)}
            </Text>
          )}
        </View>
      )}
      <Pressable style={s.detailsHint} onPress={() => onOpenDetails(task)}>
        <Ionicons name='chevron-forward' size={16} color='#c7c7cc' />
      </Pressable>
    </View>
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
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#e5e5ea',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: spacing.md,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
  },
  sectionDone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  groupHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 4,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  recurrenceGroupHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 3,
  },
  recurrenceGroupText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a0a0a7',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
    gap: 12,
    backgroundColor: '#fff',
  },
  taskRowLate: {
    backgroundColor: '#FFF5F5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLate: {
    borderColor: colors.iOSred,
  },
  taskTitle: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  taskTitleDone: {
    fontSize: 16,
    color: '#aeaeb2',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  taskContent: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  recurrencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  auditSourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#AF52DE12',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  auditSourceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AF52DE',
  },
  metaText: {
    fontSize: 11,
    color: '#8e8e93',
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  dueBadgeLate: {
    backgroundColor: colors.iOSred + '18',
  },
  dueBadgeToday: {
    backgroundColor: '#FF950018',
  },
  dueBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
  },
  dueBadgeTextLate: {
    color: colors.iOSred,
  },
  dueBadgeTextToday: {
    color: '#FF9500',
  },
  swipeActionsRow: {
    flexDirection: 'row',
    width: 140,
  },
  swipeBtn: {
    width: 70,
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
  completedToggle: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedToggleText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
  },
  completedSectionsWrap: {
    marginTop: spacing.sm,
  },
  completedSectionsToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedSectionsText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '600',
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
  swipeableContainer: {
    overflow: 'hidden',
  },
  detailsHint: {
    paddingLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default TasksScreen
