import { useAuth } from '@/app/context/auth/AuthContext'
import styles from '@/app/screens/styles'
import { Button, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

interface Props {
  secondaryBtn: 'logout' | 'newSection' | 'newTask'
}

const NavigationHeader = ({ secondaryBtn }: Props) => {
  const navigation = useNavigation<any>()
  const { logout } = useAuth()
  return (
    <View style={styles.navigationContainer}>
      <Button title='Back' onPress={() => navigation.goBack()}></Button>
      {secondaryBtn === 'logout' ? (
        <Button title='Logout' onPress={logout} />
      ) : secondaryBtn === 'newSection' ? (
        <Button
          title='New Section'
          onPress={() => navigation.navigate('NewSection')}
        ></Button>
      ) : (
        <Button
          title='New Task'
          onPress={() => navigation.navigate('NewTask')}
        ></Button>
      )}
    </View>
  )
}

export default NavigationHeader
