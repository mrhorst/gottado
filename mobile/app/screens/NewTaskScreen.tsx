import {
  Button,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import styles from './styles'
import { Stack } from 'expo-router'
import { createNewTask } from '../services/taskService'
import { useState } from 'react'
import { useLoggedUser } from '../context/user/UserContext'
import { useNavigate } from 'react-router-native'
import NavigationHeader from '../components/ui/NavigationHeader'
import { Section, useSections } from '../context/section/SectionContext'

const NewTaskScreen = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const { user } = useLoggedUser()
  const { sections } = useSections()
  const nav = useNavigate()

  if (!user) return null

  const createTask = async () => {
    if (!title || title === '') {
      throw new Error('title must be present')
    }
    if (!selectedSection) throw new Error('Section cannot be null')

    createNewTask(title, description, selectedSection.id, user?.sub)
    nav(-1)
  }

  const handleSelectSection = (item: Section) => {
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
      <NavigationHeader />
      <View style={{ marginTop: 20 }}>
        <View style={{ marginBottom: 50 }}>
          <TextInput
            style={styles.input}
            placeholder='Title'
            value={title}
            onChangeText={(title) => setTitle(title)}
          ></TextInput>
          <TextInput
            style={styles.input}
            placeholder='Description'
            value={description}
            onChangeText={(description) => setDescription(description)}
          ></TextInput>
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
        <Button title='Create task' onPress={createTask} />
      </View>
    </View>
  )
}
export default NewTaskScreen
