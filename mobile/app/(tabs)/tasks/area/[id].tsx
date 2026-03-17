import { useMemo } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { getSectionTaskLists } from '@/services/sectionService'
import { colors, spacing, typography } from '@/styles/theme'
import { getAreaSettingsPath } from '@/utils/areaRoutes'
import { buildSectionListSummaries } from '@/utils/taskHierarchy'

const AreaScreen = () => {
  const { id } = useLocalSearchParams()
  const areaId = Number(id)
  const router = useRouter()
  const { sections, isLoading: sectionsLoading } = useSectionQuery()
  const { tasks, isLoading: tasksLoading } = useTasksQuery()
  const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
    queryKey: ['section-task-lists', areaId],
    queryFn: () => getSectionTaskLists(areaId),
    enabled: Number.isFinite(areaId) && areaId > 0,
  })

  const area = useMemo(
    () => (sections ?? []).find((section) => section.id === areaId),
    [sections, areaId]
  )

  const checklistSummaries = useMemo(() => {
    const taskSummaries = buildSectionListSummaries(areaId, tasks)
    return checklists.map((checklist) => {
      const taskSummary = taskSummaries.find((item) => item.id === checklist.id)
      return {
        ...checklist,
        totalTasks: taskSummary?.totalTasks ?? 0,
        completedTasks: taskSummary?.completedTasks ?? 0,
        pendingTasks: taskSummary?.pendingTasks ?? 0,
      }
    })
  }, [areaId, checklists, tasks])

  if (sectionsLoading || tasksLoading || checklistsLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  if (!area) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <EmptyState
            title='Area not found'
            description='This area is unavailable or you no longer have access to it.'
            icon='layers-outline'
          />
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.eyebrow}>Area</Text>
          <Text style={s.title}>{area.name}</Text>
          <Text style={s.subtitle}>
            Pick a checklist to work through tasks. Configuration stays in area settings.
          </Text>
        </View>

        {(area.role === 'owner' || area.role === 'editor') && (
          <AppCard style={s.manageCard}>
            <View style={s.manageCopy}>
              <Text style={s.manageTitle}>Need to change members or create a checklist?</Text>
              <Text style={s.manageText}>
                Open area settings to manage assignments and checklist structure.
              </Text>
            </View>
            <AppButton
              label='Manage Area'
              tone='neutral'
              onPress={() => router.push(getAreaSettingsPath(area.id))}
            />
          </AppCard>
        )}

        {checklistSummaries.length === 0 ? (
          <AppCard style={s.emptyCard}>
            <EmptyState
              title='No checklists yet'
              description='Create the first checklist in area settings so tasks have a clear place to live.'
              icon='list-outline'
            />
            {(area.role === 'owner' || area.role === 'editor') && (
              <AppButton
                label='Open Area Settings'
                onPress={() => router.push(getAreaSettingsPath(area.id))}
              />
            )}
          </AppCard>
        ) : (
          checklistSummaries.map((checklist) => {
            const progress =
              checklist.totalTasks === 0
                ? 0
                : (checklist.completedTasks / checklist.totalTasks) * 100

            return (
              <Pressable
                key={checklist.id}
                onPress={() => router.push(`/(tabs)/tasks/list/${checklist.id}`)}
              >
                <AppCard style={s.checklistCard}>
                  <View style={s.row}>
                    <View style={s.copy}>
                      <Text style={s.checklistTitle}>{checklist.name}</Text>
                      {!!checklist.description && (
                        <Text style={s.checklistDescription}>{checklist.description}</Text>
                      )}
                    </View>
                    <Ionicons name='chevron-forward' size={18} color='#c7c7cc' />
                  </View>

                  <View style={s.metaRow}>
                    <MetaPill label='Pending' value={checklist.pendingTasks} tone='neutral' />
                    <MetaPill label='Done' value={checklist.completedTasks} tone='success' />
                    <MetaPill label='Total' value={checklist.totalTasks} tone='neutral' />
                  </View>

                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${progress}%` }]} />
                  </View>
                </AppCard>
              </Pressable>
            )
          })
        )}
      </ScrollView>
    </ScreenMotion>
  )
}

const MetaPill = ({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'neutral' | 'success'
}) => {
  const tint = tone === 'success' ? colors.success : '#8e8e93'

  return (
    <View style={[s.pill, { backgroundColor: `${tint}15` }]}>
      <Text style={[s.pillValue, { color: tint }]}>{value}</Text>
      <Text style={[s.pillLabel, { color: tint }]}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  hero: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8e8e93',
    maxWidth: 360,
  },
  manageCard: {
    gap: spacing.md,
  },
  manageCopy: {
    gap: 4,
  },
  manageTitle: {
    ...typography.h4,
    color: colors.text,
  },
  manageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8e8e93',
  },
  emptyCard: {
    gap: spacing.md,
  },
  checklistCard: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  checklistTitle: {
    ...typography.h4,
    color: colors.text,
  },
  checklistDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8e8e93',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#e5e5ea',
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
})

export default AreaScreen
