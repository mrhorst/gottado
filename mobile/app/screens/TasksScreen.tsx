import { Pressable, Text, View } from 'react-native'
import styles from './styles'
import { useLoggedUser } from '../context/user/UserContext'
import { getTasks, setTaskCompleted, UserTasks } from '../services/taskService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { sortTasks } from '../utils/taskHelpers'
import { Stack } from 'expo-router'
import NavigationHeader from '../components/ui/NavigationHeader'
import { Section, useSections } from '../context/section/SectionContext'

interface SectionStats {
  sectionPendingTasks: (s: Section, p: UserTasks[]) => UserTasks[]
  sectionCompletedTasks: (s: Section, p: UserTasks[]) => UserTasks[]
}

const TasksScreen = () => {
  const { user } = useLoggedUser()
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', user?.sub],
    queryFn: getTasks,
    enabled: !!user,
  })

  const { sections, isLoading: isLoadingSections } = useSections()

  const sortedTasks = useMemo(() => {
    return sortTasks(tasks)
  }, [tasks])

  const mutation = useMutation({
    mutationFn: ({ id, complete }: { id: number; complete: boolean }) =>
      setTaskCompleted(id, complete),

    onMutate: async ({ id, complete }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.sub] })
      const previousTasks = queryClient.getQueryData<UserTasks[]>([
        'tasks',
        user?.sub,
      ])

      const newTasks = previousTasks
        ? previousTasks.map((task) =>
            task.id === id ? { ...task, complete } : task
          )
        : []

      queryClient.setQueryData<UserTasks[]>(
        ['tasks', user?.sub],
        sortTasks(newTasks)
      )
      return { previousTasks }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.sub] })
    },
    onError: (err, _updatedTask, context) => {
      queryClient.setQueryData(['tasks', user?.sub], context?.previousTasks)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.sub] })
    },
  })

  const toggleCompleteTask = (t: UserTasks) => {
    mutation.mutate({ id: t.id, complete: !t.complete })
  }

  if (isLoadingTasks) {
    return <Text>Loading tasks...</Text>
  }

  if (isLoadingSections || sections === undefined) {
    return <Text>Loading sections...</Text>
  }

  const pendingTasks = tasks.filter((t) => !t.complete)
  const completedTasks = tasks.filter((t) => t.complete)

  const sectionPendingTasks = (
    section: Section,
    pendingTasks: UserTasks[]
  ): UserTasks[] => {
    return pendingTasks.filter((t) => t.sectionName === section.name)
  }

  const sectionCompletedTasks = (
    section: Section,
    completedTasks: UserTasks[]
  ): UserTasks[] => {
    return completedTasks.filter((t) => t.sectionName === section.name)
  }

  const sectionStats = {
    sectionPendingTasks,
    sectionCompletedTasks,
  }

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <NavigationHeader />

      {pendingTasks.length === 0 ? (
        <View style={{ marginTop: 30, gap: 50 }}>
          <Text style={styles.header}>You have 0 pending tasks!</Text>
          <CompletedTasks
            tasks={sortedTasks}
            completedTasks={completedTasks}
            toggleCompleteTask={toggleCompleteTask}
          />
        </View>
      ) : (
        <View style={{ gap: 30 }}>
          <PendingTasks
            sections={sections}
            tasks={sortedTasks}
            pendingTasks={pendingTasks}
            toggleCompleteTask={toggleCompleteTask}
            sectionStats={sectionStats}
          />
          <CompletedTasks
            tasks={sortedTasks}
            completedTasks={completedTasks}
            toggleCompleteTask={toggleCompleteTask}
          />
        </View>
      )}
    </View>
  )
}

const PendingTasks = ({
  sections,
  tasks,
  pendingTasks,
  toggleCompleteTask,
  sectionStats,
}: {
  sections: Section[]
  tasks: UserTasks[]
  pendingTasks: UserTasks[]
  toggleCompleteTask: (t: UserTasks) => void
  sectionStats: SectionStats
}) => {
  return sections?.map((s) => (
    <View key={s.id} style={styles.tasksContainer}>
      <Text style={{ fontWeight: 700, fontSize: 24, textAlign: 'center' }}>
        {s.name} {sectionStats.sectionPendingTasks(s, pendingTasks).length}/
        {sectionStats.sectionCompletedTasks(s, tasks).length}
      </Text>
      {pendingTasks.map((t) =>
        !t.complete ? (
          t.sectionName === s.name ? (
            <View style={styles.taskCard} key={t.id}>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 18,
                  textDecorationLine: t.complete ? 'line-through' : 'none',
                }}
              >
                {t.title}
              </Text>
              <Pressable onPress={() => toggleCompleteTask(t)}>
                <View style={styles.toggleCompleteTask}></View>
              </Pressable>
            </View>
          ) : null
        ) : null
      )}
    </View>
  ))
}

const CompletedTasks = ({
  tasks,
  completedTasks,
  toggleCompleteTask,
}: {
  tasks: UserTasks[]
  completedTasks: UserTasks[]
  toggleCompleteTask: (t: UserTasks) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const onHeaderTap = () => {
    setIsExpanded((prev) => !prev)
  }
  return (
    <View style={styles.tasksContainer}>
      <Pressable onPress={onHeaderTap}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 15,
          }}
        >
          <Text style={{ fontWeight: 700, fontSize: 24 }}>
            Completed {completedTasks.length}/{tasks.length}
          </Text>
          <Text style={{ fontWeight: 700, fontSize: 24 }}>
            {isExpanded ? '↑' : '↓'}
          </Text>
        </View>
      </Pressable>
      {isExpanded &&
        tasks.map((t) =>
          t.complete ? (
            <View style={styles.taskCard} key={t.id}>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 18,
                  textDecorationLine: t.complete ? 'line-through' : 'none',
                }}
              >
                {t.title}
              </Text>
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
