import { useAuth } from '@/app/context/auth/AuthContext'
import styles from '@/app/screens/styles'
import { Button, View } from 'react-native'
import { useNavigate } from 'react-router-native'

const NavigationHeader = () => {
  const nav = useNavigate()
  const { logout } = useAuth()
  return (
    <View style={styles.headerContainer}>
      <Button title='Back' onPress={() => nav(-1)}></Button>
      <Button title='Logout' onPress={logout} />
    </View>
  )
}

export default NavigationHeader
