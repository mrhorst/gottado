import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { useLoggedUser } from '@/context/user/UserContext'
import { SectionProps, useSections } from '@/context/section/SectionContext'
import { useNavigation } from '@react-navigation/native'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { Input } from '@/components/ui/Input'
import { colors, spacing, typography } from '@/styles/theme'

const styles = StyleSheet.create({
  selectorTrigger: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: spacing.md,
    color: colors.text,
  },
  placeholderText: {
    fontSize: spacing.md,
    color: colors.border,
  },
  screenContainer: {
    flex: 1,
    padding: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeading: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 600,
    marginBottom: 20,
  },

  sectionsButtonContainer: {
    gap: 10,
    marginVertical: 20,
  },
  sectionButton: {
    paddingVertical: 15,
    borderBottomColor: '#e5e5ea',
    borderBottomWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  sectionButtonText: {
    fontSize: 16,
    fontWeight: 600,
  },
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

  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 5,
  },
  cancelButton: {
    paddingVertical: 15,
    marginTop: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: 600,
  },
})

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

  const isValid = title.length > 5 && selectedSection !== null

  return (
    <View style={styles.screenContainer}>
      <Modal
        animationType='fade'
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>
              Select the section for this task
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
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
            </ScrollView>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Stack.Screen options={{ title: 'Create Task' }} />
      <View style={{ marginTop: 20 }}>
        <View style={{ marginBottom: 50 }}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <Input
              placeholder='Title'
              value={title}
              onChangeText={(title: string) => setTitle(title)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <Input
              placeholder='Description'
              value={description}
              onChangeText={(description: string) =>
                setDescription(description)
              }
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Section</Text>
            <Pressable
              style={styles.selectorTrigger}
              onPress={() => setIsModalVisible(true)}
            >
              <Text
                style={
                  selectedSection ? styles.selectorText : styles.placeholderText
                }
              >
                {selectedSection ? selectedSection.name : 'Select a section...'}
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }}>▼</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          disabled={!isValid}
          onPress={createNewTask}
          style={[styles.primaryButton, !isValid && styles.disabledButton]}
        >
          <Text
            style={[
              styles.primaryButtonText,
              !isValid && styles.disabledButtonText,
            ]}
          >
            Create Task
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
export default NewTaskScreen
