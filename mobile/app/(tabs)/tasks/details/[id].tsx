import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
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
import { useTasksMutation } from '@/hooks/useTasksMutation'
import * as ImagePicker from 'expo-image-picker'
import AppCard from '@/components/ui/AppCard'
import AppButton from '@/components/ui/AppButton'
import PriorityBadge from '@/components/ui/PriorityBadge'

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

const blurActiveElementOnWeb = () => {
  if (Platform.OS !== 'web') return
  const activeEl = document.activeElement
  if (activeEl instanceof HTMLElement) activeEl.blur()
}

const TaskDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const taskId = Number(id)
  const router = useRouter()
  const { tasks, isLoading } = useTasksQuery()
  const { completions, isLoading: historyLoading } = useTaskHistoryQuery(taskId)
  const { toggleCompleteAsync, completeWithPicture, isTogglingComplete, isUploadingPicture } =
    useTasksMutation()

  const task = tasks.find((t) => t.id === taskId)
  const photoCompletions = useMemo(
    () => completions.filter((c) => !!c.pictureUrl),
    [completions]
  )
  const isSubmitting = isTogglingComplete || isUploadingPicture

  const pickCompletionImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required to complete this task.')
        return null
      }
      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })
      if (cameraResult.canceled || !cameraResult.assets?.[0]?.uri) return null
      return cameraResult.assets[0].uri
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) return null
    return pickerResult.assets[0].uri
  }

  const handleComplete = async () => {
    if (!task) return
    try {
      if (task.requiresPicture) {
        const imageUri = await pickCompletionImage()
        if (!imageUri) return
        await completeWithPicture({ id: task.id, imageUri })
      } else {
        await toggleCompleteAsync({ id: task.id, complete: true })
      }
      blurActiveElementOnWeb()
      router.replace('/(tabs)/tasks')
    } catch {
      Alert.alert('Unable to complete task', 'Please try again.')
    }
  }

  const handleMarkIncomplete = async () => {
    if (!task) return
    try {
      await toggleCompleteAsync({ id: task.id, complete: false })
    } catch {
      Alert.alert('Unable to update task', 'Please try again.')
    }
  }

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
        <AppCard>
          <Text style={s.taskTitle}>{task.title}</Text>
          <View style={s.chipsRow}>
            <PriorityBadge priority={task.priority} />
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
        </AppCard>

        <AppCard>
          <Text style={s.blockTitle}>Description</Text>
          <Text style={task.description ? s.bodyText : s.emptyText}>
            {task.description || 'No instructions added for this task yet.'}
          </Text>
        </AppCard>

        <AppCard>
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
        </AppCard>
      </ScrollView>

      <View style={s.footer}>
        <AppButton
          label={task.complete ? 'Mark Incomplete' : 'Complete Task'}
          onPress={task.complete ? handleMarkIncomplete : handleComplete}
          tone={task.complete ? 'neutral' : 'success'}
          loading={isSubmitting}
          icon={
            <Ionicons
              name={task.complete ? 'close-circle-outline' : 'checkmark-circle-outline'}
              size={18}
              color='#fff'
            />
          }
        />
        <AppButton
          label='Edit Task'
          onPress={() => router.push(`/(tabs)/tasks/${taskId}`)}
          tone='primary'
          disabled={isSubmitting}
          icon={<Ionicons name='create-outline' size={18} color='#fff' />}
        />
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
    gap: spacing.sm,
  },
})

export default TaskDetailsScreen
