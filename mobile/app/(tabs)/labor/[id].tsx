import { useEffect, useMemo, useState } from 'react'
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
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useDeleteShiftMutation, useUpdateShiftMutation } from '@/hooks/useLaborMutation'
import { useLaborReferencesQuery, useLaborShiftsQuery } from '@/hooks/useLaborQuery'
import { colors, layout, radius, spacing, typography } from '@/styles/theme'

export default function EditShiftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const shiftId = Number(id)
  const router = useRouter()

  const { shifts, isLoading: shiftsLoading } = useLaborShiftsQuery()
  const { areas, teams, members, isLoading: refsLoading } = useLaborReferencesQuery()
  const { updateShift, isPending: isUpdating } = useUpdateShiftMutation()
  const { deleteShift, isPending: isDeleting } = useDeleteShiftMutation()

  const shift = useMemo(() => shifts.find((s) => s.id === shiftId), [shifts, shiftId])

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [areaId, setAreaId] = useState<number | null>(null)
  const [assignedTeamId, setAssignedTeamId] = useState<number | null>(null)
  const [assignedUserId, setAssignedUserId] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (shift && !initialized) {
      setTitle(shift.title)
      setNotes(shift.notes ?? '')
      setStartTime(shift.startTime)
      setEndTime(shift.endTime)
      setAreaId(shift.areaId ?? null)
      setAssignedTeamId(shift.assignedTeamId ?? null)
      setAssignedUserId(shift.assignedUserId ?? null)
      setInitialized(true)
    }
  }, [shift, initialized])

  const handleSave = () => {
    if (!title.trim()) return

    updateShift(
      {
        id: shiftId,
        payload: {
          title: title.trim(),
          startTime,
          endTime,
          areaId,
          assignedTeamId,
          assignedUserId,
          notes: notes.trim() || null,
        },
      },
      { onSuccess: () => router.back() }
    )
  }

  const handleDelete = () => {
    Alert.alert('Delete Shift', 'Remove this shift? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteShift(shiftId, { onSuccess: () => router.back() }),
      },
    ])
  }

  if (shiftsLoading || refsLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  if (!shift) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <Text style={s.errorText}>Shift not found</Text>
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={s.content}>
          <ScreenHeader title='Edit Shift' subtitle='Update shift details or delete it.' />

          <FormField label='Shift Title'>
            <Input value={title} onChangeText={setTitle} placeholder='e.g., Open kitchen line' />
          </FormField>

          <View style={s.inlineGrid}>
            <FormField label='Start Time'>
              <Input value={startTime} onChangeText={setStartTime} placeholder='09:00' />
            </FormField>
            <FormField label='End Time'>
              <Input value={endTime} onChangeText={setEndTime} placeholder='17:00' />
            </FormField>
          </View>

          <FormField label='Area'>
            <OptionList
              options={areas.map((a) => ({ id: a.id, label: a.name }))}
              selectedId={areaId}
              onSelect={(id) => {
                setAreaId(id)
                const nextArea = areas.find((a) => a.id === id)
                if (nextArea?.teamId) setAssignedTeamId(nextArea.teamId)
              }}
            />
          </FormField>

          <FormField label='Team'>
            <OptionList
              options={teams.map((t) => ({ id: t.id, label: t.name }))}
              selectedId={assignedTeamId}
              onSelect={setAssignedTeamId}
            />
          </FormField>

          <FormField label='Assigned Person'>
            <OptionList
              options={members.map((m) => ({ id: m.id, label: m.name }))}
              selectedId={assignedUserId}
              onSelect={setAssignedUserId}
            />
          </FormField>

          <FormField label='Notes'>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder='Optional shift notes.'
              multiline
            />
          </FormField>

          <Pressable onPress={handleDelete} style={s.deleteRow}>
            <Ionicons name='trash-outline' size={18} color={colors.textSecondary} />
            <Text style={s.deleteText}>Delete this shift</Text>
          </Pressable>
        </ScrollView>

        <View style={s.footer}>
          <AppButton
            label='Save Changes'
            accessibilityLabel='Save shift changes'
            onPress={handleSave}
            disabled={!title.trim()}
            loading={isUpdating || isDeleting}
            icon={<Ionicons name='save-outline' size={18} color='#fff' />}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenMotion>
  )
}

const OptionList = ({
  options,
  selectedId,
  onSelect,
}: {
  options: { id: number; label: string }[]
  selectedId: number | null
  onSelect: (id: number) => void
}) => {
  if (options.length === 0) {
    return (
      <AppCard>
        <Text style={s.emptyOptionText}>No options available yet.</Text>
      </AppCard>
    )
  }

  return (
    <View style={s.optionList}>
      {options.map((option) => {
        const isSelected = option.id === selectedId
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[s.optionChip, isSelected && s.optionChipSelected]}
          >
            <Text style={[s.optionChipText, isSelected && s.optionChipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

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
    gap: layout.formGap,
  },
  inlineGrid: {
    gap: spacing.md,
  },
  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  optionChipTextSelected: {
    color: '#fff',
  },
  emptyOptionText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  deleteText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
  },
})
