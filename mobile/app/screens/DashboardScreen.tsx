import { Text, View } from 'react-native'
import styles from './styles'
import { useLoggedUser } from '../context/user/UserContext'

const DashboardScreen = () => {
  const { user } = useLoggedUser()
  return (
    <View style={{ padding: 10 }}>
      <Text style={styles.header}>Welcome, {user?.name}!</Text>
      <Text>You currently have X tasks pending.</Text>
    </View>
  )
}
export default DashboardScreen
