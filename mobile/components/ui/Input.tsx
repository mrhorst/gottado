import { TextInput, StyleSheet } from 'react-native'
import { colors, spacing } from '@/styles/theme'

export const Input = (props: any) => {
  return <TextInput {...props} style={[styles.input, props.style]} />
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: 'white',
  },
})
