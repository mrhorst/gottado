import {
  ActivityIndicator,
  Alert,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { SectionProps } from '@/types/section'
import { useRouter } from 'expo-router'
import { colors, spacing, typography } from '@/styles/theme'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useCallback, useMemo, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { useSectionMutation } from '@/hooks/useSectionMutation'
import { Pressable } from 'react-native-gesture-handler'
import { SharedValue } from 'react-native-reanimated'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import ScreenMotion from '@/components/ui/ScreenMotion'

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

const SectionListScreen = () => {
  const { sections, archivedSections, isLoading, isError, error } =
    useSectionQuery()
  const { archiveSection, unarchiveSection, deleteSection, renameSection } =
    useSectionMutation()
  const { tasks } = useTasksQuery()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWide = width > 700

  const sectionTasksLength = useCallback(
    (item: SectionProps) =>
      tasks.filter((t) => t.sectionName === item.name).length,
    [tasks]
  )

  const isViewer = (item: SectionProps) => item.role === 'viewer'

  const canSeeSectionInfo = (item: SectionProps) => {
    if (isViewer(item)) {
      Alert.alert(
        'No Access',
        'You do not have permission to manage this area',
        []
      )
    } else {
      router.push(`/(tabs)/sections/${item.id}`)
    }
  }

  const groupedSections = useMemo(() => {
    if (!sections) return []
    const groups = {
      owner: [] as SectionProps[],
      editor: [] as SectionProps[],
      viewer: [] as SectionProps[],
      archived: [] as SectionProps[],
    }

    sections.forEach((section) => {
      const role = section.role
      if (groups[role]) {
        groups[role].push(section)
      }
    })

    archivedSections?.forEach((section) => {
      groups['archived'].push(section)
    })

    const sortByTasks = (list: SectionProps[]) =>
      list.sort((a, b) => sectionTasksLength(b) - sectionTasksLength(a))

    const result = []

    if (groups.owner.length > 0) {
      result.push({ title: 'My Areas', data: sortByTasks(groups.owner) })
    }
    if (groups.editor.length > 0) {
      result.push({ title: 'Shared with me', data: sortByTasks(groups.editor) })
    }
    if (groups.viewer.length > 0) {
      result.push({ title: 'Read Only', data: sortByTasks(groups.viewer) })
    }
    if (groups.archived.length > 0) {
      result.push({ title: 'Archived', data: groups.archived })
    }

    return result
  }, [sections, sectionTasksLength, archivedSections])

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.loadingContainer]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  if (isError) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.loadingContainer]}>
          <Text>Error: {error?.message}</Text>
        </View>
      </ScreenMotion>
    )
  }

  const onRename = (item: SectionProps) => {
    if (Platform.OS === 'web') {
      const newName = window.prompt('Rename area', item.name)
      if (newName && newName.trim() && newName.trim() !== item.name) {
        renameSection({ id: item.id, name: newName.trim() })
      }
    } else {
      Alert.prompt(
        'Rename Area',
        'Enter a new name',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: (newName) => {
              if (newName && newName.trim() && newName.trim() !== item.name) {
                renameSection({ id: item.id, name: newName.trim() })
              }
            },
          },
        ],
        'plain-text',
        item.name
      )
    }
  }

  const onArchive = (item: SectionProps) => {
    Alert.alert('Archive', `Would you like to archive area "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: () => archiveSection(item.id),
        style: 'default',
      },
    ])
  }

  const onUnarchive = (item: SectionProps) => {
    unarchiveSection(item.id)
  }

  const onDelete = (item: SectionProps) => {
    Alert.prompt(
      'DELETE',
      `You are about to delete area "${item.name}". This will also delete ALL tasks associated with this area. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE',
          onPress: () => deleteSection(item.id),
          style: 'destructive',
        },
      ],
      'default'
    )
  }

  return (
    <ScreenMotion>
      <View style={s.container}>
      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id.toString()}
        stickySectionHeadersEnabled
        contentContainerStyle={
          isWide
            ? { maxWidth: 800, alignSelf: 'center', width: '100%' }
            : undefined
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={s.sectionHeader}>
            <Text style={s.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({ item, section }) => (
          <SwipeableItem
            sectionTitle={section.title}
            onRename={() => onRename(item)}
            onArchive={() => onArchive(item)}
            onUnarchive={() => onUnarchive(item)}
            onDelete={() => onDelete(item)}
            enabled={!isViewer(item)}
            isOwner={item.role === 'owner'}
          >
            <Pressable onPress={() => canSeeSectionInfo(item)}>
              <View style={s.sectionCard}>
                <View style={s.cardLeft}>
                  <Text style={s.sectionName}>{item.name}</Text>
                  <View style={s.metaRow}>
                    {(() => {
                      const badge = getRoleBadgeStyle(item.role)
                      return (
                        <View
                          style={[s.roleBadge, { backgroundColor: badge.bg }]}
                        >
                          <Text
                            style={[s.roleBadgeText, { color: badge.text }]}
                          >
                            {item.role}
                          </Text>
                        </View>
                      )
                    })()}
                    <View style={s.taskCountPill}>
                      <Ionicons
                        name='document-text-outline'
                        size={13}
                        color='#8e8e93'
                      />
                      <Text style={s.taskCount}>
                        {sectionTasksLength(item)}
                      </Text>
                    </View>
                  </View>
                </View>
                {!isViewer(item) && (
                  <Ionicons name='chevron-forward' size={20} color='#c7c7cc' />
                )}
              </View>
            </Pressable>
          </SwipeableItem>
        )}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name='layers-outline' size={48} color='#d1d1d6' />
            <Text style={s.emptyText}>No sections yet</Text>
          </View>
        }
      />
      </View>
    </ScreenMotion>
  )
}

