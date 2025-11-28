import { Button, Text, View } from 'react-native'
import styles from './styles'
import { useNavigate } from 'react-router-native'
import { useAuth } from '../context/auth/AuthContext'
import { Stack } from 'expo-router'

const SectionsScreen = () => {
  const nav = useNavigate()
  const { logout } = useAuth()
  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Sections' }} />
      <View style={styles.headerContainer}>
        <Button title='Back' onPress={() => nav(-1)}></Button>
        <Button title='Logout' onPress={logout} />
      </View>
      <Text style={styles.header}>SectionsScreen</Text>
    </View>
  )
}
export default SectionsScreen
