import {
  useMembershipQuery,
  MembershipRoles,
  SectionNonMembers,
} from '@/hooks/useMembershipQuery'
import { useMembershipMutation } from '@/hooks/useMembershipMutation'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors, spacing } from '@/styles/theme'
import { Ionicons } from '@expo/vector-icons'

const ROLES: MembershipRoles[] = ['editor', 'viewer']

const AddSectionMemberScreen = () => {
  const { id } = useLocalSearchParams()
  const sectionId = Number(id)
  const router = useRouter()

  const { sectionMembersResponse, isLoading } = useMembershipQuery()
  const { subscribeMember } = useMembershipMutation()

  const nonSectionMembers = sectionMembersResponse?.nonMembers ?? []

  const [searchName, setSearchName] = useState('')

  const filtered = nonSectionMembers.filter((m) =>
    m.name.toLowerCase().includes(searchName.toLowerCase())
  )

  const handleAssign = (user: SectionNonMembers, role: MembershipRoles) => {
    subscribeMember({ userId: user.id, sectionId, role })
    router.back()
  }

  if (isLoading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.searchBar}>
        <Ionicons name='search' size={18} color='#8e8e93' />
        <TextInput
          style={s.searchInput}
          value={searchName}
          onChangeText={setSearchName}
          placeholder='Search by name...'
          placeholderTextColor='#c7c7cc'
          autoFocus
        />
        {searchName.length > 0 && (
          <Pressable onPress={() => setSearchName('')}>
            <Ionicons name='close-circle' size={18} color='#c7c7cc' />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name='people-outline' size={40} color='#d1d1d6' />
            <Text style={s.emptyText}>
              {searchName
                ? 'No matching users found'
                : 'All organization members are already assigned'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <UserAssignCard user={item} onAssign={handleAssign} />
        )}
      />
    </View>
  )
}

const UserAssignCard = ({
  user,
  onAssign,
}: {
  user: SectionNonMembers
  onAssign: (user: SectionNonMembers, role: MembershipRoles) => void
}) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <View style={s.card}>
      <Pressable style={s.cardMain} onPress={() => setExpanded(!expanded)}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={s.userInfo}>
          <Text style={s.userName}>{user.name}</Text>
          <Text style={s.userEmail}>{user.email}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'add-circle-outline'}
          size={22}
          color={expanded ? '#8e8e93' : colors.primary}
        />
      </Pressable>

      {expanded && (
        <View style={s.rolePanel}>
          <View style={s.rolePanelHeader}>
            <Ionicons name='person-add-outline' size={14} color={colors.primary} />
            <Text style={s.rolePanelTitle}>
              Add {user.name.split(' ')[0]} as:
            </Text>
          </View>
          <View style={s.roleRow}>
            {ROLES.map((role) => (
              <Pressable
                key={role}
                style={s.roleCard}
                onPress={() => onAssign(user, role)}
              >
                <View style={s.roleCardIcon}>
                  <Ionicons
                    name={role === 'editor' ? 'create-outline' : 'eye-outline'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={s.roleCardTitle}>{role}</Text>
                <Text style={s.roleCardDesc}>
                  {role === 'editor'
                    ? 'Can create and edit tasks'
                    : 'Can view tasks only'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8e8e93',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: '#8e8e93',
  },
  rolePanel: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
    paddingTop: spacing.md,
  },
  rolePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  rolePanelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '06',
    gap: 6,
  },
  roleCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: colors.primary,
  },
  roleCardDesc: {
    fontSize: 11,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#c7c7cc',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
})

export default AddSectionMemberScreen
