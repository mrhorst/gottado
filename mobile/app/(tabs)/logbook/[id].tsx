import { useState } from 'react'
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
import { useLocalSearchParams, useRouter } from 'expo-router'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import ScreenMotion from '@/components/ui/ScreenMotion'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useLogbookDayQuery, useLogbookEntryDatesQuery } from '@/hooks/useLogbookQuery'
import { useLogbookMutation } from '@/hooks/useLogbookMutation'
import { colors, spacing, typography } from '@/styles/theme'

const toDateString = (d: Date) => d.toISOString().slice(0, 10)
const today = () => toDateString(new Date())

const formatDateLabel = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const shiftDate = (dateStr: string, days: number) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

const LogbookDetailScreen = () => {
  const { id, date: dateParam } = useLocalSearchParams<{ id: string; date?: string }>()
  const router = useRouter()
  const templateId = Number(id)

  const [selectedDate, setSelectedDate] = useState(dateParam || today())
  const [isEditing, setIsEditing] = useState(false)
  const [bodyDraft, setBodyDraft] = useState('')

  const isToday = selectedDate === today()
  const { template, entry, isLoading, isError, error } = useLogbookDayQuery(templateId, selectedDate)
  const { dates } = useLogbookEntryDatesQuery(templateId)
  const { upsertEntry, isUpsertingEntry } = useLogbookMutation()

  const earliestDate = dates.length > 0 ? dates[dates.length - 1] : null
  const canGoBack = !earliestDate || selectedDate > earliestDate
  const canGoForward = !isToday

  const handleSave = () => {
    if (!bodyDraft.trim()) return
    upsertEntry(
      { templateId, body: bodyDraft.trim() },
      {
        onSuccess: () => {
          setIsEditing(false)
          setBodyDraft('')
        },
      }
    )
  }

  const startEditing = () => {
    setBodyDraft(entry?.body ?? '')
    setIsEditing(true)
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

  if (!template) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <EmptyState title='Log not found' icon='book-outline' />
        </View>
      </ScreenMotion>
    )
  }

  const dateLabel = isToday
    ? `Today — ${formatDateLabel(selectedDate)}`
    : formatDateLabel(selectedDate)

  const showForm = isToday && (!entry || isEditing)

  return (
    <ScreenMotion>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={s.container} contentContainerStyle={s.content}>
          <ScreenHeader
            title={template.title}
            subtitle={template.description || 'Operational notes and handoff context.'}
          />

          {/* Date navigator */}
          <View style={s.dateNav}>
            <Pressable
              onPress={() => setSelectedDate(shiftDate(selectedDate, -1))}
              disabled={!canGoBack}
              hitSlop={12}
            >
              <Ionicons
                name='chevron-back'
                size={22}
                color={canGoBack ? colors.primary : colors.border}
              />
            </Pressable>
            <Text style={s.dateLabel}>{dateLabel}</Text>
            <Pressable
              onPress={() => setSelectedDate(shiftDate(selectedDate, 1))}
              disabled={!canGoForward}
              hitSlop={12}
            >
              <Ionicons
                name='chevron-forward'
                size={22}
                color={canGoForward ? colors.primary : colors.border}
              />
            </Pressable>
          </View>

          {/* Navigation links */}
          <View style={s.navRow}>
            {dates.length > 0 && (
              <Pressable
                onPress={() => router.push(`/(tabs)/logbook/${templateId}/past-entries`)}
              >
                <Text style={s.navLink}>Past Entries ({dates.length})</Text>
              </Pressable>
            )}
          </View>

          {/* Content area */}
          {showForm ? (
            <AppCard style={s.formCard}>
              <FormField
                label={entry ? 'Edit Entry' : 'Entry'}
                hint='Write the operational note or handoff details here.'
              >
                <Input
                  value={bodyDraft}
                  onChangeText={setBodyDraft}
                  placeholder='Add the details managers need to keep the shift moving.'
                  multiline
                />
              </FormField>
              <View style={s.formActions}>
                {isEditing && (
                  <AppButton
                    label='Cancel'
                    onPress={() => {
                      setIsEditing(false)
                      setBodyDraft('')
                    }}
                    variant='secondary'
                    style={s.cancelButton}
                  />
                )}
                <AppButton
                  label={entry ? 'Save Changes' : 'Save Entry'}
                  onPress={handleSave}
                  disabled={!bodyDraft.trim()}
                  loading={isUpsertingEntry}
                  icon={<Ionicons name='save-outline' size={18} color='#fff' />}
                  style={s.saveButton}
                />
              </View>
            </AppCard>
          ) : entry ? (
            <AppCard style={s.entryCard}>
              <Text style={s.entryBody}>{entry.body}</Text>
              <Text style={s.entryMeta}>
                {entry.authorName} • {new Date(entry.createdAt).toLocaleString()}
              </Text>
              {isToday && (
                <View style={s.entryActions}>
                  <AppButton
                    label='Edit'
                    onPress={startEditing}
                    variant='secondary'
                    icon={<Ionicons name='create-outline' size={16} color={colors.primary} />}
                    style={s.editButton}
                  />
                </View>
              )}
              {!isToday && (
                <Pressable
                  onPress={() =>
                    router.push(
                      `/(tabs)/logbook/${templateId}/history?date=${selectedDate}`
                    )
                  }
                >
                  <Text style={s.navLink}>View Edit History</Text>
                </Pressable>
              )}
            </AppCard>
          ) : (
            <AppCard>
              <EmptyState
                title='No entry for this date'
                description={isToday ? undefined : 'No log was recorded on this day.'}
                icon='reader-outline'
              />
            </AppCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenMotion>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  content: { padding: spacing.md, paddingBottom: 120, gap: spacing.md },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  dateLabel: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  navLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  formCard: { gap: spacing.md },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelButton: { minWidth: 80 },
  saveButton: { minWidth: 128 },
  entryCard: { gap: spacing.sm },
  entryBody: { fontSize: 14, lineHeight: 20, color: colors.text },
  entryMeta: { fontSize: 12, color: colors.textMuted },
  entryActions: { flexDirection: 'row', gap: spacing.sm },
  editButton: { minWidth: 80 },
  errorText: { fontSize: 16, color: colors.text },
})

export default LogbookDetailScreen
