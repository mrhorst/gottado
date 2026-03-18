import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, layout, spacing } from '@/styles/theme'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import AppButton from '@/components/ui/AppButton'
import { useLogbookMutation } from '@/hooks/useLogbookMutation'

const NewLogTypeScreen = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()
  const { createTemplate, isCreatingTemplate } = useLogbookMutation()

  const handleCreate = () => {
    if (!title.trim()) return
    createTemplate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => router.back(),
      }
    )
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={s.content}>
        <View style={s.iconContainer}>
          <View style={s.iconBg}>
            <Ionicons name='book' size={32} color={colors.primary} />
          </View>
        </View>

        <ScreenHeader
          title='Create a Log Type'
          subtitle='Add a custom manager log like Dining Room Reports, Shift Handoffs, or VIP Notes.'
        />

        <FormField label='Title'>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder='e.g., Dining Room Reports'
            autoFocus
          />
        </FormField>

        <FormField label='Description' hint='Optional context about what belongs in this log.'>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder='Front-of-house manager notes'
            multiline
          />
        </FormField>
      </View>

      <View style={s.footer}>
        <AppButton
          label='Create Log Type'
          onPress={handleCreate}
          disabled={!title.trim()}
          loading={isCreatingTemplate}
          icon={<Ionicons name='add-circle' size={18} color='#fff' />}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: layout.screenPadding, gap: layout.formGap },
  iconContainer: { alignItems: 'center', marginTop: spacing.xl },
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

export default NewLogTypeScreen
