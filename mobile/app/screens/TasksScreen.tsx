import { Button, Pressable, Text, View } from 'react-native'
import { useAuth } from '../context/auth/AuthContext'
import styles from './styles'
import { useLoggedUser } from '../context/user/UserContext'
import { getTasks, setTaskCompleted, UserTasks } from '../services/userService'
import { useNavigate } from 'react-router-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
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

  const completeTask = (t: UserTasks) => {
    mutation.mutate({ id: t.id, complete: !t.complete })
  }

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <View style={styles.headerContainer}>
        <Button title='Back' onPress={() => nav(-1)}></Button>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{user?.name}</Text>
        <Button title='Logout' onPress={logout} />
      </View>
      <View style={styles.tasksContainer}>
        {tasks.length === 0 ? (
          <Text style={styles.header}>You have 0 tasks!</Text>
        ) : (
          sortedTasks.map((t) => (
            <View style={styles.taskCard} key={t.id}>
              <Text
                style={{
                  fontWeight: '600',
                  textDecorationLine: t.complete ? 'line-through' : 'none',
                }}
              >
                {t.title}
              </Text>
              <Pressable onPress={() => completeTask(t)}>
                <View style={styles.completeTaskToggle}></View>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
export default TasksScreen
