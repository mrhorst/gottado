import { Button, Text, View } from 'react-native'
import { useNavigate } from 'react-router-native'
import { useLoggedUser } from '../context/user/UserContext'
import { useAuth } from '../context/auth/AuthContext'
import styles from './styles'
import { Stack } from 'expo-router'

const ProfileScreen = () => {
  const nav = useNavigate()
  const { user } = useLoggedUser()
  const { logout } = useAuth()

  if (!user) return null

  const date = new Date(user.iat * 1000).toLocaleString()

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <View style={styles.headerContainer}>
        <Button title='Back' onPress={() => nav(-1)}></Button>
        <Button title='Logout' onPress={logout} />
      </View>
      <View style={{ marginTop: 50, gap: 30 }}>
        <View style={{ flexDirection: 'row', gap: 30 }}>
          <Text style={{ fontWeight: 600, flex: 1 }}>Name:</Text>
          <Text>{user.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 30 }}>
          <Text style={{ fontWeight: 600, flex: 1 }}>Email:</Text>
          <Text>{user.email}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 30 }}>
          <Text style={{ fontWeight: 600, flex: 1 }}>Last login:</Text>
          <Text>{date}</Text>
        </View>
      </View>
    </View>
  )
}
export default ProfileScreen
