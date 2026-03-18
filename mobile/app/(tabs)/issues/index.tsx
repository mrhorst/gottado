import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useIssueRecordsQuery } from '@/hooks/useIssuesQuery'
import { colors, layout, radius, spacing, typography } from '@/styles/theme'
import type { IssueCategory, IssueSeverity } from '@/types/issues'

const CATEGORY_LABEL: Record<IssueCategory, string> = {
  guest: 'Guest',
  staffing: 'Staffing',
  maintenance: 'Maintenance',
  inventory: 'Inventory',
  financial: 'Financial',
}

const SEVERITY_TONE: Record<IssueSeverity, string> = {
  low: '#8E8E93',
  medium: colors.warning,
  high: '#FF6B00',
  critical: colors.iOSred,
}

export default function IssuesScreen() {
  const router = useRouter()
  const {
    categoryFilter,
    setCategoryFilter,
    records,
    summary,
    isLoading,
    isError,
    error,
  } = useIssueRecordsQuery()

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
          eyebrow='Indirect Ops'
          title='Issues'
          subtitle='Track operational problems that need visibility, accountability, or follow-up.'
          action={
            <AppButton
              label='New Issue'
              accessibilityLabel='Create issue'
              onPress={() => router.push('/(tabs)/issues/new')}
              icon={<Ionicons name='add-circle' size={18} color='#fff' />}
              style={s.createButton}
            />
          }
        />

        <View style={s.kpiRow}>
          <Kpi label='Total' value={summary.total} />
          <Kpi label='Follow-up' value={summary.followUpCount} />
          <Kpi label='High Severity' value={summary.highSeverityCount} />
        </View>

        <View style={s.filterRow}>
          {(['all', 'guest', 'staffing', 'maintenance', 'inventory', 'financial'] as const).map(
            (value) => {
              const label = value === 'all' ? 'All' : CATEGORY_LABEL[value]
              const isSelected = value === categoryFilter
              return (
                <Pressable
                  key={value}
                  onPress={() => setCategoryFilter(value)}
                  style={[s.filterChip, isSelected && s.filterChipSelected]}
                >
                  <Text style={[s.filterChipText, isSelected && s.filterChipTextSelected]}>
                    {label}
                  </Text>
                </Pressable>
              )
            }
          )}
        </View>

        {records.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No issues logged yet'
              description='Capture complaints, outages, staffing problems, and other incidents here.'
              icon='alert-circle-outline'
            />
          </AppCard>
        ) : (
          records.map((record) => (
            <Pressable key={record.id}>
              <AppCard style={s.recordCard}>
                <View style={s.recordHeader}>
                  <View style={s.recordCopy}>
                    <Text style={s.recordTitle}>{record.title}</Text>
                  </View>
                  <View
                    style={[
                      s.severityPill,
                      { backgroundColor: `${SEVERITY_TONE[record.severity]}20` },
                    ]}
                  >
                    <Text style={[s.severityText, { color: SEVERITY_TONE[record.severity] }]}>
                      {record.severity}
                    </Text>
                  </View>
                </View>

                <View style={s.metaRow}>
                  <View style={s.metaPill}>
                    <Text style={s.metaPillText}>{record.areaName ?? 'No area'}</Text>
                  </View>
                  <View style={s.metaPill}>
                    <Text style={s.metaPillText}>{CATEGORY_LABEL[record.category]}</Text>
                  </View>
                </View>

                {record.followUpRequired && (
                  <View style={s.followUpPill}>
                    <Ionicons name='flag-outline' size={14} color={colors.primary} />
                    <Text style={s.followUpText}>Follow-up required</Text>
                  </View>
                )}

                {!!record.notes && <Text style={s.notes}>{record.notes}</Text>}
              </AppCard>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenMotion>
  )
}

const Kpi = ({ label, value }: { label: string; value: number }) => (
  <AppCard style={s.kpiCard}>
    <Text style={s.kpiValue}>{value}</Text>
    <Text style={s.kpiLabel}>{label}</Text>
  </AppCard>
)

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  content: { padding: layout.screenPadding, paddingBottom: 120, gap: layout.screenGap },
  createButton: { alignSelf: 'flex-start', marginTop: spacing.sm },
  kpiRow: { flexDirection: 'row', gap: spacing.sm },
  kpiCard: { flex: 1, gap: 4, alignItems: 'center' },
  kpiValue: { ...typography.h4, color: colors.text },
  kpiLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  filterChipTextSelected: { color: '#fff' },
  recordCard: { gap: spacing.sm },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  recordCopy: { flex: 1, gap: 4 },
  recordTitle: { ...typography.h4, color: colors.text },
  severityPill: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  severityText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaPill: {
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaPillText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  followUpPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  followUpText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  notes: { ...typography.body2, color: colors.textSecondary },
  errorText: { fontSize: 16, color: colors.text },
})
