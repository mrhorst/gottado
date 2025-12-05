import {
  Button,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import styles from './styles'
import { Stack } from 'expo-router'
import NavigationHeader from '../components/ui/NavigationHeader'
import { useState } from 'react'
import { useSections } from '../context/section/SectionContext'
import { useNavigate } from 'react-router-native'

const SectionsScreen = () => {
  const [name, setName] = useState('')
  const { sections, isLoading, addSection } = useSections()
  const nav = useNavigate()

  if (isLoading) return <Text>Loading...</Text>

  const handleAddSection = (name: string) => {
    addSection(name)
    setName('')
  }

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
        <Button title='Create section' onPress={() => handleAddSection(name)} />
      </View>
      <View style={[{ marginTop: 20 }, styles.tasksContainer]}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}>
            Sections
          </Text>
        </View>
        <FlatList
          data={sections}
          renderItem={({ item }) => (
            <Pressable onPress={() => nav(`/sections/${item.id}`)}>
              <Text style={{ fontSize: 18, fontWeight: 700, margin: 10 }}>
                {item.name} ({item.role})
              </Text>
            </Pressable>
          )}
        ></FlatList>
      </View>
    </View>
  )
}
export default SectionsScreen
