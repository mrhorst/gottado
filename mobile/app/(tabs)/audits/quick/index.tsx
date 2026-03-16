import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuditTemplatesQuery } from '@/hooks/useAuditTemplatesQuery'
import { useAuditRunsMutation } from '@/hooks/useAuditRunsMutation'
import { colors, spacing, typography } from '@/styles/theme'
import { Ionicons } from '@expo/vector-icons'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  heading: {
    ...typography.h1,
    flex: 1,
  },
  subtitle: {
    ...typography.body2,
    color: '#8e8e93',
    marginBottom: spacing.lg,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  templateName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  templateDesc: {
    ...typography.body2,
    color: '#8e8e93',
    marginBottom: spacing.sm,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body1,
    color: '#8e8e93',
    textAlign: 'center',
  },
})

// Quick audit templates - prioritize common ones
const QUICK_TEMPLATE_PRIORITIES = [
  'Daily Opening Checklist',
  'Daily Closing Checklist',
  'Morning Walkthrough',
  "Manager's Daily",
  'PRESTO Quick Check',
]

export default function QuickAuditSelect() {
  const router = useRouter()
  const { templates, isLoading } = useAuditTemplatesQuery()
  const { startRun } = useAuditRunsMutation()

  const sortedTemplates = [...(templates || [])].sort((a, b) => {
    const aIndex = QUICK_TEMPLATE_PRIORITIES.indexOf(a.name)
    const bIndex = QUICK_TEMPLATE_PRIORITIES.indexOf(b.name)
    // If both in priority list, sort by priority
    if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex
    // Priority items first
    if (aIndex >= 0) return -1
    if (bIndex >= 0) return 1
    // Then alphabetically
    return a.name.localeCompare(b.name)
  })

  const handleSelect = async (templateId: number) => {
    try {
      const result = await startRun(templateId)
      router.push(`/(tabs)/audits/quick/conduct/${result.runId}`)
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name='arrow-back' size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.heading}>Quick Audit</Text>
      </View>

      <Text style={styles.subtitle}>
        Choose a template for a fast 5-minute check. Pass/fail only, no scoring.
      </Text>

      {sortedTemplates.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No templates available. Create one in Templates.
          </Text>
        </View>
      ) : (
        sortedTemplates.map((template) => (
          <Pressable
            key={template.id}
            style={styles.templateCard}
            onPress={() => handleSelect(template.id)}
          >
            <Text style={styles.templateName}>{template.name}</Text>
            {template.description && (
              <Text style={styles.templateDesc}>{template.description}</Text>
            )}
          </Pressable>
        ))
      )}
    </ScrollView>
  )
}
