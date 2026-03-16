import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, typography } from '@/styles/theme'
import { useSectionMutation } from '@/hooks/useSectionMutation'
import { Ionicons } from '@expo/vector-icons'

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

          <Text style={s.heading}>Create a Section</Text>
          <Text style={s.subheading}>
            Sections help you organize tasks into categories like &quot;Kitchen&quot;,
            &quot;Front of House&quot;, or &quot;Admin&quot;.
          </Text>

          <View style={s.fieldGroup}>
            <Text style={s.label}>Section Name</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder='e.g., Kitchen, Front of House'
              placeholderTextColor='#c7c7cc'
              autoFocus
              returnKeyType='done'
              onSubmitEditing={handleCreate}
            />
          </View>
        </View>

        <View style={s.footer}>
          <Pressable
            style={[s.createButton, !isValid && s.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!isValid}
          >
            <Ionicons
              name='add-circle'
              size={20}
              color={isValid ? '#fff' : '#c7c7cc'}
            />
            <Text
              style={[
                s.createButtonText,
                !isValid && s.createButtonTextDisabled,
              ]}
            >
              Create Section
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    ...typography.h2,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subheading: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  createButtonDisabled: {
    backgroundColor: '#e5e5ea',
  },
  createButtonText: {
    ...typography.button,
    color: '#fff',
  },
  createButtonTextDisabled: {
    color: '#c7c7cc',
  },
})

export default NewSectionScreen
