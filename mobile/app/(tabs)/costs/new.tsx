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
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useCreateCostRecordMutation } from '@/hooks/useCostsMutation'
import { useCostReferencesQuery } from '@/hooks/useCostsQuery'
import { colors, layout, radius, spacing, typography } from '@/styles/theme'
import type { CostKind } from '@/types/costs'

const getToday = () => new Date().toISOString().slice(0, 10)

const KIND_OPTIONS: { id: CostKind; label: string }[] = [
  { id: 'waste', label: 'Waste' },
  { id: 'purchase', label: 'Purchase' },
  { id: 'vendor_issue', label: 'Vendor Issue' },
]

export default function NewCostRecordScreen() {
  const router = useRouter()
  const { areas, isLoading, isError, error } = useCostReferencesQuery()
  const { createCostRecord, isPending } = useCreateCostRecordMutation()

  const [kind, setKind] = useState<CostKind>('waste')
  const [title, setTitle] = useState('')
  const [entryDate, setEntryDate] = useState(getToday)
  const [amount, setAmount] = useState('')
  const [areaId, setAreaId] = useState<number | null>(null)
  const [vendorName, setVendorName] = useState('')
  const [quantityLabel, setQuantityLabel] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (areaId == null && areas.length > 0) {
      setAreaId(areas[0].id)
    }
  }, [areaId, areas])

  const handleSubmit = () => {
    if (!title.trim() || !amount.trim()) return

    createCostRecord(
      {
        kind,
        title: title.trim(),
        entryDate,
        amount: amount.trim(),
        areaId,
        vendorName: vendorName.trim() || undefined,
        quantityLabel: quantityLabel.trim() || undefined,
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
            title='Create a Cost Record'
            subtitle='Capture spend leakage or purchasing events while the details are still fresh.'
          />

          <FormField label='Type'>
            <View style={s.optionList}>
              {KIND_OPTIONS.map((option) => {
                const isSelected = option.id === kind
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setKind(option.id)}
                    style={[s.optionChip, isSelected && s.optionChipSelected]}
                  >
                    <Text style={[s.optionChipText, isSelected && s.optionChipTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </FormField>

          <FormField label='Title'>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder='e.g., Spoiled produce'
              autoFocus
            />
          </FormField>

          <View style={s.inlineGrid}>
            <FormField label='Date'>
              <Input value={entryDate} onChangeText={setEntryDate} placeholder='YYYY-MM-DD' />
            </FormField>
            <FormField label='Amount'>
              <Input value={amount} onChangeText={setAmount} placeholder='e.g., 86.50' />
            </FormField>
          </View>

          <FormField label='Area'>
            <View style={s.optionList}>
              {areas.map((area) => {
                const isSelected = area.id === areaId
                return (
                  <Pressable
                    key={area.id}
                    onPress={() => setAreaId(area.id)}
                    style={[s.optionChip, isSelected && s.optionChipSelected]}
                  >
                    <Text style={[s.optionChipText, isSelected && s.optionChipTextSelected]}>
                      {area.name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </FormField>

          <FormField label='Vendor'>
            <Input
              value={vendorName}
              onChangeText={setVendorName}
              placeholder='Fresh Greens Co.'
            />
          </FormField>

          <FormField label='Quantity / Context'>
            <Input
              value={quantityLabel}
              onChangeText={setQuantityLabel}
              placeholder='e.g., 12 lbs romaine'
            />
          </FormField>

          <FormField label='Notes'>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder='Describe what happened or what was purchased.'
              multiline
            />
          </FormField>

          <AppCard style={s.previewCard}>
            <Text style={s.previewEyebrow}>Preview</Text>
            <Text style={s.previewTitle}>{title.trim() || 'New cost record'}</Text>
            <Text style={s.previewMeta}>
              {KIND_OPTIONS.find((option) => option.id === kind)?.label} • $
              {amount.trim() || '0.00'}
            </Text>
          </AppCard>
        </ScrollView>

        <View style={s.footer}>
          <AppButton
            label='Save Record'
            accessibilityLabel='Save cost record'
            onPress={handleSubmit}
            disabled={!title.trim() || !amount.trim()}
            loading={isPending}
            icon={<Ionicons name='save-outline' size={18} color='#fff' />}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenMotion>
  )
}

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
    gap: layout.formGap,
  },
  inlineGrid: { gap: spacing.md },
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
  previewCard: { gap: 6 },
  previewEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewTitle: { ...typography.h4, color: colors.text },
  previewMeta: { ...typography.body2, color: colors.textSecondary },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  errorText: { fontSize: 16, color: colors.text },
})
