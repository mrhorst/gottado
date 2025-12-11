import { useSections } from '@/context/section/SectionContext'
import { useState } from 'react'
import { Button, Text, View } from 'react-native'
import styles from '@/app/styles'
import { useNavigation } from '@react-navigation/native'
import { Input } from '@/components/ui/Input'

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
          <Text style={styles.headerText}>Create a new section</Text>
        </View>
        <Input
          style={styles.input}
          placeholder='Section Name'
          value={name}
          onChangeText={(name: string) => setName(name)}
        />
        <Button title={'Button'} onPress={() => handleAddSection(name)} />
      </View>
    </View>
  )
}
export default NewSectionScreen
