import { ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native'
import { colors, radius, spacing, typography } from '@/styles/theme'

type ButtonTone = 'primary' | 'success' | 'neutral'

const TONE_BG: Record<ButtonTone, string> = {
  primary: colors.primary,
  success: colors.success,
  neutral: colors.textMuted,
}

const AppButton = ({
  label,
  onPress,
  icon,
  tone = 'primary',
  disabled,
  loading,
  style,
  accessibilityLabel,
}: {
  label: string
  onPress: () => void
  icon?: ReactNode
  tone?: ButtonTone
  disabled?: boolean
  loading?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}) => {
  const isDisabled = !!disabled || !!loading

  return (
    <Pressable
      style={[
        s.button,
        { backgroundColor: isDisabled ? colors.border : TONE_BG[tone] },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size='small' color='#fff' />
      ) : (
        <>
          {icon}
          <Text style={s.text}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}

const s = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    ...typography.button,
    color: '#fff',
  },
})

export default AppButton
