import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import ScreenMotion from '@/components/ui/ScreenMotion'
import AppCard from '@/components/ui/AppCard'
import { colors, spacing, typography } from '@/styles/theme'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { createSectionTaskList, getSectionTaskLists } from '@/services/sectionService'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import AppButton from '@/components/ui/AppButton'
import EmptyState from '@/components/ui/EmptyState'

const SectionTaskListsScreen = () => {
  const { id } = useLocalSearchParams()
  const sectionId = Number(id)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { sections } = useSectionQuery()
  const { tasks } = useTasksQuery()
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')

  const section = useMemo(
    () => (sections ?? []).find((item) => item.id === sectionId),
    [sections, sectionId]
  )

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['section-task-lists', sectionId],
    queryFn: () => getSectionTaskLists(sectionId),
    enabled: !!sectionId,
  })

  const createListMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      createSectionTaskList(sectionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['section-task-lists', sectionId],
      })
      setNewListName('')
      setNewListDescription('')
      setIsCreatingList(false)
    },
    onError: (error) => {
      Alert.alert(
        'Unable to create list',
        error instanceof Error ? error.message : 'Please try again.'
      )
    },
  })

  const sectionTasks = tasks.filter((task) => task.sectionId === sectionId)
  const completedTasks = sectionTasks.filter((task) => task.complete).length
  const canManageLists = section?.role === 'owner' || section?.role === 'editor'

  const handleCreateList = () => {
    if (!newListName.trim()) return

    createListMutation.mutate({
      name: newListName.trim(),
      description: newListDescription.trim() || undefined,
    })
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <ScreenHeader
          eyebrow='Section'
          title={section?.name ?? 'Section'}
          subtitle='Open a checklist below to get into the actionable task view.'
        />

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

        {canManageLists && (
          <AppCard style={s.createCard}>
            <View style={s.createHeader}>
              <View style={s.createCopy}>
                <Text style={s.createTitle}>Task Lists</Text>
                <Text style={s.createSubtitle}>
                  Add focused checklists like Opening, Closing, or Weekly.
                </Text>
              </View>
              {!isCreatingList && (
                <Pressable style={s.addListButton} onPress={() => setIsCreatingList(true)}>
                  <Ionicons name='add' size={16} color='#fff' />
                  <Text style={s.addListButtonText}>New List</Text>
                </Pressable>
              )}
            </View>

            {isCreatingList && (
              <View style={s.createForm}>
                <FormField label='List name'>
                  <Input
                    value={newListName}
                    onChangeText={setNewListName}
                    placeholder='e.g., Closing'
                    autoFocus
                  />
                </FormField>
                <FormField label='Description' hint='Optional context or instructions for this checklist.'>
                  <Input
                    value={newListDescription}
                    onChangeText={setNewListDescription}
                    placeholder='Add details (optional)'
                    multiline
                  />
                </FormField>
                <View style={s.createActions}>
                  <AppButton
                    label='Cancel'
                    onPress={() => {
                      setIsCreatingList(false)
                      setNewListName('')
                      setNewListDescription('')
                    }}
                    tone='neutral'
                    style={s.actionButton}
                  />
                  <AppButton
                    label='Create List'
                    onPress={handleCreateList}
                    loading={createListMutation.isPending}
                    disabled={!newListName.trim()}
                    style={s.actionButton}
                  />
                </View>
              </View>
            )}
          </AppCard>
        )}

        {isLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size='small' color={colors.primary} />
          </View>
        ) : lists.length === 0 ? (
          <EmptyState
            icon={<Ionicons name='list-outline' size={28} color='#c7c7cc' />}
            title='No lists yet'
            description='Create the first checklist for this section to start organizing tasks.'
          />
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createCard: {
    gap: spacing.md,
  },
  createHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  createCopy: {
    flex: 1,
    gap: 4,
  },
  createTitle: {
    ...typography.h4,
    color: colors.text,
  },
  createSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    lineHeight: 18,
  },
  addListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  addListButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  createForm: {
    gap: spacing.md,
  },
  createActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
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
