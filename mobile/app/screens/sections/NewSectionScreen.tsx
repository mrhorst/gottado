import { useSections } from '@/app/context/section/SectionContext'
import { useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import styles from '../styles'
import { useNavigation } from '@react-navigation/native'

const NewSectionScreen = () => {
  const [name, setName] = useState('')
  const { addSection } = useSections()
  const navigation = useNavigation()

  const handleAddSection = (name: string) => {
    addSection(name, {
      onSuccess: () => {
        navigation.goBack()
      },
      onError: (error: unknown) => {
        console.error(error)
      },
    })
    setName('')
  }
  return (
    <View style={styles.screenContainer}>
      <View style={{ marginTop: 20 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Create a new section</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder='Section Name'
          value={name}
          onChangeText={(name) => setName(name)}
        ></TextInput>
        <Button title={'Button'} onPress={() => handleAddSection(name)} />
      </View>
    </View>
  )
}
export default NewSectionScreen
