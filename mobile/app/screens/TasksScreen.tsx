import { Button, Pressable, Text, View } from 'react-native'
import { useAuth } from '../context/auth/AuthContext'
import styles from './styles'
import { useLoggedUser } from '../context/user/UserContext'
import { getTasks, setTaskCompleted, UserTasks } from '../services/userService'
import { useNavigate } from 'react-router-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { sortTasks } from '../utils/taskHelpers'
import { Stack } from 'expo-router'

const TasksScreen = () => {
  const { logout } = useAuth()
  const { user } = useLoggedUser()
  const nav = useNavigate()
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.sub],
    queryFn: getTasks,
    enabled: !!user,
  })

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

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  const pendingTasks = tasks.filter((t) => !t.complete)
  const completedTasks = tasks.filter((t) => t.complete)

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <View style={styles.headerContainer}>
        <Button title='Back' onPress={() => nav(-1)}></Button>
        <Button title='Logout' onPress={logout} />
      </View>
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
            tasks={sortedTasks}
            pendingTasks={pendingTasks}
            toggleCompleteTask={toggleCompleteTask}
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
  tasks,
  pendingTasks,
  toggleCompleteTask,
}: {
  tasks: UserTasks[]
  pendingTasks: UserTasks[]
  toggleCompleteTask: (t: UserTasks) => void
}) => {
  return (
    <View style={styles.tasksContainer}>
      <Text style={{ fontWeight: 700, fontSize: 24, textAlign: 'center' }}>
        Pending {pendingTasks.length}/{tasks.length}
      </Text>
      {tasks.map((t) =>
        !t.complete ? (
          <View style={styles.taskCard} key={t.id}>
            <Text
              style={{
                fontWeight: '600',
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
                  fontWeight: '600',
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
