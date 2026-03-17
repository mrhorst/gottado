import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, layout, spacing } from '@/styles/theme'
import { useSectionMutation } from '@/hooks/useSectionMutation'
import { Ionicons } from '@expo/vector-icons'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import AppButton from '@/components/ui/AppButton'

const NewSectionScreen = () => {
  const [name, setName] = useState('')
  const { addSection } = useSectionMutation()
  const router = useRouter()

  const handleCreate = () => {
    if (!name.trim()) return
    addSection(name.trim(), {
      onSuccess: () => router.back(),
      onError: (error: unknown) => console.error(error),
    })
  }

  const isValid = name.trim().length > 0

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={s.content}>
        <View style={s.iconContainer}>
          <View style={s.iconBg}>
            <Ionicons name='layers' size={32} color={colors.primary} />
          </View>
        </View>

        <ScreenHeader
          title='Create a Section'
          subtitle='Sections help you organize tasks into groups like Kitchen, Front of House, or Admin.'
        />

        <FormField
          label='Section name'
          hint='Use a short name people can scan quickly.'
        >
          <Input
            value={name}
            onChangeText={setName}
            placeholder='e.g., Kitchen, Front of House'
            autoFocus
            returnKeyType='done'
            onSubmitEditing={handleCreate}
          />
        </FormField>
      </View>

      <View style={s.footer}>
        <AppButton
          label='Create Section'
          onPress={handleCreate}
          disabled={!isValid}
          icon={<Ionicons name='add-circle' size={18} color='#fff' />}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: layout.screenPadding,
    gap: layout.formGap,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})

export default NewSectionScreen
