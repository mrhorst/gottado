import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useCreateShiftMutation } from '@/hooks/useLaborMutation'
import { useLaborReferencesQuery } from '@/hooks/useLaborQuery'
import { colors, layout, radius, spacing, typography } from '@/styles/theme'

const getToday = () => new Date().toISOString().slice(0, 10)

export default function NewShiftScreen() {
  const router = useRouter()
  const { areas, teams, members, isLoading, isError, error } = useLaborReferencesQuery()
  const { createShift, isPending } = useCreateShiftMutation()

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [shiftDate, setShiftDate] = useState(getToday)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [areaId, setAreaId] = useState<number | null>(null)
  const [assignedTeamId, setAssignedTeamId] = useState<number | null>(null)
  const [assignedUserId, setAssignedUserId] = useState<number | null>(null)

  useEffect(() => {
    if (areaId == null && areas.length > 0) {
      setAreaId(areas[0].id)
    }
  }, [areaId, areas])

  const selectedArea = useMemo(
    () => areas.find((area) => area.id === areaId) ?? null,
    [areaId, areas]
  )

  useEffect(() => {
    if (assignedTeamId == null) {
      if (selectedArea?.teamId) {
        setAssignedTeamId(selectedArea.teamId)
        return
      }
      if (teams.length > 0) {
        setAssignedTeamId(teams[0].id)
      }
    }
  }, [assignedTeamId, selectedArea, teams])

  useEffect(() => {
    if (assignedUserId == null && members.length > 0) {
      setAssignedUserId(members[0].id)
    }
  }, [assignedUserId, members])

  const handleSubmit = () => {
    if (!title.trim()) return

    createShift(
      {
        title: title.trim(),
        shiftDate,
        startTime,
        endTime,
        areaId,
        assignedTeamId,
        assignedUserId,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => router.back(),
      }
    )
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

  return (
    <ScreenMotion>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={s.content}>
          <ScreenHeader
            title='Create a Shift'
            subtitle='Plan who is covering what, when, and where for this day.'
          />

          <FormField label='Shift Title'>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder='e.g., Open kitchen line'
              autoFocus
            />
          </FormField>

          <View style={s.inlineGrid}>
            <FormField label='Date'>
              <Input value={shiftDate} onChangeText={setShiftDate} placeholder='YYYY-MM-DD' />
            </FormField>
            <FormField label='Start Time'>
              <Input value={startTime} onChangeText={setStartTime} placeholder='09:00' />
            </FormField>
            <FormField label='End Time'>
              <Input value={endTime} onChangeText={setEndTime} placeholder='17:00' />
            </FormField>
          </View>

          <FormField label='Area' hint='Pick where this shift belongs operationally.'>
            <OptionList
              options={areas.map((area) => ({ id: area.id, label: area.name }))}
              selectedId={areaId}
              onSelect={(id) => {
                setAreaId(id)
                const nextArea = areas.find((area) => area.id === id)
                if (nextArea?.teamId) setAssignedTeamId(nextArea.teamId)
              }}
            />
          </FormField>

          <FormField label='Team' hint='Ownership layer. Defaults from the selected area.'>
            <OptionList
              options={teams.map((team) => ({ id: team.id, label: team.name }))}
              selectedId={assignedTeamId}
              onSelect={setAssignedTeamId}
            />
          </FormField>

          <FormField label='Assigned Person' hint='Optional frontline owner for this shift.'>
            <OptionList
              options={members.map((member) => ({ id: member.id, label: member.name }))}
              selectedId={assignedUserId}
              onSelect={setAssignedUserId}
            />
          </FormField>

          <FormField label='Notes' hint='Optional context for the manager or team lead.'>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder='Optional shift notes for the manager or lead.'
              multiline
            />
          </FormField>

          <AppCard style={s.previewCard}>
            <Text style={s.previewEyebrow}>Planned Coverage</Text>
            <Text style={s.previewTitle}>{title.trim() || 'New shift'}</Text>
            <Text style={s.previewMeta}>
              {startTime} - {endTime} {selectedArea ? `• ${selectedArea.name}` : ''}
            </Text>
          </AppCard>
        </ScrollView>

        <View style={s.footer}>
          <AppButton
            label='Save Shift'
            accessibilityLabel='Save shift'
            onPress={handleSubmit}
            disabled={!title.trim()}
            loading={isPending}
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
  previewCard: {
    gap: 6,
  },
  previewEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewTitle: {
    ...typography.h4,
    color: colors.text,
  },
  previewMeta: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  emptyOptionText: {
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