interface SwipeableItemProps {
  children: React.ReactNode
  sectionTitle: string
  onRename: () => void
  onArchive: () => void
  onUnarchive: () => void
  onDelete: () => void
  enabled?: boolean
  isOwner?: boolean
}

const SwipeActionButton = ({
  text,
  color,
  icon,
  onPress,
  width = 80,
}: {
  text: string
  color: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  width?: number
}) => (
  <Pressable
    onPress={onPress}
    style={[s.swipeBtn, { backgroundColor: color, width }]}
  >
    <Ionicons name={icon} size={24} color='white' />
    <Text style={s.swipeBtnText}>{text}</Text>
  </Pressable>
)

export const SwipeableItem = ({
  children,
  sectionTitle,
  onRename,
  onArchive,
  onUnarchive,
  onDelete,
  enabled = true,
  isOwner = false,
}: SwipeableItemProps) => {
  const swipeableRef =
    useRef<React.ComponentRef<typeof ReanimatedSwipeable>>(null)

  const close = () => swipeableRef.current?.close()

  const renderRightActions = useCallback(
    (prog: SharedValue<number>, drag: SharedValue<number>) => {
      if (sectionTitle === 'Archived') {
        return (
          <View style={s.archivedActionsWrapper}>
            <SwipeActionButton
              text='Restore'
              color='#007AFF'
              icon='arrow-undo'
              onPress={() => {
                close()
                onUnarchive()
              }}
            />
            <SwipeActionButton
              text='Delete'
              color='#ff3b30'
              icon='trash'
              onPress={() => {
                close()
                onDelete()
              }}
            />
          </View>
        )
      }
      return (
        <View style={isOwner ? s.ownerActionsWrapper : s.activeActionWrapper}>
          {isOwner && (
            <SwipeActionButton
              text='Rename'
              color={colors.primary}
              icon='create-outline'
              onPress={() => {
                close()
                onRename()
              }}
            />
          )}
          <SwipeActionButton
            text='Archive'
            color='#FF9500'
            icon='archive'
            onPress={() => {
              close()
              onArchive()
            }}
          />
        </View>
      )
    },
    [sectionTitle, onRename, onArchive, onUnarchive, onDelete, isOwner]
  )

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      enabled={enabled}
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      {children}
    </ReanimatedSwipeable>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  cardLeft: {
    flex: 1,
    gap: 6,
  },
  sectionName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  taskCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskCount: {
    fontSize: 13,
    color: '#8e8e93',
  },
  swipeBtn: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  archivedActionsWrapper: {
    width: 160,
    flexDirection: 'row',
  },
  activeActionWrapper: {
    width: 80,
  },
  ownerActionsWrapper: {
    width: 160,
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...typography.h3,
    color: '#c7c7cc',
    marginTop: spacing.md,
  },
})

export default SectionListScreen
