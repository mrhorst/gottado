import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, layout, spacing } from '@/styles/theme'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import AppButton from '@/components/ui/AppButton'
import { useTeamsMutation } from '@/hooks/useTeamsMutation'

const NewTeamScreen = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()
  const { createTeam, isCreating } = useTeamsMutation()

  const handleCreate = () => {
    if (!name.trim()) return

    createTeam(
      {
        name: name.trim(),
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
            <Ionicons name='people' size={32} color={colors.primary} />
          </View>
        </View>

        <ScreenHeader
          title='Create a Team'
          subtitle='Teams define who owns work across areas without changing access permissions.'
        />

        <FormField label='Team name' hint='Use a name people will recognize immediately.'>
          <Input
            value={name}
            onChangeText={setName}
            placeholder='e.g., AM Kitchen Team'
            autoFocus
            returnKeyType='done'
            onSubmitEditing={handleCreate}
          />
        </FormField>

        <FormField label='Description' hint='Optional context about when or how this team works.'>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder='Morning kitchen crew'
            multiline
          />
        </FormField>
      </View>

      <View style={s.footer}>
        <AppButton
          label='Create Team'
          onPress={handleCreate}
          disabled={!name.trim()}
          loading={isCreating}
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

export default NewTeamScreen
