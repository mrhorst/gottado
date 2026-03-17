import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import { useState } from 'react'
import { SectionProps } from '@/types/section'
import { useRouter } from 'expo-router'
import { useTasksMutation } from '@/hooks/useTasksMutation'
import { colors, layout, spacing } from '@/styles/theme'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { useAuth } from '@/context/auth/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import type { Recurrence, TaskPriority } from '@/services/taskService'
import AppButton from '@/components/ui/AppButton'
import { Input } from '@/components/ui/Input'
import FormField from '@/components/ui/FormField'
import ScreenHeader from '@/components/ui/ScreenHeader'

type TaskMode = 'one_time' | 'recurring'

const RECURRENCE_OPTIONS: { value: Recurrence; label: string; icon: string }[] = [
  { value: 'daily', label: 'Daily', icon: 'today-outline' },
  { value: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar' },
  { value: 'quarterly', label: 'Quarterly', icon: 'time-outline' },
  { value: 'semi_annual', label: '6 Months', icon: 'hourglass-outline' },
  { value: 'yearly', label: 'Yearly', icon: 'repeat-outline' },
]

const PRIORITY_OPTIONS: { value: TaskPriority | null; label: string; color: string }[] = [
  { value: null, label: 'None', color: '#8e8e93' },
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

const NewTaskScreen = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSection, setSelectedSection] = useState<SectionProps | null>(null)
  const [mode, setMode] = useState<TaskMode>('one_time')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [deadlineTime, setDeadlineTime] = useState<string | null>(null)
  const [recurrence, setRecurrence] = useState<Recurrence>('daily')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [requiresPicture, setRequiresPicture] = useState(false)
  const [priority, setPriority] = useState<TaskPriority | null>(null)

  const { user } = useAuth()
  const { sections } = useSectionQuery()
  const router = useRouter()
  const { createTask } = useTasksMutation()

  if (!user) return null

  const writableSections = sections?.filter((s) => s.role !== 'viewer') ?? []

  const handleCreate = () => {
    if (!title.trim() || !selectedSection) return

    if (mode === 'one_time') {
      createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        sectionId: selectedSection.id,
        userId: user.id,
        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
        deadlineTime: deadlineTime || undefined,
        requiresPicture: requiresPicture || undefined,
        priority: priority || undefined,
      })
    } else {
      createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        sectionId: selectedSection.id,
        userId: user.id,
        recurrence,
        deadlineTime: deadlineTime || undefined,
        requiresPicture: requiresPicture || undefined,
        priority: priority || undefined,
      })
    }
    router.back()
  }

  const isValid = title.trim().length > 0 && selectedSection !== null

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
        <ScreenHeader
          title='New Task'
          subtitle='Create a clear checklist item with the right schedule and proof requirements.'
        />

        <FormField label='Title'>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder='What needs to be done?'
            autoFocus
          />
        </FormField>

        <FormField
          label='Description'
          hint='Optional instructions for how the task should be completed.'
        >
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder='Add details (optional)'
            multiline
          />
        </FormField>

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

        {/* Mode toggle: One-time / Recurring */}
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
                  minimumDate={new Date()}
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

        {/* Section picker */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>Section</Text>
          {writableSections.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name='layers-outline' size={24} color='#c7c7cc' />
              <Text style={s.emptyStateText}>
                No sections available. Create a section first.
              </Text>
            </View>
          ) : (
            <View style={s.sectionList}>
              {writableSections.map((sec) => {
                const isSelected = selectedSection?.id === sec.id
                return (
                  <Pressable
                    key={sec.id}
                    style={[
                      s.sectionOption,
                      isSelected && s.sectionOptionSelected,
                    ]}
                    onPress={() => setSelectedSection(sec)}
                  >
                    <View style={s.sectionOptionLeft}>
                      <View
                        style={[
                          s.radioOuter,
                          isSelected && s.radioOuterSelected,
                        ]}
                      >
                        {isSelected && <View style={s.radioInner} />}
                      </View>
                      <Text
                        style={[
                          s.sectionOptionText,
                          isSelected && s.sectionOptionTextSelected,
                        ]}
                      >
                        {sec.name}
                      </Text>
                    </View>
                    <Text style={s.sectionRoleBadge}>{sec.role}</Text>
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create button */}
      <View style={s.footer}>
        <AppButton
          label='Create Task'
          onPress={handleCreate}
          tone='primary'
          disabled={!isValid}
          icon={<Ionicons name='add-circle' size={20} color='#fff' />}
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
    padding: layout.screenPadding,
    paddingBottom: 120,
    gap: layout.formGap,
  },
  fieldGroup: {
    gap: layout.fieldGap,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
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
  sectionList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    overflow: 'hidden',
  },
  sectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  sectionOptionSelected: {
    backgroundColor: colors.primary + '08',
  },
  sectionOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  sectionOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sectionOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  sectionRoleBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
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
})

export default NewTaskScreen
