import { Button, Text, View } from 'react-native'
import styles from './styles'
import { Stack } from 'expo-router'
import NavigationHeader from '../components/ui/NavigationHeader'

const SectionsScreen = () => {
  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Sections' }} />
      <NavigationHeader />
    </View>
  )
}
export default SectionsScreen
