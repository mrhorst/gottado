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
    <View style={styles.headerContainer}>
      <Button title='Back' onPress={() => navigation.goBack()}></Button>
      {secondaryBtn === 'logout' ? (
        <Button title='Logout' onPress={logout} />
      ) : secondaryBtn === 'newSection' ? (
        <Button
          title='New Section'
          onPress={() => navigation.navigate('SectionListScreen')}
        ></Button>
      ) : (
        <Button
          title='New Task'
          onPress={() => navigation.navigate('Tasks')}
        ></Button>
      )}
    </View>
  )
}

export default NavigationHeader
