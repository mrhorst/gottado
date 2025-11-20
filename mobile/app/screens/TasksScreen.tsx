import { Button, Pressable, Text, View } from 'react-native'
import { useAuth } from '../context/auth/AuthContext'
import styles from './styles'
import { useLoggedUser } from '../context/user/UserContext'
import { getTasks, setTaskCompleted, UserTasks } from '../services/userService'
import { useEffect, useState } from 'react'

const TasksScreen = () => {
  const { logout } = useAuth()
  const { user } = useLoggedUser()
  const [tasks, setTasks] = useState<UserTasks[] | []>([])

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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: '700' }}>{user?.email}</Text>
        <Button title='Logout' onPress={logout} />
      </View>

      <Text style={styles.header}>Tasks</Text>
      <View
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 10,
        }}
      >
        {tasks.map((t) => (
          <View
            style={{
              borderBottomWidth: 1,
              padding: 10,
              marginBottom: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            key={t.id}
          >
            <Text
              style={{
                fontWeight: '600',
                textDecorationLine: t.complete ? 'line-through' : 'none',
              }}
            >
              {t.title}
            </Text>
            <Pressable onPress={() => completeTask(t)}>
              <View
                style={{
                  borderWidth: 2,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderColor: '#888',
                }}
              ></View>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  )
}
export default TasksScreen
