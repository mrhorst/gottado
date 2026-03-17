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
import ScreenMotion from '@/components/ui/ScreenMotion'
import AppCard from '@/components/ui/AppCard'
import { colors, spacing, typography } from '@/styles/theme'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { getSectionTaskLists } from '@/services/sectionService'

const SectionTaskListsScreen = () => {
  const { id } = useLocalSearchParams()
  const sectionId = Number(id)
  const router = useRouter()
  const { sections } = useSectionQuery()
  const { tasks } = useTasksQuery()

  const section = useMemo(
    () => (sections ?? []).find((item) => item.id === sectionId),
    [sections, sectionId]
  )

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['section-task-lists', sectionId],
    queryFn: () => getSectionTaskLists(sectionId),
    enabled: !!sectionId,
  })

  const sectionTasks = tasks.filter((task) => task.sectionId === sectionId)
  const completedTasks = sectionTasks.filter((task) => task.complete).length

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.sectionLabel}>Section</Text>
          <Text style={s.title}>{section?.name ?? 'Section'}</Text>
          <Text style={s.subtitle}>
            Open a checklist below to get into the actionable task view.
          </Text>
        </View>

        <AppCard style={s.summaryCard}>
          <View style={s.summaryMetric}>
            <Text style={s.summaryValue}>{lists.length}</Text>
            <Text style={s.summaryLabel}>Lists</Text>
          </View>
          <View style={s.summaryMetric}>
            <Text style={s.summaryValue}>{completedTasks}/{sectionTasks.length}</Text>
            <Text style={s.summaryLabel}>Tasks Done</Text>
          </View>
        </AppCard>

        {isLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size='small' color={colors.primary} />
          </View>
        ) : (
          lists.map((list) => (
            <Pressable
              key={list.id}
              onPress={() => router.push(`/(tabs)/tasks/list/${list.id}`)}
            >
              <AppCard style={s.listCard}>
                <View style={s.listHeader}>
                  <View style={s.listTitleWrap}>
                    <Text style={s.listTitle}>{list.name}</Text>
                    <Text style={s.listMeta}>
                      {list.completedTasks}/{list.totalTasks} done
                    </Text>
                  </View>
                  <Ionicons name='chevron-forward' size={18} color='#c7c7cc' />
                </View>
                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${list.totalTasks === 0 ? 0 : (list.completedTasks / list.totalTasks) * 100}%`,
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

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  hero: {
    gap: 4,
  },
  sectionLabel: {
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
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryMetric: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
  },
  loadingWrap: {
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  listCard: {
    gap: spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitleWrap: {
    gap: 3,
    flex: 1,
  },
  listTitle: {
    ...typography.h4,
    color: colors.text,
  },
  listMeta: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '600',
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
})

export default SectionTaskListsScreen
