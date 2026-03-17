import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, layout } from '@/styles/theme'

const FormField = ({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) => {
  return (
    <View style={s.field}>
      <View style={s.header}>
        <Text style={s.label}>{label}</Text>
        {!!hint && <Text style={s.hint}>{hint}</Text>}
      </View>
      {children}
    </View>
  )
}

const s = StyleSheet.create({
  field: {
    gap: layout.fieldGap,
  },
  header: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginLeft: 4,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
})

export default FormField
