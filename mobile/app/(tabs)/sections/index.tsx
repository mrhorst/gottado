import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SectionProps, useSections } from '@/context/section/SectionContext'
import { useRouter } from 'expo-router'
import { colors, spacing } from '@/styles/theme'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useCallback, useMemo, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { useSectionMutation } from '@/hooks/useSectionMutation'
import { Pressable } from 'react-native-gesture-handler'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
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
  // New style for the inner row of the card
  cardContent: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  sectionName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionOwnerRoleText: {
    fontWeight: '800',
    color: '#2d2d2dff',
  },
  sectionEditorRoleText: {
    fontWeight: '800',
    color: colors.primary,
  },
  sectionViewerRole: {
    fontWeight: '800',
    color: colors.error,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskCount: {
    fontSize: 13,
    color: '#8e8e93',
  },
  chevron: {
    marginLeft: 8,
    opacity: 0.3,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  // New styles for the Swipe Action Buttons
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
  // Containers for the swipe actions
  archivedActionsWrapper: {
    width: 160,
    flexDirection: 'row',
  },
  activeActionWrapper: {
    width: 80,
  },
  rightAction: {
    backgroundColor: '#FF9500',
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  archivedAction: {
    width: 160,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
})

const SectionListScreen = () => {
  const { sections, archivedSections, isLoading } = useSections()
  const { tasks } = useTasksQuery()
  const { archiveSection, unarchiveSection, deleteSection } =
    useSectionMutation()

  const router = useRouter()

  const sectionTasksLength = useCallback(
    (item: SectionProps) =>
      tasks.filter((t) => t.sectionName === item.name).length,
    [tasks]
  )

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'owner':
        return { color: '#fff', backgroundColor: '#2d2d2d' }
      case 'editor':
        return { color: '#fff', backgroundColor: colors.primary }
      case 'viewer':
        return { color: '#666', backgroundColor: '#e5e5ea' }
      default:
        return {}
    }
  }

  const isViewer = (item: SectionProps) => {
    return item.role === 'viewer'
  }

  const canSeeSectionInfo = (item: SectionProps) => {
    if (isViewer(item)) {
      Alert.alert(
        'No Access',
        'You do not have permission to see this section',
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
      result.push({
        title: 'My Sections (Owner)',
        data: sortByTasks(groups.owner),
      })
    }
    if (groups.editor.length > 0) {
      result.push({
        title: 'Shared with me (Editor)',
        data: sortByTasks(groups.editor),
      })
    }
    if (groups.viewer.length > 0) {
      result.push({
        title: 'Read Only (Viewer)',
        data: sortByTasks(groups.viewer),
      })
    }
    if (groups.archived.length > 0) {
      result.push({
        title: 'Archived',
        data: groups.archived,
      })
    }

    return result
  }, [sections, sectionTasksLength, archivedSections])

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  const onArchive = (item: SectionProps) => {
    Alert.prompt(
      'Archive',
      `Would you like to archive "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: () => {
            archiveSection(item.id)
          },
          style: 'default',
        },
      ],
      'default'
    )
  }

  const onUnarchive = (item: SectionProps) => {
    unarchiveSection(item.id)
  }

  const onDelete = (item: SectionProps) => {
    Alert.prompt(
      'DELETE',
      `You are about to delete "${item.name}". This will also delete ALL tasks associated with this section. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE',
          onPress: () => {
            deleteSection(item.id)
          },
          style: 'destructive',
        },
      ],
      'default'
    )
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id.toString()}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({ item, section }) => (
          <SwipeableItem
            sectionTitle={section.title}
            onArchive={() => onArchive(item)}
            onUnarchive={() => {
              onUnarchive(item)
            }}
            onDelete={() => onDelete(item)}
            onPress={() => canSeeSectionInfo(item)}
            enabled={!isViewer(item)}
          >
            <View style={styles.sectionCard}>
              <View style={styles.cardContent}>
                <Text style={styles.sectionName}>{item.name}</Text>
                <View style={styles.metaContainer}>
                  <Text style={[styles.roleBadge, getRoleStyle(item.role)]}>
                    {item.role}
                  </Text>
                  <Text style={styles.taskCount}>
                    • {sectionTasksLength(item)} Tasks
                  </Text>
                </View>
              </View>
              {!isViewer(item) && (
                <Ionicons name='chevron-forward' size={20} color='#c7c7cc' />
              )}
            </View>
          </SwipeableItem>
        )}
      />
    </View>
  )
}

interface SwipeableItemProps {
  children: React.ReactNode
  sectionTitle: string
  onArchive: () => void
  onUnarchive: () => void
  onDelete: () => void
  onPress: () => void
  enabled?: boolean
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
}) => {
  return (
    <Pressable
      onPress={() => {
        onPress()
      }}
      style={[styles.swipeBtn, { backgroundColor: color, width }]}
    >
      <Ionicons name={icon} size={24} color='white' />
      <Text style={styles.swipeBtnText}>{text}</Text>
    </Pressable>
  )
}

export const SwipeableItem = ({
  children,
  sectionTitle,
  onArchive,
  onUnarchive,
  onDelete,
  enabled = true,
}: SwipeableItemProps) => {
  const swipeableRef =
    useRef<React.ComponentRef<typeof ReanimatedSwipeable>>(null)

  const close = () => {
    swipeableRef.current?.close()
  }

  const renderRightActions = useCallback(() => {
    if (sectionTitle === 'Archived') {
      return (
        <View style={styles.archivedActionsWrapper}>
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
      <View style={styles.activeActionWrapper}>
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
  }, [sectionTitle, onArchive, onUnarchive, onDelete])

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      enabled={enabled}
      rightThreshold={40}
      renderRightActions={renderRightActions} // Passing stable function reference
    >
      {children}
    </ReanimatedSwipeable>
  )
}

export default SectionListScreen
