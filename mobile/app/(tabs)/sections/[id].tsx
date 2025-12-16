import { useState } from 'react'
import {
  Button,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {
  MembershipRoles,
  SectionMembers,
  useMembershipQuery,
} from '@/hooks/useMembershipQuery'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import styles from '../../styles'
import { useMembershipMutation } from '@/hooks/useMembershipMutation'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'

const SectionDetailScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const sectionId = Number(id)

  const { sections } = useSectionQuery()
  const { sectionMembersResponse, isLoading, isError } = useMembershipQuery()
  const { unsubscribeMember, updateMember } = useMembershipMutation()

  const section = sections?.find((s) => s.id === sectionId)

  const sectionMembers = sectionMembersResponse?.members

  const [selectedUser, setSelectedUser] = useState<SectionMembers | null>(null)

  const ROLES: MembershipRoles[] = ['editor', 'viewer']

  const handleUpdateMember = (role: MembershipRoles) => {
    if (!selectedUser) return
    updateMember({ userId: selectedUser.userId, sectionId, role })
    setSelectedUser(null)
  }

  const handleUnsubscribeUser = () => {
    if (!selectedUser) return
    unsubscribeMember({ sectionId, userId: selectedUser.userId })
    setSelectedUser(null)
  }

  if (isLoading) return <Text>Loading...</Text>

  if (isError) {
    router.navigate('/(tabs)/sections')
  }

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: section?.name }} />
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
              <View style={{ backgroundColor: 'rgba(255,0,0,0.5)' }}>
                <TouchableOpacity
                  style={[styles.roleButton]}
                  onPress={() => handleUnsubscribeUser()}
                >
                  <Text style={[styles.roleText, ,]}>
                    {'remove'.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
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
                  marginBottom: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#e5e5ea',
                  paddingVertical: 15,
                  width: '100%',
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
            onPress={() =>
              router.push({
                pathname: '/sections/add-member',
                params: { id: sectionId },
              })
            }
          />
        </View>
      </View>
    </View>
  )
}
export default SectionDetailScreen
