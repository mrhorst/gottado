import { useEffect, useState } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AppButton from '@/components/ui/AppButton'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useCreateIssueRecordMutation } from '@/hooks/useIssuesMutation'
import { useIssueReferencesQuery } from '@/hooks/useIssuesQuery'
import { colors, layout, radius, spacing } from '@/styles/theme'
import type { IssueCategory, IssueSeverity } from '@/types/issues'

const getToday = () => new Date().toISOString().slice(0, 10)

const CATEGORY_OPTIONS: { id: IssueCategory; label: string }[] = [
  { id: 'guest', label: 'Guest' },
  { id: 'staffing', label: 'Staffing' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'financial', label: 'Financial' },
]

const SEVERITY_OPTIONS: { id: IssueSeverity; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
]

export default function NewIssueScreen() {
  const router = useRouter()
  const { areas, isLoading, isError, error } = useIssueReferencesQuery()
  const { createIssueRecord, isPending } = useCreateIssueRecordMutation()

  const [category, setCategory] = useState<IssueCategory>('guest')
  const [severity, setSeverity] = useState<IssueSeverity>('high')
  const [title, setTitle] = useState('')
  const [entryDate, setEntryDate] = useState(getToday)
  const [areaId, setAreaId] = useState<number | null>(null)
  const [followUpRequired, setFollowUpRequired] = useState(true)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (areaId == null && areas.length > 0) {
      setAreaId(areas[0].id)
    }
  }, [areaId, areas])

  const handleSubmit = () => {
    if (!title.trim()) return

    createIssueRecord(
      {
        category,
        severity,
        title: title.trim(),
        entryDate,
        areaId,
        followUpRequired,
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
            title='Create an Issue'
            subtitle='Capture something that went wrong so it can be tracked and followed up.'
          />

          <FormField label='Category'>
            <OptionList
              options={CATEGORY_OPTIONS}
              selectedId={category}
              onSelect={setCategory}
            />
          </FormField>

          <FormField label='Severity'>
            <OptionList
              options={SEVERITY_OPTIONS}
              selectedId={severity}
              onSelect={setSeverity}
            />
          </FormField>

          <FormField label='Title'>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder='e.g., Guest complaint about cold food'
              autoFocus
            />
          </FormField>

          <FormField label='Date'>
            <Input value={entryDate} onChangeText={setEntryDate} placeholder='YYYY-MM-DD' />
          </FormField>

          <FormField label='Area'>
            <OptionList
              options={areas.map((area) => ({ id: area.id, label: area.name }))}
              selectedId={areaId}
              onSelect={setAreaId}
            />
          </FormField>

          <FormField label='Follow-up'>
            <OptionList
              options={[
                { id: true, label: 'Required' },
                { id: false, label: 'Not Required' },
              ]}
              selectedId={followUpRequired}
              onSelect={setFollowUpRequired}
            />
          </FormField>

          <FormField label='Notes'>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder='Capture what happened and what follow-up is needed.'
              multiline
            />
          </FormField>
        </ScrollView>

        <View style={s.footer}>
          <AppButton
            label='Save Issue'
            accessibilityLabel='Save issue'
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

const OptionList = <T extends string | number | boolean>({
  options,
  selectedId,
  onSelect,
}: {
  options: { id: T; label: string }[]
  selectedId: T | null
  onSelect: (id: T) => void
}) => (
  <View style={s.optionList}>
    {options.map((option) => {
      const isSelected = option.id === selectedId
      return (
        <Pressable
          key={String(option.id)}
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  content: { padding: layout.screenPadding, paddingBottom: 120, gap: layout.formGap },
  optionList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  errorText: { fontSize: 16, color: colors.text },
})
