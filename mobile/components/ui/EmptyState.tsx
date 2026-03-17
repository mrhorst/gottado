import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@/styles/theme'

const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon?: ReactNode
  title: string
  description?: string
}) => {
  return (
    <View style={s.container}>
      {icon}
      <Text style={s.title}>{title}</Text>
      {!!description && <Text style={s.description}>{description}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textMuted,
    textAlign: 'center',
  },
  description: {
    ...typography.body2,
    color: '#aeaeb2',
    textAlign: 'center',
  },
})

export default EmptyState
