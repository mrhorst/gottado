import {
  ActivityIndicator,
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
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useCostRecordsQuery } from '@/hooks/useCostsQuery'
import { exportCostRecordsCsv } from '@/services/costsService'
import { colors, layout, radius, spacing, typography } from '@/styles/theme'
import type { CostFilter, CostKind } from '@/types/costs'

const formatDateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

const KIND_LABEL: Record<CostKind, string> = {
  waste: 'Waste',
  purchase: 'Purchase',
  vendor_issue: 'Vendor Issue',
}

export default function CostsScreen() {
  const router = useRouter()
  const {
    selectedDate,
    kindFilter,
    setKindFilter,
    goToPreviousDate,
    goToNextDate,
    records,
    summary,
    isLoading,
    isError,
    error,
  } = useCostRecordsQuery()

  const handleExport = async () => {
    const csv = await exportCostRecordsCsv({
      from: selectedDate,
      to: selectedDate,
      kind: kindFilter,
    })

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cost-records-${selectedDate}-${kindFilter}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    }
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
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <ScreenHeader
          eyebrow='Indirect Ops'
          title='Costs'
          subtitle='Track waste, purchases, and vendor issues before they disappear into the day.'
          action={
            <AppButton
              label='New Record'
              accessibilityLabel='Create cost record'
              onPress={() => router.push('/(tabs)/costs/new')}
              icon={<Ionicons name='add-circle' size={18} color='#fff' />}
              style={s.createButton}
            />
          }
        />

        <AppCard style={s.summaryCard}>
          <View style={s.summaryDateRow}>
            <Pressable
              accessibilityLabel='Previous cost date'
              onPress={goToPreviousDate}
              style={s.iconCircle}
            >
              <Ionicons name='chevron-back' size={16} color={colors.text} />
            </Pressable>
            <View style={s.summaryBlock}>
              <Text style={s.summaryEyebrow}>Entry Date</Text>
              <Text style={s.summaryTitle}>{formatDateLabel(selectedDate)}</Text>
            </View>
            <Pressable
              accessibilityLabel='Next cost date'
              onPress={goToNextDate}
              style={s.iconCircle}
            >
              <Ionicons name='chevron-forward' size={16} color={colors.text} />
            </Pressable>
          </View>
          <View style={s.summaryRight}>
            <View style={s.amountPill}>
              <Text style={s.amountPillValue}>${summary.totalAmount}</Text>
              <Text style={s.amountPillLabel}>tracked</Text>
            </View>
            <Pressable
              accessibilityLabel='Export cost records'
              onPress={handleExport}
              style={s.exportButton}
            >
              <Ionicons name='download-outline' size={16} color={colors.primary} />
              <Text style={s.exportButtonText}>Export</Text>
            </Pressable>
          </View>
        </AppCard>

        <View style={s.filterRow}>
          {(['all', 'waste', 'purchase', 'vendor_issue'] as CostFilter[]).map((value) => {
            const isSelected = value === kindFilter
            const label =
              value === 'all'
                ? 'All'
                : value === 'vendor_issue'
                  ? 'Vendor Issues'
                  : KIND_LABEL[value]
            return (
              <Pressable
                key={value}
                onPress={() => setKindFilter(value)}
                accessibilityLabel={`Filter costs by ${label}`}
                style={[s.filterChip, isSelected && s.filterChipSelected]}
              >
                <Text style={[s.filterChipText, isSelected && s.filterChipTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View style={s.kpiRow}>
          <Kpi label='Waste' value={summary.wasteCount} />
          <Kpi label='Purchases' value={summary.purchaseCount} />
          <Kpi label='Vendor Issues' value={summary.vendorIssueCount} />
        </View>

        {records.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No cost records yet'
              description='Log waste, purchases, or vendor issues as they happen.'
              icon='cash-outline'
            />
          </AppCard>
        ) : (
          records.map((record) => (
            <Pressable key={record.id}>
              <AppCard style={s.recordCard}>
                <View style={s.recordHeader}>
                  <View style={s.recordCopy}>
                    <Text style={s.recordTitle}>{record.title}</Text>
                    <Text style={s.recordAmount}>${record.amount}</Text>
                  </View>
                  <View style={s.kindPill}>
                    <Text style={s.kindPillText}>{KIND_LABEL[record.kind]}</Text>
                  </View>
                </View>

                <View style={s.metaRow}>
                  {!!record.areaName && <MetaPill label={record.areaName} icon='layers-outline' />}
                  {!!record.vendorName && (
                    <MetaPill label={record.vendorName} icon='storefront-outline' />
                  )}
                  {!!record.quantityLabel && (
                    <MetaPill label={record.quantityLabel} icon='cube-outline' />
                  )}
                </View>

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

const MetaPill = ({ label, icon }: { label: string; icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={s.metaPill}>
    <Ionicons name={icon} size={14} color={colors.textSecondary} />
    <Text style={s.metaPillText}>{label}</Text>
  </View>
)

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  createButton: { alignSelf: 'flex-start', marginTop: spacing.sm },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  summaryBlock: { gap: 4 },
  summaryRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  summaryEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryTitle: { ...typography.h4, color: colors.text },
  amountPill: {
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  amountPillValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  amountPillLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
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
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  kpiRow: { flexDirection: 'row', gap: spacing.sm },
  kpiCard: { flex: 1, gap: 4, alignItems: 'center' },
  kpiValue: { ...typography.h4, color: colors.text },
  kpiLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },
  recordCard: { gap: spacing.sm },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  recordCopy: { flex: 1, gap: 4 },
  recordTitle: { ...typography.h4, color: colors.text },
  recordAmount: { ...typography.body2, color: colors.primary, fontWeight: '700' },
  kindPill: {
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  kindPillText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaPillText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  notes: { ...typography.body2, color: colors.textSecondary },
  errorText: { fontSize: 16, color: colors.text },
})
