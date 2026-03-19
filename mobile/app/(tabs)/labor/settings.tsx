import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ScreenMotion from '@/components/ui/ScreenMotion'
import {
  useCreateDayPartMutation,
  useDeleteDayPartMutation,
  useUpdateDayPartMutation,
} from '@/hooks/useLaborMutation'
import { useDayPartsQuery } from '@/hooks/useLaborQuery'
import { colors, layout, radius, spacing, typography } from '@/styles/theme'
import type { DayPart } from '@/types/labor'

export default function DayPartsSettingsScreen() {
  const { dayParts, isLoading, isError, error } = useDayPartsQuery()
  const { createDayPart, isPending: isCreating } = useCreateDayPartMutation()
  const { updateDayPart, isPending: isUpdating } = useUpdateDayPartMutation()
  const { deleteDayPart } = useDeleteDayPartMutation()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const resetForm = () => {
    setName('')
    setStartTime('')
    setEndTime('')
    setEditingId(null)
    setShowAddForm(false)
  }

  const startEditing = (part: DayPart) => {
    setEditingId(part.id)
    setName(part.name)
    setStartTime(part.startTime)
    setEndTime(part.endTime)
    setShowAddForm(false)
  }

  const startAdding = () => {
    resetForm()
    setShowAddForm(true)
  }

  const handleSave = () => {
    if (!name.trim() || !startTime.trim() || !endTime.trim()) return

    if (editingId != null) {
      updateDayPart(
        { id: editingId, payload: { name: name.trim(), startTime, endTime } },
        { onSuccess: resetForm }
      )
    } else {
      createDayPart(
        { name: name.trim(), startTime, endTime, sortOrder: dayParts.length },
        { onSuccess: resetForm }
      )
    }
  }

  const handleDelete = (part: DayPart) => {
    Alert.alert('Delete Day Part', `Remove "${part.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteDayPart(part.id),
      },
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

  const isEditing = editingId != null || showAddForm

  return (
    <ScreenMotion>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={s.content}>
          <ScreenHeader
            title='Day Parts'
            subtitle='Define your operating periods (e.g. Lunch, Dinner). This shapes the timeline view.'
            action={
              !isEditing ? (
                <AppButton
                  label='Add Day Part'
                  accessibilityLabel='Add day part'
                  onPress={startAdding}
                  icon={<Ionicons name='add-circle' size={18} color='#fff' />}
                  style={s.addButton}
                />
              ) : undefined
            }
          />

          {dayParts.length === 0 && !showAddForm && (
            <AppCard>
              <EmptyState
                title='No day parts yet'
                description='Add your first day part to structure the labor timeline.'
                icon='time-outline'
              />
            </AppCard>
          )}

          {dayParts.map((part) =>
            editingId === part.id ? (
              <DayPartForm
                key={part.id}
                name={name}
                startTime={startTime}
                endTime={endTime}
                onNameChange={setName}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
                onSave={handleSave}
                onCancel={resetForm}
                isSaving={isUpdating}
                saveLabel='Update'
              />
            ) : (
              <DayPartRow
                key={part.id}
                part={part}
                onEdit={() => startEditing(part)}
                onDelete={() => handleDelete(part)}
              />
            )
          )}

          {showAddForm && (
            <DayPartForm
              name={name}
              startTime={startTime}
              endTime={endTime}
              onNameChange={setName}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              onSave={handleSave}
              onCancel={resetForm}
              isSaving={isCreating}
              saveLabel='Add'
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenMotion>
  )
}

const DayPartRow = ({
  part,
  onEdit,
  onDelete,
}: {
  part: DayPart
  onEdit: () => void
  onDelete: () => void
}) => (
  <AppCard style={s.row}>
    <View style={s.rowMain}>
      <Text style={s.rowName}>{part.name}</Text>
      <Text style={s.rowTime}>
        {part.startTime} – {part.endTime}
      </Text>
    </View>
    <View style={s.rowActions}>
      <Pressable onPress={onEdit} hitSlop={8}>
        <Ionicons name='pencil-outline' size={20} color={colors.textSecondary} />
      </Pressable>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Ionicons name='trash-outline' size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  </AppCard>
)

const DayPartForm = ({
  name,
  startTime,
  endTime,
  onNameChange,
  onStartTimeChange,
  onEndTimeChange,
  onSave,
  onCancel,
  isSaving,
  saveLabel,
}: {
  name: string
  startTime: string
  endTime: string
  onNameChange: (v: string) => void
  onStartTimeChange: (v: string) => void
  onEndTimeChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  saveLabel: string
}) => (
  <AppCard style={s.formCard}>
    <FormField label='Name'>
      <Input value={name} onChangeText={onNameChange} placeholder='e.g. Lunch' autoFocus />
    </FormField>
    <View style={s.timeRow}>
      <FormField label='Start'>
        <Input value={startTime} onChangeText={onStartTimeChange} placeholder='08:00' />
      </FormField>
      <FormField label='End'>
        <Input value={endTime} onChangeText={onEndTimeChange} placeholder='17:00' />
      </FormField>
    </View>
    <View style={s.formActions}>
      <AppButton label={saveLabel} onPress={onSave} loading={isSaving} disabled={!name.trim()} />
      <AppButton label='Cancel' onPress={onCancel} tone='neutral' />
    </View>
  </AppCard>
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
    padding: layout.screenPadding,
    paddingBottom: 120,
    gap: layout.screenGap,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  rowName: {
    ...typography.h4,
    color: colors.text,
  },
  rowTime: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formCard: {
    gap: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
  },
})
