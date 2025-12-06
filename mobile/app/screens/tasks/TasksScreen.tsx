import { Pressable, Text, View } from 'react-native'
import styles from '../styles'
import { useState } from 'react'
import { Stack } from 'expo-router'
import NavigationHeader from '../../components/ui/NavigationHeader'
import { useSections } from '../../context/section/SectionContext'
import { useTasksQuery } from '../../hooks/useTasksQuery'

const TasksScreen = () => {
  const { allPendingTasks } = useTasksQuery()
  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <NavigationHeader />

      {allPendingTasks.length === 0 ? (
        <View style={{ gap: 30 }}>
          <Text style={styles.header}>You have 0 pending tasks!</Text>
          <CompletedTasks />
        </View>
      ) : (
        <View style={{ gap: 30 }}>
          <PendingTasks />
          <CompletedTasks />
        </View>
      )}
    </View>
  )
}

const PendingTasks = () => {
  const { sections } = useSections()
  const {
    sectionPendingTasks,
    sectionCompletedTasks,
    toggleCompleteTask,
    sectionTotalTasks,
  } = useTasksQuery()

  return sections?.map((s) =>
    sectionTotalTasks(s) === 0 || sectionPendingTasks(s).length === 0 ? null : (
      <View key={s.id} style={styles.tasksContainer}>
        <Text style={styles.sectionSummaryHeading}>
          {s.name} {sectionCompletedTasks(s).length}/{sectionTotalTasks(s)}
        </Text>

        {sectionPendingTasks(s).map((t) => (
          <View style={styles.taskCard} key={t.id}>
            <Text style={styles.pendingTaskTitle}>{t.title}</Text>
            <Pressable onPress={() => toggleCompleteTask(t)}>
              <View style={styles.toggleCompleteTask}></View>
            </Pressable>
          </View>
        ))}
      </View>
    )
  )
}

const CompletedTasks = () => {
  const { tasks, toggleCompleteTask, allCompletedTasks } = useTasksQuery()
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
              <Pressable onPress={() => toggleCompleteTask(t)}>
                <View style={styles.toggleCompleteTask}></View>
              </Pressable>
            </View>
          ) : null
        )}
    </View>
  )
}
export default TasksScreen
