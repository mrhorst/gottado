import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SectionProps, useSections } from '@/context/section/SectionContext'
import { useRouter } from 'expo-router'
import { colors, spacing } from '@/styles/theme'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useCallback, useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
})

const SectionListScreen = () => {
  const { sections, isLoading } = useSections()
  const { tasks } = useTasksQuery()

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
    }

    sections.forEach((section) => {
      const role = section.role
      if (groups[role]) {
        groups[role].push(section)
      }
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

    return result
  }, [sections, sectionTasksLength])

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
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
        renderItem={({ item }) => (
          <Pressable
            onPress={() => canSeeSectionInfo(item)}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            disabled={isViewer(item)}
          >
            <View style={styles.sectionCard}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 15,
                  alignItems: 'center',
                }}
              >
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
          </Pressable>
        )}
      />
    </View>
  )
}
export default SectionListScreen
