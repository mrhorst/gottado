import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { colors, spacing } from '@/styles/theme'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import type { Recurrence, TaskActivity, TaskPriority } from '@/services/taskService'
import { getTaskActivities } from '@/services/taskService'
import AppButton from '@/components/ui/AppButton'

type TaskMode = 'one_time' | 'recurring'

const RECURRENCE_OPTIONS: { value: Recurrence; label: string; icon: string }[] = [
  { value: 'daily', label: 'Daily', icon: 'today-outline' },
  { value: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar' },
  { value: 'quarterly', label: 'Quarterly', icon: 'time-outline' },
  { value: 'semi_annual', label: '6 Months', icon: 'hourglass-outline' },
  { value: 'yearly', label: 'Yearly', icon: 'repeat-outline' },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#34C759' },
  { value: 'medium', label: 'Medium', color: '#FF9500' },
  { value: 'high', label: 'High', color: '#FF3B30' },
]

const TIME_SLOTS = (() => {
  const slots: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
})()

const formatTime12h = (time24: string) => {
  const [h, m] = time24.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

const activityIconName = (action: TaskActivity['action']): keyof typeof Ionicons.glyphMap => {
  switch (action) {
    case 'created': return 'add-circle'
    case 'completed': return 'checkmark-circle'
    case 'uncompleted': return 'arrow-undo'
    case 'edited': return 'create'
    case 'deleted': return 'trash'
    default: return 'ellipse'
  }
}

const activityLabel = (action: TaskActivity['action']) => {
  switch (action) {
    case 'created': return 'created this task'
    case 'completed': return 'completed this task'
    case 'uncompleted': return 'marked as incomplete'
    case 'edited': return 'edited this task'
    case 'deleted': return 'deleted this task'
    default: return action
  }
}

const activityColor = (action: TaskActivity['action']) => {
  switch (action) {
    case 'completed': return { backgroundColor: '#34C759' }
    case 'uncompleted': return { backgroundColor: '#FF9500' }
    case 'created': return { backgroundColor: '#007AFF' }
    case 'edited': return { backgroundColor: '#5856D6' }
    case 'deleted': return { backgroundColor: '#FF3B30' }
    default: return { backgroundColor: '#8e8e93' }
  }
}

const EditTaskScreen = () => {
  const { id } = useLocalSearchParams()
  const taskId = Number(id)
  const router = useRouter()
  const { tasks } = useTasksQuery()
  const { updateTask } = useTasksMutation()

  const task = tasks.find((t) => t.id === taskId)

  const { data: activities } = useQuery({
    queryKey: ['task-activities', taskId],
    queryFn: () => getTaskActivities(taskId),
    enabled: !!taskId,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<TaskMode>('one_time')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [deadlineTime, setDeadlineTime] = useState<string | null>(null)
  const [recurrence, setRecurrence] = useState<Recurrence>('daily')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [requiresPicture, setRequiresPicture] = useState(false)
  const [priority, setPriority] = useState<TaskPriority>('medium')

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description || '')
    setRequiresPicture(task.requiresPicture)
    setPriority(task.priority ?? 'medium')
    if (task.recurrence) {
      setMode('recurring')
      setRecurrence(task.recurrence)
    } else {
      setMode('one_time')
      if (task.dueDate) setDueDate(new Date(task.dueDate + 'T00:00:00'))
    }
    if (task.deadlineTime) setDeadlineTime(task.deadlineTime)
  }, [task])

  if (!task) return null

  const handleSave = () => {
    if (!title.trim()) return

    if (mode === 'one_time') {
      updateTask({
        id: taskId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
        deadlineTime: deadlineTime || null,
        recurrence: null,
        requiresPicture,
        priority,
      })
    } else {
      updateTask({
        id: taskId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: null,
        deadlineTime: deadlineTime || null,
        recurrence,
        requiresPicture,
        priority,
      })
    }
    router.back()
  }

  const isValid = title.trim().length > 0

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps='handled'
      >
        {/* Title */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Title</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder='What needs to be done?'
            placeholderTextColor='#c7c7cc'
          />
        </View>

        {/* Description */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Description</Text>
          <TextInput
            style={[s.input, s.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder='Add details (optional)'
            placeholderTextColor='#c7c7cc'
            multiline
            textAlignVertical='top'
          />
        </View>

        <View style={s.fieldGroup}>
          <Text style={s.label}>Priority</Text>
          <View style={s.priorityRow}>
            {PRIORITY_OPTIONS.map((opt) => {
              const selected = priority === opt.value
              return (
                <Pressable
                  key={opt.value}
                  style={[
                    s.priorityChip,
                    selected && { borderColor: opt.color, backgroundColor: `${opt.color}15` },
                  ]}
                  onPress={() => setPriority(opt.value)}
                >
                  <View style={[s.priorityDot, { backgroundColor: opt.color }]} />
                  <Text style={[s.priorityChipText, selected && { color: opt.color }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Mode toggle */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Schedule</Text>
          <View style={s.segmentedControl}>
            <Pressable
              style={[s.segment, mode === 'one_time' && s.segmentActive]}
              onPress={() => setMode('one_time')}
            >
              <Ionicons
                name='calendar-outline'
                size={16}
                color={mode === 'one_time' ? '#fff' : '#8e8e93'}
              />
              <Text style={[s.segmentText, mode === 'one_time' && s.segmentTextActive]}>
                One-time
              </Text>
            </Pressable>
            <Pressable
              style={[s.segment, mode === 'recurring' && s.segmentActive]}
              onPress={() => setMode('recurring')}
            >
              <Ionicons
                name='repeat-outline'
                size={16}
                color={mode === 'recurring' ? '#fff' : '#8e8e93'}
              />
              <Text style={[s.segmentText, mode === 'recurring' && s.segmentTextActive]}>
                Recurring
              </Text>
            </Pressable>
          </View>
        </View>

        {/* One-time: Date picker */}
        {mode === 'one_time' && (
          <View style={s.fieldGroup}>
            <Text style={s.label}>Due Date</Text>
            <Pressable
              style={s.pickerButton}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <Ionicons name='calendar-outline' size={18} color={colors.primary} />
              <Text style={[s.pickerButtonText, !dueDate && { color: '#c7c7cc' }]}>
                {dueDate
                  ? dueDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Select a date'}
              </Text>
              {dueDate && (
                <Pressable
                  style={s.clearButton}
                  onPress={() => {
                    setDueDate(null)
                    setShowDatePicker(false)
                  }}
                >
                  <Ionicons name='close-circle' size={18} color='#c7c7cc' />
                </Pressable>
              )}
            </Pressable>
            {showDatePicker && (
              <View style={s.datePickerContainer}>
                <DateTimePicker
                  value={dueDate ?? new Date()}
                  mode='date'
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(_, selectedDate) => {
                    if (Platform.OS === 'android') setShowDatePicker(false)
                    if (selectedDate) setDueDate(selectedDate)
                  }}
                  themeVariant='light'
                />
              </View>
            )}
          </View>
        )}

        {/* Recurring: Recurrence options */}
        {mode === 'recurring' && (
          <View style={s.fieldGroup}>
            <Text style={s.label}>Frequency</Text>
            <View style={s.recurrenceGrid}>
              {RECURRENCE_OPTIONS.map((opt) => {
                const isSelected = recurrence === opt.value
                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      s.recurrenceOption,
                      isSelected && s.recurrenceOptionSelected,
                    ]}
                    onPress={() => setRecurrence(opt.value)}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={16}
                      color={isSelected ? colors.primary : '#8e8e93'}
                    />
                    <Text
                      style={[
                        s.recurrenceText,
                        isSelected && s.recurrenceTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )}

        {/* Time picker (both modes) */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Deadline Time</Text>
          <Pressable
            style={s.pickerButton}
            onPress={() => setShowTimePicker(!showTimePicker)}
          >
            <Ionicons name='time-outline' size={18} color={colors.primary} />
            <Text style={[s.pickerButtonText, !deadlineTime && { color: '#c7c7cc' }]}>
              {deadlineTime ? formatTime12h(deadlineTime) : 'Select a time (optional)'}
            </Text>
            {deadlineTime && (
              <Pressable
                style={s.clearButton}
                onPress={() => {
                  setDeadlineTime(null)
                  setShowTimePicker(false)
                }}
              >
                <Ionicons name='close-circle' size={18} color='#c7c7cc' />
              </Pressable>
            )}
          </Pressable>
          {showTimePicker && (
            <View style={s.timeGrid}>
              <ScrollView
                style={s.timeScrollView}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {TIME_SLOTS.map((slot) => {
                  const isSelected = deadlineTime === slot
                  return (
                    <Pressable
                      key={slot}
                      style={[s.timeSlot, isSelected && s.timeSlotSelected]}
                      onPress={() => {
                        setDeadlineTime(slot)
                        setShowTimePicker(false)
                      }}
                    >
                      <Text
                        style={[
                          s.timeSlotText,
                          isSelected && s.timeSlotTextSelected,
                        ]}
                      >
                        {formatTime12h(slot)}
                      </Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Requires picture toggle */}
        <View style={s.fieldGroup}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Requires Picture</Text>
              <Text style={s.switchHint}>User must take a photo to complete this task</Text>
            </View>
            <Switch
              value={requiresPicture}
              onValueChange={setRequiresPicture}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </View>

        {/* Section (read-only) */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Section</Text>
          <View style={s.readOnlyField}>
            <Ionicons name='layers-outline' size={18} color='#8e8e93' />
            <Text style={s.readOnlyText}>{task.sectionName}</Text>
          </View>
        </View>

        {/* Audit Source */}
        {task.relevanceTag && (
          <View style={s.fieldGroup}>
            <Text style={s.label}>Audit Source</Text>
            <View style={s.readOnlyField}>
              <Ionicons name='clipboard-outline' size={18} color='#AF52DE' />
              <Text style={[s.readOnlyText, { color: '#AF52DE' }]}>{task.relevanceTag}</Text>
            </View>
          </View>
        )}

        {/* Activity History */}
        {activities && activities.length > 0 && (
          <View style={s.fieldGroup}>
            <Text style={s.label}>Activity History</Text>
            <View style={s.activityList}>
              {activities.map((activity) => (
                <View key={activity.id} style={s.activityRow}>
                  <View style={[s.activityIcon, activityColor(activity.action)]}>
                    <Ionicons name={activityIconName(activity.action)} size={12} color='#fff' />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.activityText}>
                      <Text style={{ fontWeight: '600' }}>{activity.userName}</Text>
                      {' '}{activityLabel(activity.action)}
                    </Text>
                    <Text style={s.activityTime}>
                      {new Date(activity.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save button */}
      <View style={s.footer}>
        <AppButton
          label='Save Changes'
          onPress={handleSave}
          tone='primary'
          disabled={!isValid}
          icon={<Ionicons name='checkmark-circle' size={20} color='#fff' />}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    backgroundColor: '#f7f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e5e5ea',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    boxShadow: '0px 2px 4px rgba(10, 132, 255, 0.30)',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
  },
  segmentTextActive: {
    color: '#fff',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 2,
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  timeGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    overflow: 'hidden',
  },
  timeScrollView: {
    maxHeight: 200,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  timeSlotSelected: {
    backgroundColor: colors.primary + '10',
  },
  timeSlotText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  recurrenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recurrenceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    backgroundColor: '#fff',
  },
  recurrenceOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  recurrenceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8e8e93',
  },
  recurrenceTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  switchHint: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
    marginLeft: 4,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  activityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
  },
  activityTime: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 1,
  },
})

export default EditTaskScreen
