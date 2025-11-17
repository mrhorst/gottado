import { Button, Text, View } from 'react-native'
import { useAuth } from '../auth/AuthContext'
import styles from './styles'

const TasksScreen = () => {
  const { logout } = useAuth()

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.header}>Tasks</Text>
      <Button title='Logout' onPress={logout} />
    </View>
  )
}
export default TasksScreen
