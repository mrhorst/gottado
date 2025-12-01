import { Button, FlatList, Text, TextInput, View } from 'react-native'
import styles from './styles'
import { Stack } from 'expo-router'
import NavigationHeader from '../components/ui/NavigationHeader'
import { useState } from 'react'
import { createSection } from '../services/sectionService'
import { useLoggedUser } from '../context/user/UserContext'
import { useSections } from '../context/section/SectionContext'

const SectionsScreen = () => {
  const [name, setName] = useState('')
  const { user } = useLoggedUser()
  const { sections, isLoading } = useSections()

  if (isLoading) return <Text>Loading...</Text>

  console.log(sections)

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
          data={sections}
          renderItem={({ item }) => <Text>{item.name}</Text>}
        ></FlatList>
      </View>
    </View>
  )
}
export default SectionsScreen
