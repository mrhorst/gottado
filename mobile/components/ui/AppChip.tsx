import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '@/styles/theme'

type ChipTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

const CHIP_META: Record<ChipTone, { bg: string; text: string }> = {
  neutral: { bg: colors.background, text: colors.textMuted },
  primary: { bg: `${colors.primary}15`, text: colors.primary },
  success: { bg: `${colors.success}15`, text: colors.success },
  warning: { bg: `${colors.warning}15`, text: colors.warning },
  danger: { bg: `${colors.iOSred}15`, text: colors.iOSred },
}

const AppChip = ({
  label,
  icon,
  tone = 'neutral',
}: {
  label: string
  icon?: ReactNode
  tone?: ChipTone
}) => {
  const meta = CHIP_META[tone]

  return (
    <View style={[s.chip, { backgroundColor: meta.bg }]}>
      {icon}
      <Text style={[s.label, { color: meta.text }]}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
})

export default AppChip
