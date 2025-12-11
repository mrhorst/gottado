import { Pressable, Text, View } from 'react-native'
import styles from '../styles'
import { useState } from 'react'
import { Stack } from 'expo-router'
import NavigationHeader from '@/components/ui/NavigationHeader'
import { useSections } from '@/context/section/SectionContext'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { UserTasks } from '@/services/taskService'

const TasksScreen = () => {
  const { allPendingTasks } = useTasksQuery()
  const { toggleComplete } = useTasksMutation()

  const handleToggleComplete = (task: UserTasks) => {
    toggleComplete({ id: task.id, complete: !task.complete })
  }
  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <NavigationHeader secondaryBtn='newTask' />

      {allPendingTasks.length === 0 ? (
        <View style={{ gap: 30 }}>
          <Text style={styles.header}>You have 0 pending tasks!</Text>
          <PendingTasks handleToggleComplete={handleToggleComplete} />
          <CompletedTasks handleToggleComplete={handleToggleComplete} />
        </View>
      ) : (
        <View style={{ gap: 30 }}>
          <PendingTasks handleToggleComplete={handleToggleComplete} />
          <CompletedTasks handleToggleComplete={handleToggleComplete} />
        </View>
      )}
    </View>
  )
}

// Need to redo how this screen works. Complete garbage at the moment.
// I'm thinking about adding a "show completed tasks" inside each section.
// instead of having a "Completed" that displays all completed tasks together.

const PendingTasks = ({
  handleToggleComplete,
}: {
  handleToggleComplete: (t: UserTasks) => void
}) => {
  const { sections } = useSections()
  const { sectionPendingTasks, sectionCompletedTasks, sectionTotalTasks } =
    useTasksQuery()

  return sections?.map((s) =>
    sectionPendingTasks(s).length === 0 && sectionTotalTasks(s) > 0 ? (
      <View key={s.id} style={styles.tasksContainer}>
        <Text
          style={[
            styles.sectionSummaryHeading,
            { textDecorationLine: 'line-through' },
          ]}
        >
          {s.name} {sectionCompletedTasks(s).length}/{sectionTotalTasks(s)}
        </Text>
      </View>
    ) : sectionTotalTasks(s) === 0 &&
      sectionPendingTasks(s).length === 0 ? null : (
      <View key={s.id} style={styles.tasksContainer}>
        <Text style={styles.sectionSummaryHeading}>
          {s.name} {sectionCompletedTasks(s).length}/{sectionTotalTasks(s)}
        </Text>

        {sectionPendingTasks(s).map((t) => (
          <View style={styles.taskCard} key={t.id}>
            <Text style={styles.pendingTaskTitle}>{t.title}</Text>
            <Pressable onPress={() => handleToggleComplete(t)}>
              <View style={styles.toggleCompleteTask}></View>
            </Pressable>
          </View>
        ))}
      </View>
    )
  )
}

const CompletedTasks = ({
  handleToggleComplete,
}: {
  handleToggleComplete: (t: UserTasks) => void
}) => {
  const { tasks, allCompletedTasks } = useTasksQuery()
  const [isExpanded, setIsExpanded] = useState(false)

  const onHeaderTap = () => {
    setIsExpanded((prev) => !prev)
  }

  const allSectionsCompletedTasks = tasks.filter((t) => t.complete)
  return allCompletedTasks.length === 0 ? null : (
    <View style={styles.tasksContainer}>
      <Pressable onPress={onHeaderTap}>
        <Text style={styles.sectionSummaryHeading}>
          Completed {allSectionsCompletedTasks.length}/{tasks.length}{' '}
          {isExpanded ? '↓' : '↑'}
        </Text>
      </Pressable>
      {isExpanded &&
        tasks.map((t) =>
          t.complete ? (
            <View style={styles.taskCard} key={t.id}>
              <Text style={styles.completedTaskTitle}>{t.title}</Text>
              <Pressable onPress={() => handleToggleComplete(t)}>
                <View style={styles.toggleCompleteTask}>
                  <View style={styles.completedTaskButton}></View>
                </View>
              </Pressable>
            </View>
          ) : null
        )}
    </View>
  )
}
export default TasksScreen
