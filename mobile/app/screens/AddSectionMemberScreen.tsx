import { useParams } from 'react-router-native'
import { useSectionQuery } from '../hooks/useSectionQuery'
import {
  SectionNonMembers,
  useSectionMembersQuery,
} from '../hooks/useSectionMembersQuery'
import {
  Button,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import NavigationHeader from '../components/ui/NavigationHeader'
import styles from './styles'
import { useState } from 'react'
import { addMember } from '../services/sectionService'

const AddSectionMemberScreen = () => {
  const { id } = useParams()
  const sectionId = Number(id)

  const { sections } = useSectionQuery()
  const { sectionMembersResponse, isLoading } = useSectionMembersQuery()
  const section = sections?.find((s) => s.id === sectionId)

  const nonSectionMembers = sectionMembersResponse?.nonMembers

  const [searchName, setSearchName] = useState('')
  const [selectedUser, setSelectedUser] = useState<SectionNonMembers | null>(
    null
  )

  if (isLoading) return <Text>Loading...</Text>

  const _renderItem = ({ item }: { item: SectionNonMembers }) => {
    return (
      <Pressable onPress={() => setSelectedUser(item)}>
        <Text style={{ fontSize: 18 }}>
          {item.name} ({item.email})
        </Text>
      </Pressable>
    )
  }

  const dataToDisplay = nonSectionMembers?.filter((m) =>
    m.name.toLowerCase().includes(searchName.toLowerCase())
  )
  const ROLES = ['editor', 'viewer']

  // type enum for safety?
  const handleRoleChange = async (role: string) => {
    if (!selectedUser) return

    await addMember(selectedUser.id, sectionId, role)

    console.log(
      `User: ${selectedUser?.name}\nSection Id: ${sectionId} \nRole: ${role}`
    )
    setSelectedUser(null)
  }

  return (
    <View>
      <NavigationHeader />
      <Modal
        animationType='fade'
        transparent
        visible={!!selectedUser}
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 20, marginBottom: 15 }}>
              Add {selectedUser?.name}?
            </Text>
            <Text style={{ fontSize: 18 }}>Select a role:</Text>
            <View style={styles.roleContainer}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.roleButton}
                  onPress={() => handleRoleChange(r)}
                >
                  <Text style={styles.roleText}>{r.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title={'Cancel'}
              color={'red'}
              onPress={() => setSelectedUser(null)}
            />
          </View>
        </View>
      </Modal>
      <View>
        <Text style={{ fontWeight: 600, fontSize: 20, textAlign: 'center' }}>
          Section: {section?.name}
        </Text>
      </View>
      <View>
        <View style={{ marginTop: 20, padding: 20, gap: 30 }}>
          <TextInput
            placeholder='non member name...'
            style={styles.input}
            value={searchName}
            onChangeText={(name) => setSearchName(name)}
          />
          <FlatList data={dataToDisplay} renderItem={_renderItem} />
        </View>
      </View>
    </View>
  )
}
export default AddSectionMemberScreen
