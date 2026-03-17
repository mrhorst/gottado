import { forwardRef } from 'react'
import { StyleSheet, TextInput, TextInputProps } from 'react-native'
import { colors, radius, spacing, typography } from '@/styles/theme'

export const Input = forwardRef<TextInput, TextInputProps>((props, ref) => {
  const { multiline, style, ...rest } = props

  return (
    <TextInput
      ref={ref}
      {...rest}
      multiline={multiline}
      placeholderTextColor={props.placeholderTextColor ?? colors.textMuted}
      style={[styles.input, multiline && styles.multiline, style]}
    />
  )
})

Input.displayName = 'Input'

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    ...typography.body1,
    color: colors.text,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
})
