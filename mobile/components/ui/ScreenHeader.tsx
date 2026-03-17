import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@/styles/theme'

const ScreenHeader = ({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) => {
  return (
    <View style={s.container}>
      <View style={s.copy}>
        {!!eyebrow && <Text style={s.eyebrow}>{eyebrow}</Text>}
        <Text style={s.title}>{title}</Text>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  copy: {
    gap: 4,
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
  subtitle: {
    ...typography.body2,
    color: colors.textMuted,
  },
})

export default ScreenHeader
