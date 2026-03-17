import { useCallback, useMemo, useState } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import ScreenMotion from '@/components/ui/ScreenMotion'
import PriorityBadge from '@/components/ui/PriorityBadge'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { UserTasks } from '@/services/taskService'
import { colors, spacing, typography } from '@/styles/theme'

const RECURRENCE_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: '6 months',
  yearly: 'Yearly',
}

const formatTime12h = (time24: string) => {
  const [h, m] = time24.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

const ListChecklistScreen = () => {
  const { id } = useLocalSearchParams()
  const listId = Number(id)
  const router = useRouter()
  const { tasks, isLoading } = useTasksQuery()
  const { toggleComplete, completeWithPicture } = useTasksMutation()
  const [showCompleted, setShowCompleted] = useState(false)

  const listTasks = useMemo(() => tasks.filter((task) => task.listId === listId), [tasks, listId])
  const pending = listTasks.filter((task) => !task.complete)
  const completed = listTasks.filter((task) => task.complete)
  const oneTimePending = pending.filter((task) => !task.recurrence)
  const recurringPending = pending.filter((task) => !!task.recurrence)
  const listName = listTasks[0]?.listName ?? 'Checklist'
  const sectionName = listTasks[0]?.sectionName ?? ''

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

  const handleToggle = useCallback((task: UserTasks) => {
    if (!task.complete && task.requiresPicture) {
      launchCamera(task)
      return
    }
    toggleComplete({ id: task.id, complete: !task.complete })
  }, [launchCamera, toggleComplete])

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.sectionLabel}>{sectionName}</Text>
          <Text style={s.title}>{listName}</Text>
          <Text style={s.subtitle}>
            {completed.length}/{listTasks.length} tasks completed
          </Text>
        </View>

        {oneTimePending.length > 0 && (
          <TaskGroup
            title={`One-Time Tasks (${oneTimePending.length})`}
            tasks={oneTimePending}
            onToggle={handleToggle}
            onOpenDetails={(task) => router.push(`/(tabs)/tasks/details/${task.id}`)}
          />
        )}

        {recurringPending.length > 0 && (
          <TaskGroup
            title={`Recurring Tasks (${recurringPending.length})`}
            tasks={recurringPending}
            onToggle={handleToggle}
            onOpenDetails={(task) => router.push(`/(tabs)/tasks/details/${task.id}`)}
          />
        )}

        {completed.length > 0 && (
          <View style={s.completedWrap}>
            <Pressable style={s.completedToggle} onPress={() => setShowCompleted((prev) => !prev)}>
              <Ionicons
                name={showCompleted ? 'chevron-down' : 'chevron-forward'}
                size={14}
                color='#8e8e93'
              />
              <Text style={s.completedToggleText}>Completed ({completed.length})</Text>
            </Pressable>
            {showCompleted && (
              <TaskGroup
                title=''
                tasks={completed}
                onToggle={handleToggle}
                onOpenDetails={(task) => router.push(`/(tabs)/tasks/details/${task.id}`)}
                hideHeader
              />
            )}
          </View>
        )}
      </ScrollView>
    </ScreenMotion>
  )
}

const TaskGroup = ({
  title,
  tasks,
  onToggle,
  onOpenDetails,
  hideHeader,
}: {
  title: string
  tasks: UserTasks[]
  onToggle: (task: UserTasks) => void
  onOpenDetails: (task: UserTasks) => void
  hideHeader?: boolean
}) => (
  <View style={s.groupCard}>
    {!hideHeader && <Text style={s.groupTitle}>{title}</Text>}
    {tasks.map((task, index) => (
      <View
        key={task.id}
        style={[s.taskRow, index === tasks.length - 1 && s.lastTaskRow]}
      >
        <Pressable
          style={[s.checkbox, task.complete && s.checkboxDone]}
          onPress={() => onToggle(task)}
        >
          {task.complete && <Ionicons name='checkmark' size={14} color='#fff' />}
        </Pressable>
        <Pressable style={s.taskContent} onPress={() => onOpenDetails(task)}>
          <Text style={task.complete ? s.taskTitleDone : s.taskTitle}>{task.title}</Text>
          <View style={s.metaRow}>
            <PriorityBadge priority={task.priority} />
            {task.recurrence && (
              <View style={s.inlineMeta}>
                <Ionicons name='repeat' size={11} color='#8e8e93' />
                <Text style={s.metaText}>{RECURRENCE_LABELS[task.recurrence]}</Text>
              </View>
            )}
            {task.requiresPicture && (
              <View style={s.inlineMeta}>
                <Ionicons name='camera' size={11} color='#8e8e93' />
                <Text style={s.metaText}>Photo</Text>
              </View>
            )}
            {task.deadlineTime && <Text style={s.metaText}>{formatTime12h(task.deadlineTime)}</Text>}
          </View>
        </Pressable>
        <Ionicons name='chevron-forward' size={16} color='#c7c7cc' />
      </View>
    ))}
  </View>
)

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  hero: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    overflow: 'hidden',
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  lastTaskRow: {
    borderBottomWidth: 0,
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
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: colors.text,
  },
  taskTitleDone: {
    fontSize: 16,
    color: '#aeaeb2',
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 3,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#8e8e93',
  },
  completedWrap: {
    gap: 8,
  },
  completedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  completedToggleText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '600',
  },
})

export default ListChecklistScreen
