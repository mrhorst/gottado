import { Button, FlatList, Text, TextInput, View } from 'react-native'
import styles from './styles'
import { Stack } from 'expo-router'
import NavigationHeader from '../components/ui/NavigationHeader'
import { useState } from 'react'
import { createSection } from '../services/sectionService'
import { useLoggedUser } from '../context/user/UserContext'

const SectionsScreen = () => {
  const [name, setName] = useState('')
  const { user } = useLoggedUser()
  // const {sections} = useSections()

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Sections' }} />
      <NavigationHeader />
      <View style={{ marginTop: 20 }}>
        <TextInput
          style={styles.input}
          placeholder='Section Name'
          value={name}
          onChangeText={(name) => setName(name)}
        ></TextInput>
        <Button
          title='Create task'
          onPress={() => createSection(name, Number(user?.sub))}
        />
      </View>
      <View style={[{ marginTop: 20 }, styles.tasksContainer]}>
        <Text style={{ fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
          Sections created by you
        </Text>
        <FlatList
          data={[1, 2]}
          renderItem={({ item }) => <Text>{item}</Text>}
        ></FlatList>
      </View>
    </View>
  )
}
export default SectionsScreen
