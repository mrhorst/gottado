import { Text, View } from 'react-native'
import { useLoggedUser } from '@/context/user/UserContext'
import styles from '../styles'
import { Stack } from 'expo-router'
import NavigationHeader from '@/components/ui/NavigationHeader'

const ProfileScreen = () => {
  const { user } = useLoggedUser()

  if (!user) return null

  const date = new Date(user.iat * 1000).toLocaleString()

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <NavigationHeader secondaryBtn='logout' />
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
