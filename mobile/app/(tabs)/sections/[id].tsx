import { useMemo, useState } from 'react'
import {
  Button,
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {
  MembershipRoles,
  SectionMembers,
  SectionNonMembers,
  useMembershipQuery,
} from '@/hooks/useMembershipQuery'
import { useSectionQuery } from '@/hooks/useSectionQuery'

import { useMembershipMutation } from '@/hooks/useMembershipMutation'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { colors, spacing } from '@/styles/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 20,
  },

  roleButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 500,
  },

  sectionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    backgroundColor: colors.background,
  },

  sectionHeader: {
    backgroundColor: '#f2f2f7',
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  personName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
})

const SectionDetailScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const sectionId = Number(id)

  const { sections } = useSectionQuery()
  const { sectionMembersResponse, isLoading, isError } = useMembershipQuery()
  const { unsubscribeMember, updateMember } = useMembershipMutation()

  const section = sections?.find((s) => s.id === sectionId)

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

  const groupedMembers = useMemo(() => {
    if (!sectionMembersResponse) return []

    const groups = {
      members: [] as SectionMembers[],
      nonMembers: [] as SectionNonMembers[],
    }

    const members = sectionMembersResponse.members || []
    const nonMembers = sectionMembersResponse.nonMembers || []

    members.forEach((member) => groups['members'].push(member))

    nonMembers.forEach((person) => groups['nonMembers'].push(person))

    const result = []

    if (groups.members.length > 0) {
      result.push({ title: 'Subscribed', data: groups.members })
    }

    if (groups.nonMembers.length >= 0) {
      result.push({ title: 'Not Subscribed', data: groups.nonMembers })
    }

    return result
  }, [sectionMembersResponse])

  if (isLoading) return <Text>Loading...</Text>

  if (isError) {
    router.navigate('/(tabs)/sections')
  }

  return (
    <View style={styles.container}>
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

      <SectionList<SectionMembers | SectionNonMembers>
        sections={groupedMembers}
        keyExtractor={(item) => {
          if ('userId' in item) return item.userId.toString()
          return item.id.toString()
        }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isMember = 'role' in item
          return (
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              onPress={() =>
                isMember ? setSelectedUser(item as SectionMembers) : null
              }
            >
              <View style={styles.sectionCard}>
                <Text style={styles.personName}>
                  {item.name} {isMember ? `(${item.role})` : null}{' '}
                  {/* need to add a badge ! */}
                </Text>
              </View>
            </Pressable>
          )
        }}
      />

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
  )
}
export default SectionDetailScreen
