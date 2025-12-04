import {
  Button,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import NavigationHeader from '../components/ui/NavigationHeader'
import { useNavigate, useParams } from 'react-router-native'
import { useSectionQuery } from '../hooks/useSectionQuery'
import {
  SectionMembers,
  useSectionMembersQuery,
} from '../hooks/useSectionMembersQuery'
import { useState } from 'react'
import styles from './styles'

const SectionScreen = () => {
  const { id } = useParams()
  const sectionId = Number(id)
  const nav = useNavigate()

  const { sections } = useSectionQuery()
  const { sectionMembersResponse, isLoading, updateMemberRole } =
    useSectionMembersQuery()

  const section = sections?.find((s) => s.id === sectionId)

  const sectionMembers = sectionMembersResponse?.members

  const [selectedUser, setSelectedUser] = useState<SectionMembers | null>(null)

  const ROLES = ['editor', 'viewer']

  const handleUpdateMember = (role: string) => {
    if (!selectedUser) return
    updateMemberRole.mutate({ userId: selectedUser.userId, sectionId, role })
    setSelectedUser(null)
  }

  if (isLoading) return <Text>Loading...</Text>

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
              Edit {selectedUser?.name}?
            </Text>
            <Text style={{ fontSize: 18 }}>Select a role:</Text>
            <View style={styles.roleContainer}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.roleButton}
                  onPress={() => handleUpdateMember(r)}
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
          {section?.name}
        </Text>
      </View>
      <View>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 600, fontSize: 20, textAlign: 'center' }}>
            Users subscribed
          </Text>

          <FlatList
            style={{ margin: 10 }}
            data={sectionMembers}
            renderItem={({ item }) => (
              <Pressable
                style={{
                  borderWidth: 1,
                  padding: 5,
                  borderRadius: 10,
                  marginBottom: 10,
                  backgroundColor: '#a4a4cc',
                }}
                onPress={() => setSelectedUser(item)}
              >
                <Text style={{ fontWeight: 600, fontSize: 16, padding: 10 }}>
                  {item.name} ({item.role})
                </Text>
              </Pressable>
            )}
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <Button
            title='Add Member'
            onPress={() => nav(`/sections/${id}/add-member`)}
          />
        </View>
      </View>
    </View>
  )
}
export default SectionScreen
