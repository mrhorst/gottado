import { Button, Text, TextInput, View } from 'react-native'
import styles from './styles'
import { Stack } from 'expo-router'
import { createNewTask } from '../services/userService'
import { useState } from 'react'
import { useLoggedUser } from '../context/user/UserContext'
import { useNavigate } from 'react-router-native'
import { useAuth } from '../context/auth/AuthContext'

const NewTaskScreen = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const { user } = useLoggedUser()
  const nav = useNavigate()
  const { logout } = useAuth()

  if (!user) return null

  const createTask = async () => {
    if (!title || title === '') {
      throw new Error('title must be present')
    }

    createNewTask(title, description, date, user?.sub)
    nav(-1)
  }
  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Create Task' }} />
      <View style={styles.headerContainer}>
        <Button title='Back' onPress={() => nav(-1)}></Button>
        <Button title='Logout' onPress={logout} />
      </View>
      <View style={{ marginTop: 20 }}>
        <TextInput
          style={styles.input}
          placeholder='Title'
          value={title}
          onChangeText={(title) => setTitle(title)}
        ></TextInput>
        <TextInput
          style={styles.input}
          placeholder='Description'
          value={description}
          onChangeText={(description) => setDescription(description)}
        ></TextInput>
        <TextInput
          style={styles.input}
          placeholder='Date'
          // value={date}
          // onChangeText={(date) => setDate(date)}
        ></TextInput>
        <Button title='Create task' onPress={createTask} />
      </View>
    </View>
  )
}
export default NewTaskScreen
