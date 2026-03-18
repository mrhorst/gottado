import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, layout, spacing } from '@/styles/theme'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import AppButton from '@/components/ui/AppButton'
import { useLogbookMutation } from '@/hooks/useLogbookMutation'

const NewLogEntryScreen = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const templateId = Number(id)
  const { createEntry, isCreatingEntry } = useLogbookMutation()

  const handleCreate = () => {
    if (!body.trim()) return
    createEntry(
      {
        templateId,
        payload: {
          title: title.trim() || undefined,
          body: body.trim(),
        },
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
            <Ionicons name='reader' size={32} color={colors.primary} />
          </View>
        </View>

        <ScreenHeader
          title='Add Log Entry'
          subtitle='Capture what happened, what changed, or what the next manager needs to know.'
        />

        <FormField label='Title' hint='Optional short heading for this entry.'>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder='e.g., Lunch Rush'
          />
        </FormField>

        <FormField label='Entry' hint='Write the operational note or handoff details here.'>
          <Input
            value={body}
            onChangeText={setBody}
            placeholder='Add the details managers need to keep the shift moving.'
            multiline
          />
        </FormField>
      </View>

      <View style={s.footer}>
        <AppButton
          label='Save Entry'
          onPress={handleCreate}
          disabled={!body.trim()}
          loading={isCreatingEntry}
          icon={<Ionicons name='save-outline' size={18} color='#fff' />}
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

export default NewLogEntryScreen
