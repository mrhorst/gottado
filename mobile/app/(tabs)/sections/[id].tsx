import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {
  MembershipRoles,
  SectionMembers,
  SectionNonMembers,
  useMembershipQuery,
} from '@/hooks/useMembershipQuery'
import { useMembershipMutation } from '@/hooks/useMembershipMutation'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors, spacing } from '@/styles/theme'
import { Ionicons } from '@expo/vector-icons'

const ROLES: MembershipRoles[] = ['editor', 'viewer']

const getRoleBadgeStyle = (role: string) => {
  switch (role) {
    case 'owner':
      return { bg: '#1c1c1e', text: '#fff' }
    case 'editor':
      return { bg: colors.primary + '18', text: colors.primary }
    case 'viewer':
      return { bg: '#e5e5ea', text: '#666' }
    default:
      return { bg: '#e5e5ea', text: '#666' }
  }
}

const SectionDetailScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const sectionId = Number(id)

  const { sectionMembersResponse, isLoading, isError } = useMembershipQuery()
  const { unsubscribeMember, updateMember } = useMembershipMutation()

  const [editingUser, setEditingUser] = useState<SectionMembers | null>(null)

  const handleUpdateRole = (role: MembershipRoles) => {
    if (!editingUser) return
    updateMember({ userId: editingUser.userId, sectionId, role })
    setEditingUser(null)
  }

  const handleRemoveMember = () => {
    if (!editingUser) return
    const name = editingUser.name
    const doRemove = () => {
      unsubscribeMember({ sectionId, userId: editingUser.userId })
      setEditingUser(null)
    }
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${name} from this section?`)) doRemove()
    } else {
      Alert.alert('Remove Member', `Remove ${name} from this section?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: doRemove },
      ])
    }
  }

  const groupedMembers = useMemo(() => {
    if (!sectionMembersResponse) return []
    const result = []
    const members = sectionMembersResponse.members || []
    const nonMembers = sectionMembersResponse.nonMembers || []
    if (members.length > 0) {
      result.push({ title: 'Members', data: members })
    }
    if (nonMembers.length > 0) {
      result.push({ title: 'Not Assigned', data: nonMembers })
    }
    return result
  }, [sectionMembersResponse])

  if (isLoading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  if (isError) {
    router.navigate('/(tabs)/sections')
    return null
  }

  return (
    <View style={s.container}>
      <SectionList<SectionMembers | SectionNonMembers>
        sections={groupedMembers}
        keyExtractor={(item) =>
          'userId' in item ? `m-${item.userId}` : `nm-${item.id}`
        }
        stickySectionHeadersEnabled
        ListHeaderComponent={
          editingUser ? (
            <EditMemberPanel
              user={editingUser}
              onChangeRole={handleUpdateRole}
              onRemove={handleRemoveMember}
              onCancel={() => setEditingUser(null)}
            />
          ) : null
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={s.sectionHeader}>
            <Text style={s.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isMember = 'role' in item
          if (isMember) {
            const member = item as SectionMembers
            const isOwner = member.role === 'owner'
            const isEditing = editingUser?.userId === member.userId
            const badge = getRoleBadgeStyle(member.role)
            return (
              <Pressable
                style={[s.memberCard, isEditing && s.memberCardActive]}
                onPress={() => !isOwner && setEditingUser(member)}
                disabled={isOwner}
              >
                <View style={s.memberAvatar}>
                  <Text style={s.memberAvatarText}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={s.memberInfo}>
                  <Text style={s.memberName}>{member.name}</Text>
                  <View style={[s.roleBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[s.roleBadgeText, { color: badge.text }]}>
                      {member.role}
                    </Text>
                  </View>
                </View>
                {!isOwner && (
                  <Ionicons name='ellipsis-horizontal' size={20} color='#c7c7cc' />
                )}
              </Pressable>
            )
          }

          const nonMember = item as SectionNonMembers
          return <NonMemberRow user={nonMember} sectionId={sectionId} />
        }}
        ListFooterComponent={
          <View style={s.footerHint}>
            <Ionicons name='information-circle-outline' size={16} color='#c7c7cc' />
            <Text style={s.footerHintText}>
              Tap a member to change their role. Tap a non-member to assign them.
            </Text>
          </View>
        }
      />
    </View>
  )
}

const EditMemberPanel = ({
  user,
  onChangeRole,
  onRemove,
  onCancel,
}: {
  user: SectionMembers
  onChangeRole: (role: MembershipRoles) => void
  onRemove: () => void
  onCancel: () => void
}) => (
  <View style={s.editPanel}>
    <View style={s.editPanelHeader}>
      <View style={s.editPanelAvatar}>
        <Text style={s.editPanelAvatarText}>
          {user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.editPanelName}>{user.name}</Text>
        <Text style={s.editPanelSubtitle}>Change role or remove</Text>
      </View>
      <Pressable style={s.editPanelClose} onPress={onCancel}>
        <Ionicons name='close' size={20} color='#8e8e93' />
      </Pressable>
    </View>

    <Text style={s.editPanelLabel}>Role</Text>
    <View style={s.roleRow}>
      {ROLES.map((role) => {
        const isActive = user.role === role
        return (
          <Pressable
            key={role}
            style={[s.roleOption, isActive && s.roleOptionActive]}
            onPress={() => onChangeRole(role)}
          >
            <Text
              style={[s.roleOptionText, isActive && s.roleOptionTextActive]}
            >
              {role}
            </Text>
          </Pressable>
        )
      })}
    </View>

    <Pressable style={s.removeButton} onPress={onRemove}>
      <Ionicons name='person-remove-outline' size={16} color={colors.iOSred} />
      <Text style={s.removeButtonText}>Remove from section</Text>
    </Pressable>
  </View>
)

const NonMemberRow = ({
  user,
  sectionId,
}: {
  user: SectionNonMembers
  sectionId: number
}) => {
  const { subscribeMember } = useMembershipMutation()
  const [expanded, setExpanded] = useState(false)

  const handleAssign = (role: MembershipRoles) => {
    subscribeMember({ userId: user.id, sectionId, role })
    setExpanded(false)
  }

  return (
    <View>
      <Pressable
        style={s.memberCard}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={[s.memberAvatar, s.memberAvatarInactive]}>
          <Text style={[s.memberAvatarText, { color: '#8e8e93' }]}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={s.memberInfo}>
          <Text style={s.memberName}>{user.name}</Text>
          <Text style={s.memberEmail}>{user.email}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'add-circle-outline'}
          size={22}
          color={expanded ? '#8e8e93' : colors.primary}
        />
      </Pressable>

      {expanded && (
        <View style={s.assignPanel}>
          <View style={s.assignPanelHeader}>
            <Ionicons name='person-add-outline' size={16} color={colors.primary} />
            <Text style={s.assignPanelTitle}>
              Add {user.name.split(' ')[0]} to this section
            </Text>
          </View>
          <Text style={s.assignPanelLabel}>Choose a role:</Text>
          <View style={s.roleRow}>
            {ROLES.map((role) => (
              <Pressable
                key={role}
                style={s.assignRoleCard}
                onPress={() => handleAssign(role)}
              >
                <View style={s.assignRoleIconWrap}>
                  <Ionicons
                    name={role === 'editor' ? 'create-outline' : 'eye-outline'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={s.assignRoleTitle}>{role}</Text>
                <Text style={s.assignRoleDesc}>
                  {role === 'editor'
                    ? 'Can create and edit tasks'
                    : 'Can view tasks only'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={s.assignCancelBtn}
            onPress={() => setExpanded(false)}
          >
            <Text style={s.assignCancelText}>Cancel</Text>
          </Pressable>
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
  sectionHeader: {
    backgroundColor: '#f2f2f7',
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    gap: 12,
  },
  memberCardActive: {
    backgroundColor: colors.primary + '08',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarInactive: {
    backgroundColor: '#e5e5ea',
  },
  memberAvatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  memberEmail: {
    fontSize: 13,
    color: '#8e8e93',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Edit panel (replaces modal)
  editPanel: {
    backgroundColor: '#fff',
    margin: spacing.md,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  editPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  editPanelAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPanelAvatarText: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.primary,
  },
  editPanelName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  editPanelSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  editPanelClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPanelLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#8e8e93',
  },
  roleOptionTextActive: {
    color: colors.primary,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.iOSred,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.iOSred,
  },

  // Assign panel for non-members
  assignPanel: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  assignPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  assignPanelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  assignPanelLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  assignRoleCard: {
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
  assignRoleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignRoleTitle: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: colors.primary,
  },
  assignRoleDesc: {
    fontSize: 11,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 14,
  },
  assignCancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: spacing.sm,
  },
  assignCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8e8e93',
  },

  footerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  footerHintText: {
    fontSize: 13,
    color: '#c7c7cc',
    flex: 1,
    lineHeight: 18,
  },
})

export default SectionDetailScreen
