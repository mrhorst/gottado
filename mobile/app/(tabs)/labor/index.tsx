import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useLaborShiftsQuery } from '@/hooks/useLaborQuery'
import { colors, layout, radius, spacing, typography } from '@/styles/theme'

const formatDateLabel = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`)
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function LaborScreen() {
  const router = useRouter()
  const { shifts, selectedDate, isLoading, isError, error } = useLaborShiftsQuery()

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
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <ScreenHeader
          eyebrow='Manager Planning'
          title='Labor'
          subtitle='Plan coverage by day, area, and owner before service starts.'
          action={
            <AppButton
              label='New Shift'
              accessibilityLabel='Create shift'
              onPress={() => router.push('/(tabs)/labor/new')}
              icon={<Ionicons name='add-circle' size={18} color='#fff' />}
              style={s.createButton}
            />
          }
        />

        <AppCard style={s.summaryCard}>
          <View>
            <Text style={s.summaryEyebrow}>Schedule Date</Text>
            <Text style={s.summaryTitle}>{formatDateLabel(selectedDate)}</Text>
          </View>
          <View style={s.summaryPill}>
            <Text style={s.summaryPillValue}>{shifts.length}</Text>
            <Text style={s.summaryPillLabel}>shifts</Text>
          </View>
        </AppCard>

        {shifts.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No shifts planned yet'
              description='Add the first shift plan for this day so managers can see coverage.'
              icon='time-outline'
            />
          </AppCard>
        ) : (
          shifts.map((shift) => (
            <Pressable key={shift.id}>
              <AppCard style={s.shiftCard}>
                <View style={s.shiftHeader}>
                  <View style={s.shiftCopy}>
                    <Text style={s.shiftTitle}>{shift.title}</Text>
                    <Text style={s.shiftTime}>
                      {shift.startTime} - {shift.endTime}
                    </Text>
                  </View>
                  <Ionicons name='time-outline' size={18} color={colors.primary} />
                </View>

                <View style={s.metaRow}>
                  {!!shift.areaName && <MetaPill label={shift.areaName} icon='layers-outline' />}
                  {!!shift.assignedTeamName && (
                    <MetaPill label={shift.assignedTeamName} icon='people-outline' />
                  )}
                  {!!shift.assignedUserName && (
                    <MetaPill label={shift.assignedUserName} icon='person-outline' />
                  )}
                </View>

                {!!shift.notes && <Text style={s.notes}>{shift.notes}</Text>}
              </AppCard>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenMotion>
  )
}

const MetaPill = ({ label, icon }: { label: string; icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={s.metaPill}>
    <Ionicons name={icon} size={14} color={colors.textSecondary} />
    <Text style={s.metaPillText}>{label}</Text>
  </View>
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
  createButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: 4,
  },
  summaryPill: {
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 6,
  },
  summaryPillValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  summaryPillLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  shiftCard: {
    gap: spacing.sm,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  shiftCopy: {
    flex: 1,
    gap: 4,
  },
  shiftTitle: {
    ...typography.h4,
    color: colors.text,
  },
  shiftTime: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  notes: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
  },
})
