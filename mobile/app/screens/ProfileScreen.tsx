import { Button, Text, View } from 'react-native'
import { useNavigate } from 'react-router-native'
import { useLoggedUser } from '../context/user/UserContext'
import { useAuth } from '../context/auth/AuthContext'
import styles from './styles'

const ProfileScreen = () => {
  const nav = useNavigate()
  const { user } = useLoggedUser()
  const { logout } = useAuth()
  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <Button title='Back' onPress={() => nav(-1)}></Button>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{user?.name}</Text>
        <Button title='Logout' onPress={logout} />
      </View>
    </View>
  )
}
export default ProfileScreen
