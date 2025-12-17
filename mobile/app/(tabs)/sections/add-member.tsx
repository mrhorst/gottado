import { useSectionQuery } from '@/hooks/useSectionQuery'
import {
  MembershipRoles,
  SectionNonMembers,
  useMembershipQuery,
} from '@/hooks/useMembershipQuery'
import {
  Button,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import styles from '@/app/styles'
import { useState } from 'react'
import { useMembershipMutation } from '@/hooks/useMembershipMutation'
import { Input } from '@/components/ui/Input'
import { useLocalSearchParams, useRouter } from 'expo-router'

const AddSectionMemberScreen = () => {
  const { id } = useLocalSearchParams()
  const sectionId = Number(id)
  const router = useRouter()

  const { sections } = useSectionQuery()
  const { sectionMembersResponse, isLoading } = useMembershipQuery()
  const { subscribeMember } = useMembershipMutation()
  const section = sections?.find((s) => s.id.toString() === id)

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

  const handleRoleChange = async (role: MembershipRoles) => {
    if (!selectedUser) return

    subscribeMember({ userId: selectedUser.id, sectionId, role })

    setSelectedUser(null)
    router.back()
  }
  const ROLES: MembershipRoles[] = ['editor', 'viewer']

  return (
    <View style={styles.screenContainer}>
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
          <Input
            placeholder='non member name...'
            value={searchName}
            onChangeText={(name: string) => setSearchName(name)}
          />
          <FlatList data={dataToDisplay} renderItem={_renderItem} />
        </View>
      </View>
    </View>
  )
}
export default AddSectionMemberScreen
