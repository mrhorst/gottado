import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useEffect, useState } from 'react'
import { SectionProps } from '@/types/section'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { UserTasks } from '@/services/taskService'
import { colors, spacing, typography } from '@/styles/theme'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { useWorkspace } from '@/context/workspace/WorkspaceContext'

const styles = StyleSheet.create({
  screenContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
    flex: 1,
  },
  container: { padding: spacing.sm, justifyContent: 'center', gap: 20 },
  heading: { ...typography.h1, textAlign: 'center' },
  sectionContainer: { marginBottom: spacing.xl, padding: spacing.sm },
  tasksContainer: { padding: spacing.md },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    backgroundColor: colors.background,
  },
  toggleCompleteTask: {
    borderWidth: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#c6c6c8',
    backgroundColor: 'transparent',
  },
  completedTaskButton: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  pendingTaskTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.text,
    flex: 1,
  },
  completedTaskTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#aeaeb2',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  sectionHeadingPending: {
    fontSize: 14,
    fontWeight: 600,
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  noSectionText: {},
  noTasksText: {
    ...typography.h2,
  },
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 16,
    padding: spacing.lg,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Android Shadow
    elevation: 4,
  },
  orgBadge: {
    backgroundColor: colors.primary + '15', // 15% opacity version of your primary
    padding: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  orgText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
})

const TasksScreen = () => {
  const { sections, isLoading, isError, error } = useSectionQuery()
  const { tasks } = useTasksQuery()
  const { org } = useWorkspace()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text>Tasks error: {error?.message}</Text>
      </View>
    )
  }

  if (!sections || sections.length === 0) {
    return (
      <View style={styles.screenContainer}>
        <View>
          <Text style={styles.noSectionText}>No sections yet! {org?.name}</Text>
        </View>
      </View>
    )
  }

  if (tasks.length === 0) {
    return (
      <View style={[styles.screenContainer]}>
        <View style={styles.card}>
          <Text style={styles.noTasksText}>No tasks yet!</Text>
        </View>
      </View>
    )
  }
  return (
    <View style={styles.screenContainer}>
      <ScrollView>
        <View style={styles.container}>
          {sections?.map((s) => (
            <Section key={s.id} section={s} />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const Section = ({ section }: { section: SectionProps }) => {
  const { sectionPendingTasks, sectionCompletedTasks, sectionTotalTasks } =
    useTasksQuery()
  const { toggleComplete } = useTasksMutation()

  const completed = sectionCompletedTasks(section)
  const pending = sectionPendingTasks(section)
  const total = sectionTotalTasks(section)

  const hasPendingTasks = sectionPendingTasks(section).length > 0
  const [isExpanded, setIsExpanded] = useState(hasPendingTasks)

  const onHeaderTap = () => {
    setIsExpanded((prev) => !prev)
  }

  const handleToggle = (task: UserTasks) => {
    toggleComplete({ id: task.id, complete: !task.complete })
  }

  useEffect(() => {
    if (pending.length === 0) {
      setIsExpanded(false)
    }
  }, [pending.length])

  if (total === 0) return null

  return (
    <View style={styles.sectionContainer}>
      <View>
        <Pressable onPress={onHeaderTap}>
          <Text
            style={[
              completed.length === total && styles.completedTaskTitle,
              styles.sectionHeadingPending,
            ]}
          >
            {section.name} {completed.length}/{total}{' '}
            {completed.length === total ? '(completed)' : ''}{' '}
            {isExpanded ? '↓' : '↑'}
          </Text>
        </Pressable>
      </View>
      {isExpanded && (
        <View>
          <TaskList tasks={pending} onToggle={handleToggle} variant='pending' />
          <TaskList
            tasks={completed}
            onToggle={handleToggle}
            variant='completed'
          />
        </View>
      )}
    </View>
  )
}

const TaskList = ({
  tasks,
  onToggle,
  variant,
}: {
  tasks: UserTasks[]
  onToggle: (t: UserTasks) => void
  variant: 'pending' | 'completed'
}) => {
  return (
    <View>
      {tasks.map((t) => (
        <View style={styles.taskCard} key={t.id}>
          <Text
            style={
              variant === 'pending'
                ? styles.pendingTaskTitle
                : styles.completedTaskTitle
            }
          >
            {t.title}
          </Text>
          <Pressable onPress={() => onToggle(t)}>
            <View
              style={
                variant === 'completed'
                  ? [styles.toggleCompleteTask, { borderColor: colors.primary }]
                  : styles.toggleCompleteTask
              }
            >
              {variant === 'completed' && (
                <View style={styles.completedTaskButton}></View>
              )}
            </View>
          </Pressable>
        </View>
      ))}
    </View>
  )
}

export default TasksScreen
