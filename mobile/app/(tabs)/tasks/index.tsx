import { useMemo } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import ScreenMotion from '@/components/ui/ScreenMotion'
import AppCard from '@/components/ui/AppCard'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { buildSectionSummaries } from '@/utils/taskHierarchy'
import { colors, spacing, typography } from '@/styles/theme'

const TasksScreen = () => {
  const router = useRouter()
  const { sections, isLoading: sectionsLoading } = useSectionQuery()
  const { tasks, isLoading: tasksLoading } = useTasksQuery()

  const sectionSummaries = useMemo(
    () => buildSectionSummaries(sections ?? [], tasks),
    [sections, tasks]
  )

  if (sectionsLoading || tasksLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.title}>Sections</Text>
          <Text style={s.subtitle}>
            Pick an area to open its task lists and start checking work off.
          </Text>
        </View>

        {sectionSummaries.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name='layers-outline' size={42} color='#c7c7cc' />
            <Text style={s.emptyTitle}>No active task sections</Text>
            <Text style={s.emptyText}>Create tasks to populate this workflow.</Text>
          </View>
        ) : (
          sectionSummaries.map((section) => (
            <Pressable
              key={section.id}
              onPress={() => router.push(`/(tabs)/tasks/section/${section.id}`)}
            >
              <AppCard style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={s.sectionTitleWrap}>
                    <Text style={s.sectionTitle}>{section.name}</Text>
                    <Text style={s.sectionMeta}>
                      {section.listCount} lists • {section.completedTasks}/{section.totalTasks} done
                    </Text>
                  </View>
                  <Ionicons name='chevron-forward' size={18} color='#c7c7cc' />
                </View>

                <View style={s.badgeRow}>
                  <StatBadge
                    label='Pending'
                    value={section.pendingTasks}
                    tone='neutral'
                  />
                  {section.dueTodayTasks > 0 && (
                    <StatBadge label='Due Today' value={section.dueTodayTasks} tone='warn' />
                  )}
                  {section.overdueTasks > 0 && (
                    <StatBadge label='Overdue' value={section.overdueTasks} tone='danger' />
                  )}
                </View>

                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${section.totalTasks === 0 ? 0 : (section.completedTasks / section.totalTasks) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </AppCard>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenMotion>
  )
}

const StatBadge = ({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'neutral' | 'warn' | 'danger'
}) => {
  const toneColor =
    tone === 'danger' ? colors.iOSred : tone === 'warn' ? '#FF9500' : '#8e8e93'

  return (
    <View style={[s.statBadge, { backgroundColor: `${toneColor}14` }]}>
      <Text style={[s.statValue, { color: toneColor }]}>{value}</Text>
      <Text style={[s.statLabel, { color: toneColor }]}>{label}</Text>
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
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  hero: {
    gap: 4,
    paddingTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8e8e93',
    maxWidth: 340,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWrap: {
    gap: 4,
    flex: 1,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e5ea',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 96,
    gap: 8,
  },
  emptyTitle: {
    ...typography.h3,
    color: '#8e8e93',
  },
  emptyText: {
    fontSize: 14,
    color: '#aeaeb2',
  },
})

export default TasksScreen
