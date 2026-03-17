import { useMemo } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AppCard from '@/components/ui/AppCard'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useSectionMutation } from '@/hooks/useSectionMutation'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { colors, spacing, typography } from '@/styles/theme'
import { getAreaSettingsPath } from '@/utils/areaRoutes'
import { buildSectionSummaries } from '@/utils/taskHierarchy'
import type { SectionProps } from '@/types/section'

type AreaGroup = {
  title: string
  data: SectionProps[]
}

const getRoleBadgeStyle = (role: SectionProps['role']) => {
  switch (role) {
    case 'owner':
      return { bg: '#1c1c1e', text: '#fff' }
    case 'editor':
      return { bg: colors.primary + '18', text: colors.primary }
    case 'viewer':
      return { bg: '#e5e5ea', text: '#666' }
  }
}

const AreasScreen = () => {
  const { sections, archivedSections, isLoading, isError, error } = useSectionQuery()
  const { tasks } = useTasksQuery()
  const { archiveSection, unarchiveSection, deleteSection, renameSection } =
    useSectionMutation()
  const router = useRouter()

  const areaSummaries = useMemo(() => {
    const allAreas = [...(sections ?? []), ...(archivedSections ?? [])]
    return buildSectionSummaries(allAreas, tasks)
  }, [sections, archivedSections, tasks])

  const summaryByAreaId = useMemo(
    () => new Map(areaSummaries.map((area) => [area.id, area])),
    [areaSummaries]
  )

  const areaGroups = useMemo<AreaGroup[]>(() => {
    const activeAreas = sections ?? []
    const groups: AreaGroup[] = []

    const owned = activeAreas.filter((area) => area.role === 'owner')
    const shared = activeAreas.filter((area) => area.role === 'editor')
    const readOnly = activeAreas.filter((area) => area.role === 'viewer')

    if (owned.length > 0) groups.push({ title: 'Owned by you', data: owned })
    if (shared.length > 0) groups.push({ title: 'Shared with you', data: shared })
    if (readOnly.length > 0) groups.push({ title: 'Read only', data: readOnly })
    if ((archivedSections ?? []).length > 0) {
      groups.push({ title: 'Archived', data: archivedSections ?? [] })
    }

    return groups
  }, [sections, archivedSections])

  const overview = useMemo(
    () => ({
      active: sections?.length ?? 0,
      archived: archivedSections?.length ?? 0,
      owned: (sections ?? []).filter((area) => area.role === 'owner').length,
    }),
    [sections, archivedSections]
  )

  const handleRename = (area: SectionProps) => {
    if (Platform.OS === 'web') {
      const newName = window.prompt('Rename area', area.name)
      if (newName && newName.trim() && newName.trim() !== area.name) {
        renameSection({ id: area.id, name: newName.trim() })
      }
      return
    }

    Alert.prompt(
      'Rename Area',
      'Enter a new name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (newName?: string) => {
            if (newName && newName.trim() && newName.trim() !== area.name) {
              renameSection({ id: area.id, name: newName.trim() })
            }
          },
        },
      ],
      'plain-text',
      area.name
    )
  }

  const handleArchive = (area: SectionProps) => {
    Alert.alert('Archive', `Would you like to archive area "${area.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', onPress: () => archiveSection(area.id) },
    ])
  }

  const handleDelete = (area: SectionProps) => {
    Alert.prompt(
      'DELETE',
      `You are about to delete area "${area.name}". This will also delete ALL tasks associated with this area. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'DELETE', onPress: () => deleteSection(area.id), style: 'destructive' },
      ],
      'default'
    )
  }

  const openAreaActions = (area: SectionProps) => {
    if (area.role === 'viewer') return

    const isArchived = !!(archivedSections ?? []).find((item) => item.id === area.id)

    Alert.alert(area.name, 'Choose an action', [
      { text: 'Rename', onPress: () => handleRename(area) },
      isArchived
        ? { text: 'Restore', onPress: () => unarchiveSection(area.id) }
        : { text: 'Archive', onPress: () => handleArchive(area) },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(area) },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  if (isError) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <Text style={s.errorText}>Error: {error?.message}</Text>
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.title}>Areas</Text>
          <Text style={s.subtitle}>
            Manage checklists, members, and structure in one place.
          </Text>
        </View>

        <View style={s.summaryRow}>
          <SummaryCard label='Active' value={overview.active} />
          <SummaryCard label='Owned' value={overview.owned} />
          <SummaryCard label='Archived' value={overview.archived} />
        </View>

        {areaGroups.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name='layers-outline' size={42} color='#c7c7cc' />
            <Text style={s.emptyTitle}>No areas yet</Text>
            <Text style={s.emptyText}>Create your first area to organize work.</Text>
          </View>
        ) : (
          areaGroups.map((group) => (
            <View key={group.title} style={s.group}>
              <Text style={s.groupTitle}>{group.title}</Text>
              {group.data.map((area) => {
                const summary = summaryByAreaId.get(area.id)
                const roleBadge = getRoleBadgeStyle(area.role)
                const isViewer = area.role === 'viewer'

                return (
                  <Pressable
                    key={area.id}
                    onPress={() => {
                      if (isViewer) {
                        Alert.alert(
                          'No Access',
                          'You do not have permission to manage this area'
                        )
                        return
                      }
                      router.push(getAreaSettingsPath(area.id))
                    }}
                  >
                    <AppCard style={s.areaCard}>
                      <View style={s.areaHeader}>
                        <View style={s.areaCopy}>
                          <Text style={s.areaName}>{area.name}</Text>
                          <View style={s.metaRow}>
                            <View style={[s.roleBadge, { backgroundColor: roleBadge.bg }]}>
                              <Text style={[s.roleText, { color: roleBadge.text }]}>
                                {area.role}
                              </Text>
                            </View>
                            <MetaPill label='Tasks' value={summary?.totalTasks ?? 0} />
                            <MetaPill label='Open' value={summary?.pendingTasks ?? 0} />
                          </View>
                        </View>

                        <View style={s.actions}>
                          {!isViewer && (
                            <Pressable
                              accessibilityLabel={`Open actions for ${area.name}`}
                              hitSlop={8}
                              style={s.iconButton}
                              onPress={() => openAreaActions(area)}
                            >
                              <Ionicons
                                name='ellipsis-horizontal'
                                size={18}
                                color={colors.textSecondary}
                              />
                            </Pressable>
                          )}
                          {!isViewer && (
                            <Ionicons
                              name='chevron-forward'
                              size={18}
                              color='#c7c7cc'
                            />
                          )}
                        </View>
                      </View>
                    </AppCard>
                  </Pressable>
                )
              })}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenMotion>
  )
}

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <AppCard style={s.summaryCard}>
    <Text style={s.summaryValue}>{value}</Text>
    <Text style={s.summaryLabel}>{label}</Text>
  </AppCard>
)

const MetaPill = ({ label, value }: { label: string; value: number }) => (
  <View style={s.pill}>
    <Text style={s.pillValue}>{value}</Text>
    <Text style={s.pillLabel}>{label}</Text>
  </View>
)

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  hero: {
    gap: 4,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    maxWidth: 360,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    gap: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 4,
  },
  areaCard: {
    gap: spacing.sm,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  areaCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  areaName: {
    ...typography.h4,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  pill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
  },
  pillValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 96,
    gap: 8,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 14,
    color: '#aeaeb2',
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
  },
})

export default AreasScreen
