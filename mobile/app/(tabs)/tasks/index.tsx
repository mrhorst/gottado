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
import { SharedValue } from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'

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

  const isLoading = sectionsLoading || tasksLoading

  if (isLoading) {
    return (
      <View style={[s.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  const totalTasks = tasks.length
  const completedCount = allCompletedTasks.length
  const pendingCount = allPendingTasks.length
  const progress = totalTasks > 0 ? completedCount / totalTasks : 0

  if (!sections || sections.length === 0 || totalTasks === 0) {
    return (
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
    )
  }

  return (
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
        data={sections.filter((sec) =>
          tasks.some((t) => t.sectionName === sec.name)
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          s.content,
          isWide && { maxWidth: 800, alignSelf: 'center', width: '100%' },
        ]}
        renderItem={({ item }) => <SectionGroup section={item} />}
      />
    </View>
  )
}

const SectionGroup = ({ section }: { section: SectionProps }) => {
  const { sectionPendingTasks, sectionCompletedTasks, sectionTotalTasks } =
    useTasksQuery()
  const { toggleComplete, deleteTask, completeWithPicture, isUploadingPicture } = useTasksMutation()
  const router = useRouter()

  const completed = sectionCompletedTasks(section)
  const pending = sectionPendingTasks(section)
  const total = sectionTotalTasks(section)

  const [showCompleted, setShowCompleted] = useState(false)

  const launchCamera = useCallback(async (task: UserTasks) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to complete this task.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    })
    if (!result.canceled && result.assets[0]) {
      try {
        await completeWithPicture({ id: task.id, imageUri: result.assets[0].uri })
      } catch {
        Alert.alert('Upload failed', 'Could not upload the picture. Please try again.')
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

      {pending.map((task) => (
        <SwipeableTaskItem
          key={task.id}
          task={task}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
          done={false}
        />
      ))}

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
        completed.map((task) => (
          <SwipeableTaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            done
          />
        ))}
    </View>
  )
}

const SwipeableTaskItem = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  done,
}: {
  task: UserTasks
  onToggle: (t: UserTasks) => void
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
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      overshootLeft={false}
      renderRightActions={renderRightActions}
      containerStyle={s.swipeableContainer}
    >
      <TaskItem task={task} onToggle={onToggle} done={done} />
    </ReanimatedSwipeable>
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

const TaskItem = ({
  task,
  onToggle,
  done,
}: {
  task: UserTasks
  onToggle: (t: UserTasks) => void
  done: boolean
}) => {
  const status = getTaskStatus(task)
  const isLate = status === 'late'
  const isDueToday = status === 'due_today'

  return (
    <Pressable
      style={[s.taskRow, isLate && s.taskRowLate]}
      onPress={() => onToggle(task)}
    >
      <View style={[s.checkbox, done && s.checkboxDone, isLate && !done && s.checkboxLate]}>
        {done && <Ionicons name='checkmark' size={14} color='#fff' />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={done ? s.taskTitleDone : s.taskTitle}>{task.title}</Text>
        {/* Due date/time + recurrence info row */}
        <View style={s.metaRow}>
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
      </View>

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
    </Pressable>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
})

export default TasksScreen
