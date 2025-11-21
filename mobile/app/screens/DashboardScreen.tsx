import { Button, Text, View } from 'react-native'
import styles from './styles'
import { useLoggedUser } from '../context/user/UserContext'
import { Link } from 'react-router-native'
import { useAuth } from '../context/auth/AuthContext'

const DashboardScreen = () => {
  const { user } = useLoggedUser()
  const { logout } = useAuth()

  return (
    <View style={{ padding: 10, marginTop: 20 }}>
      <View>
        <Text style={styles.header}>Welcome, {user?.name}!</Text>
      </View>
      <View style={{ marginBottom: 30 }}>
        <Text style={{ textAlign: 'center' }}>
          You currently have X tasks pending.
        </Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.dashboardButtonContainer}>
          <Link style={styles.dashboardButton} to={'/tasks'}>
            <Text style={styles.dashboardButtonText}>Tasks</Text>
          </Link>
          <Link style={styles.dashboardButton} to={'/tasks'}>
            <Text style={styles.dashboardButtonText}>Tasks</Text>
          </Link>
        </View>
        <View style={styles.dashboardButtonContainer}>
          <Link style={styles.dashboardButton} to={'/tasks'}>
            <Text style={styles.dashboardButtonText}>Tasks</Text>
          </Link>
          <Link style={styles.dashboardButton} to={'/tasks'}>
            <Text style={styles.dashboardButtonText}>Tasks</Text>
          </Link>
        </View>
      </View>
      <Button title='Logout' onPress={logout}></Button>
    </View>
  )
}
export default DashboardScreen
