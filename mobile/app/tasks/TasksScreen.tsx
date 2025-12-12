import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { Stack } from 'expo-router'
import NavigationHeader from '@/components/ui/NavigationHeader'
import { SectionProps, useSections } from '@/context/section/SectionContext'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { UserTasks } from '@/services/taskService'
import { colors, spacing, typography } from '@/styles/theme'

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  container: { padding: spacing.sm, justifyContent: 'center', gap: 20 },
  heading: { ...typography.h1, textAlign: 'center' },
  sectionContainer: { padding: spacing.sm, borderRadius: 8, borderWidth: 1 },
  tasksContainer: { padding: spacing.md, borderRadius: 8 },
  taskCard: {
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleCompleteTask: {
    borderWidth: 3,
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#888',
  },
  completedTaskButton: {
    height: 18,
    width: 18,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  pendingTaskTitle: {
    fontSize: 20,
    fontWeight: '400',
  },
  completedTaskTitle: {
    fontSize: 20,
    fontWeight: '400',
    textDecorationLine: 'line-through',
  },
  sectionHeadingPending: {
    ...typography.h2,
    textAlign: 'center',
  },
  sectionHeadingCompleted: {
    ...typography.h2,
    textAlign: 'center',
    textDecorationLine: 'line-through',
  },
})

const TasksScreen = () => {
  const { sections } = useSections()

  return (
    <View style={styles.screenContainer}>
      <NavigationHeader secondaryBtn='newTask' />
      <View style={styles.container}>
        <Text style={styles.heading}>TASKS</Text>
      </View>
      <View style={[styles.container, { gap: 30 }]}>
        {sections?.map((s) => (
          <Section key={s.id} section={s} />
        ))}
      </View>
    </View>
  )
}

const Section = ({ section }: { section: SectionProps }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const { sectionPendingTasks, sectionCompletedTasks, sectionTotalTasks } =
    useTasksQuery()
  const onHeaderTap = () => {
    setIsExpanded((prev) => !prev)
  }

  const isEmptySection = (section: SectionProps) => {
    if (
      sectionPendingTasks(section).length === 0 &&
      sectionCompletedTasks(section).length === 0
    ) {
      return true
    }
    return false
  }

  if (isEmptySection(section)) return null

  // If the section is not a section without tasks..
  return (
    <View style={styles.sectionContainer}>
      <View>
        <Pressable onPress={onHeaderTap}>
          <Text style={styles.sectionHeadingPending}>
            {section.name} {sectionCompletedTasks(section).length}/
            {sectionTotalTasks(section)} {isExpanded ? '↓' : '↑'}
          </Text>
        </Pressable>
      </View>
      <Tasks isExpanded={isExpanded} section={section} />
    </View>
  )
}

const Tasks = ({
  isExpanded,
  section,
}: {
  isExpanded: boolean
  section: SectionProps
}) => {
  const { toggleComplete } = useTasksMutation()
  const { sectionPendingTasks, sectionCompletedTasks } = useTasksQuery()

  const handleToggleComplete = (task: UserTasks) => {
    toggleComplete({ id: task.id, complete: !task.complete })
  }

  return (
    <View>
      {isExpanded && (
        <PendingTasks
          tasks={sectionPendingTasks(section)}
          handleToggleComplete={handleToggleComplete}
        />
      )}
      {isExpanded && (
        <CompletedTasks
          tasks={sectionCompletedTasks(section)}
          handleToggleComplete={handleToggleComplete}
        />
      )}
    </View>
  )
}

const PendingTasks = ({
  tasks,
  handleToggleComplete,
}: {
  tasks: UserTasks[]
  handleToggleComplete: (t: UserTasks) => void
}) => {
  return (
    <View>
      {tasks.map((t) => (
        <View style={styles.taskCard} key={t.id}>
          <Text style={styles.pendingTaskTitle}>{t.title}</Text>
          <Pressable onPress={() => handleToggleComplete(t)}>
            <View style={styles.toggleCompleteTask}></View>
          </Pressable>
        </View>
      ))}
    </View>
  )
}

const CompletedTasks = ({
  tasks,
  handleToggleComplete,
}: {
  tasks: UserTasks[]
  handleToggleComplete: (t: UserTasks) => void
}) => {
  return (
    <View>
      {tasks.map((t) => (
        <View style={styles.taskCard} key={t.id}>
          <Text style={styles.completedTaskTitle}>{t.title}</Text>
          <Pressable onPress={() => handleToggleComplete(t)}>
            <View style={styles.toggleCompleteTask}>
              <View style={styles.completedTaskButton}></View>
            </View>
          </Pressable>
        </View>
      ))}
    </View>
  )
}
export default TasksScreen
