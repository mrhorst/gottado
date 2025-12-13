import { useSections } from '@/context/section/SectionContext'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import styles from '@/app/styles'
import { useNavigation } from '@react-navigation/native'
import { Input } from '@/components/ui/Input'
import { colors, typography } from '@/styles/theme'

const localStyles = StyleSheet.create({
  primaryButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  primaryButtonText: {
    ...typography.button,
    color: '#fff',
  },

  disabledButton: {
    backgroundColor: '#e5e5ea',
  },
  disabledButtonText: {
    color: '#8e8e93',
  },
})

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

  const isValid = name.length > 3
  return (
    <View style={styles.screenContainer}>
      <View style={{ marginTop: 20 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create new section</Text>
        </View>
        <Input
          placeholder='Section Name'
          value={name}
          onChangeText={(name: string) => setName(name)}
        />
        <Pressable
          style={[
            localStyles.primaryButton,
            !isValid && localStyles.disabledButton,
          ]}
          onPress={() => handleAddSection(name)}
        >
          <Text
            style={[
              localStyles.primaryButtonText,
              !isValid && localStyles.disabledButtonText,
            ]}
          >
            Create Section
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
export default NewSectionScreen
