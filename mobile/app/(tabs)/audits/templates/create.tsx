import { useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuditTemplatesMutation } from '@/hooks/useAuditTemplatesMutation'
import { colors, spacing, typography } from '@/styles/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.lg,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: '#8e8e93',
    marginHorizontal: spacing.md,
  },
  prestoButton: {
    backgroundColor: '#5856D6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  prestoDesc: {
    ...typography.caption,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
})

export default function CreateTemplateScreen() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { createTemplate, seedPresto, isCreating, isSeeding } =
    useAuditTemplatesMutation()
  const router = useRouter()

  const handleCreate = () => {
    createTemplate(
      { name, description: description || undefined },
      {
        onSuccess: () => router.back(),
      }
    )
  }

  const handleSeedPresto = () => {
    seedPresto(undefined, {
      onSuccess: () => router.back(),
    })
  }

  const isValid = name.trim().length > 0

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.prestoButton, isSeeding && styles.buttonDisabled]}
        onPress={handleSeedPresto}
        disabled={isSeeding}
      >
        <Text style={styles.buttonText}>
          {isSeeding ? 'Creating...' : 'Start from PRESTO'}
        </Text>
      </Pressable>
      <Text style={styles.prestoDesc}>
        Pre-built operations excellence template with 6 zones: People, Routines,
        Execution, Standards, Team Leadership, and Operations & Upkeep.
      </Text>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or create custom</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.label}>Template Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder='e.g., Full Restaurant Walkthrough'
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder='What does this audit cover?'
        multiline
      />

      <Pressable
        style={[styles.button, (!isValid || isCreating) && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={!isValid || isCreating}
      >
        <Text style={styles.buttonText}>
          {isCreating ? 'Creating...' : 'Create Template'}
        </Text>
      </Pressable>
    </View>
  )
}
