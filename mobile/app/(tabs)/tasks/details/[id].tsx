import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useMemo } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/styles/theme'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useTaskHistoryQuery } from '@/hooks/useTaskHistoryQuery'

const API_URL = process.env.EXPO_PUBLIC_API_URL || ''

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const resolveImageUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_URL}${url}`
  return url
}

const TaskDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const taskId = Number(id)
  const router = useRouter()
  const { tasks, isLoading } = useTasksQuery()
  const { completions, isLoading: historyLoading } = useTaskHistoryQuery(taskId)

  const task = tasks.find((t) => t.id === taskId)
  const photoCompletions = useMemo(
    () => completions.filter((c) => !!c.pictureUrl),
    [completions]
  )

  if (isLoading) {
    return (
      <View style={[s.container, s.centered]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  if (!task) {
    return (
      <View style={[s.container, s.centered]}>
        <Ionicons name='document-text-outline' size={38} color='#c7c7cc' />
        <Text style={s.emptyTitle}>Task not found</Text>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.taskTitle}>{task.title}</Text>
          <View style={s.chipsRow}>
            {task.requiresPicture && (
              <View style={s.chip}>
                <Ionicons name='camera-outline' size={12} color='#8e8e93' />
                <Text style={s.chipText}>Requires photo</Text>
              </View>
            )}
            {task.sectionName && (
              <View style={s.chip}>
                <Ionicons name='layers-outline' size={12} color='#8e8e93' />
                <Text style={s.chipText}>{task.sectionName}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.blockTitle}>Description</Text>
          <Text style={task.description ? s.bodyText : s.emptyText}>
            {task.description || 'No instructions added for this task yet.'}
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.blockTitle}>Completion Photos</Text>
          {historyLoading ? (
            <ActivityIndicator size='small' color={colors.primary} />
          ) : photoCompletions.length === 0 ? (
            <Text style={s.emptyText}>No photo uploads for this task yet.</Text>
          ) : (
            <View style={s.photoList}>
              {photoCompletions.map((completion) => (
                <View key={completion.id} style={s.photoCard}>
                  <Image
                    source={{ uri: resolveImageUrl(String(completion.pictureUrl)) }}
                    style={s.photo}
                    resizeMode='cover'
                  />
                  <Text style={s.photoCaption}>{formatDateTime(completion.completedAt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Pressable
          style={s.editButton}
          onPress={() => router.push(`/(tabs)/tasks/${taskId}`)}
        >
          <Ionicons name='create-outline' size={18} color='#fff' />
          <Text style={s.editButtonText}>Edit Task</Text>
        </Pressable>
      </View>
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
    paddingBottom: 110,
    gap: spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    padding: spacing.md,
    gap: spacing.sm,
  },
  taskTitle: {
    ...typography.h3,
    color: colors.text,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f2f2f7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    fontSize: 18,
    color: '#8e8e93',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  photoList: {
    gap: spacing.md,
  },
  photoCard: {
    gap: 6,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#f2f2f7',
  },
  photoCaption: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  editButtonText: {
    ...typography.button,
    color: '#fff',
  },
})

export default TaskDetailsScreen
