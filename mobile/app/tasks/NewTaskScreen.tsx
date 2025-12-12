import { Button, Modal, Text, TouchableOpacity, View } from 'react-native'
import styles from '@/app/styles'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { useLoggedUser } from '@/context/user/UserContext'

import NavigationHeader from '@/components/ui/NavigationHeader'
import { SectionProps, useSections } from '@/context/section/SectionContext'
import { useNavigation } from '@react-navigation/native'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { Input } from '@/components/ui/Input'

const NewTaskScreen = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSection, setSelectedSection] = useState<SectionProps | null>(
    null
  )
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const { user } = useLoggedUser()
  const { sections } = useSections()
  const navigation = useNavigation()

  const { createTask } = useTasksMutation()

  if (!user) return null

  const createNewTask = async () => {
    if (!title || title === '') {
      throw new Error('title must be present')
    }
    if (!selectedSection) throw new Error('Section cannot be null')

    createTask({
      title,
      description,
      sectionId: selectedSection.id,
      userId: user?.sub,
    })
    navigation.goBack()
  }

  const handleSelectSection = (item: SectionProps) => {
    setSelectedSection(item)
    setIsModalVisible(false)
  }

  return (
    <View style={styles.screenContainer}>
      <Modal
        animationType='fade'
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sectionModalContent}>
            <Text style={{ fontSize: 20, marginBottom: 15 }}>
              Select the section for this task
            </Text>
            <View style={styles.sectionsButtonContainer}>
              {sections?.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.sectionButton}
                  onPress={() => handleSelectSection(s)}
                >
                  <Text style={styles.sectionButtonText}>
                    {s.name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title={'Cancel'}
              color={'red'}
              onPress={() => setIsModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Stack.Screen options={{ title: 'Create Task' }} />
      <NavigationHeader secondaryBtn='newSection' />
      <View style={{ marginTop: 20 }}>
        <View style={{ marginBottom: 50 }}>
          <Input
            placeholder='Title'
            value={title}
            onChangeText={(title: string) => setTitle(title)}
          />
          <Input
            placeholder='Description'
            value={description}
            onChangeText={(description: string) => setDescription(description)}
          />
          <Button
            title='Tap to select a section'
            onPress={() => setIsModalVisible(true)}
          />
          {selectedSection ? (
            <Text style={[styles.sectionSummaryHeading, { marginTop: 30 }]}>
              {selectedSection.name}
            </Text>
          ) : (
            <Text style={styles.sectionSummaryHeading}>
              Please, select a section
            </Text>
          )}
        </View>
        <Button title='Create task' onPress={createNewTask} />
      </View>
    </View>
  )
}
export default NewTaskScreen
