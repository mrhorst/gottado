import { Button, Pressable, Text, View } from 'react-native'
import { useAuth } from '../context/auth/AuthContext'
import styles from './styles'
import { useLoggedUser } from '../context/user/UserContext'
import { getTasks, setTaskCompleted, UserTasks } from '../services/userService'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-native'

const TasksScreen = () => {
  const { logout } = useAuth()
  const { user } = useLoggedUser()
  const [tasks, setTasks] = useState<UserTasks[] | []>([])
  const nav = useNavigate()

  useEffect(() => {
    const loadTasks = async () => {
      const userTasks = await getTasks()
      setTasks(userTasks)
    }
    loadTasks()
  }, [user])

  const completeTask = async (task: UserTasks) => {
    const updated = await setTaskCompleted(task)

    setTasks((prev) =>
      prev.map((t) => (t.id === updated[0].id ? updated[0] : t))
    )
  }

  return (
    <View style={{ padding: 16 }}>
      <View style={styles.tasksScreenHeader}>
        <Button title='Dashboard' onPress={() => nav('/dashboard')}></Button>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{user?.name}</Text>
        <Button title='Logout' onPress={logout} />
      </View>

      <Text style={styles.header}>Tasks</Text>
      <View style={styles.tasksContainer}>
        {tasks.length === 0 ? (
          <Text style={styles.header}>You have 0 tasks!</Text>
        ) : (
          tasks.map((t) => (
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
