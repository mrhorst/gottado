import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenMotion from '@/components/ui/ScreenMotion'
import DateStrip from '@/components/labor/DateStrip'
import ShiftTimeline from '@/components/labor/ShiftTimeline'
import { usePublishDayMutation, useUnpublishDayMutation } from '@/hooks/useLaborMutation'
import { useDayPartsQuery, useLaborReferencesQuery, useLaborShiftsQuery } from '@/hooks/useLaborQuery'
import { colors, layout, radius, spacing, typography } from '@/styles/theme'
import type { LaborShift } from '@/types/labor'

export default function LaborScreen() {
  const router = useRouter()
  const { shifts, scheduleStatus, selectedDate, setSelectedDate, isLoading, isError, error } =
    useLaborShiftsQuery()
  const { teams } = useLaborReferencesQuery()
  const { dayParts } = useDayPartsQuery()
  const { publishDay, isPending: isPublishing } = usePublishDayMutation()
  const { unpublishDay, isPending: isUnpublishing } = useUnpublishDayMutation()

  const handleShiftPress = (shift: LaborShift) => {
    router.push(`/(tabs)/labor/${shift.id}`)
  }

  const handleEmptyPress = (time: string, teamId: number) => {
    router.push({
      pathname: '/(tabs)/labor/new',
      params: { date: selectedDate, startTime: time, teamId: String(teamId) },
    })
  }

  const handlePublish = () => {
    publishDay(selectedDate)
  }

  const handleUnpublish = () => {
    Alert.alert('Revert to Draft', 'Team members will no longer see this schedule.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revert', style: 'destructive', onPress: () => unpublishDay(selectedDate) },
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

  const isDraft = scheduleStatus === 'draft'

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Header row with settings gear */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.eyebrow}>Manager Planning</Text>
            <Text style={s.title}>Labor</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/labor/settings')}
            hitSlop={12}
            accessibilityLabel='Day parts settings'
          >
            <Ionicons name='settings-outline' size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Date selector */}
        <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} />

        {/* Status banner */}
        {isDraft ? (
          <Pressable
            style={s.draftBanner}
            onPress={handlePublish}
            disabled={isPublishing}
          >
            <View style={s.bannerLeft}>
              <Ionicons name='eye-off-outline' size={16} color={colors.warning} />
              <Text style={s.draftText}>Draft — only managers can see this</Text>
            </View>
            <View style={s.publishChip}>
              <Text style={s.publishChipText}>
                {isPublishing ? 'Publishing…' : 'Publish'}
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable style={s.publishedBanner} onPress={handleUnpublish} disabled={isUnpublishing}>
            <Ionicons name='checkmark-circle' size={16} color={colors.success} />
            <Text style={s.publishedText}>Published</Text>
          </Pressable>
        )}

        {/* Timeline or empty state */}
        {shifts.length === 0 && teams.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No shifts planned yet'
              description='Tap + to add the first shift for this day.'
              icon='time-outline'
            />
          </AppCard>
        ) : (
          <ShiftTimeline
            shifts={shifts}
            dayParts={dayParts}
            teams={teams}
            scheduleStatus={scheduleStatus}
            onShiftPress={handleShiftPress}
            onEmptyPress={handleEmptyPress}
          />
        )}

        {/* Shift list summary below timeline */}
        {shifts.length > 0 && (
          <View style={s.shiftList}>
            <Text style={s.listHeader}>
              {shifts.length} shift{shifts.length !== 1 ? 's' : ''} planned
            </Text>
            {shifts.map((shift) => (
              <Pressable
                key={shift.id}
                style={s.shiftRow}
                onPress={() => handleShiftPress(shift)}
              >
                <View
                  style={[
                    s.shiftDot,
                    { backgroundColor: shift.teamColor ?? colors.textMuted },
                  ]}
                />
                <View style={s.shiftInfo}>
                  <Text style={s.shiftTitle} numberOfLines={1}>
                    {shift.title}
                  </Text>
                  <Text style={s.shiftMeta}>
                    {shift.startTime}–{shift.endTime}
                    {shift.assignedUserName ? ` · ${shift.assignedUserName}` : ''}
                  </Text>
                </View>
                <Ionicons name='chevron-forward' size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={s.fab}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/labor/new',
            params: { date: selectedDate },
          })
        }
        accessibilityLabel='Create new shift'
      >
        <Ionicons name='add' size={28} color='#fff' />
      </Pressable>
    </ScreenMotion>
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
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    gap: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8E1',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  draftText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F57F17',
  },
  publishChip: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  publishChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  publishedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  publishedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  shiftList: {
    gap: 2,
  },
  listHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 2,
  },
  shiftDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shiftInfo: {
    flex: 1,
    gap: 2,
  },
  shiftTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  shiftMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl + 60,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
  },
})
