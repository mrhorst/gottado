import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useState, useCallback } from 'react'
import { useAuditTemplatesQuery } from '@/hooks/useAuditTemplatesQuery'
import { useAuditRunsMutation } from '@/hooks/useAuditRunsMutation'
import { colors, spacing, typography } from '@/styles/theme'
import type { AuditTemplate } from '@/types/audit'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  templateName: {
    ...typography.h3,
    marginBottom: 4,
  },
  templateDesc: {
    ...typography.body2,
    color: '#8e8e93',
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  editButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...typography.h2,
    color: '#8e8e93',
  },
})

export default function TemplatesScreen() {
  const { templates, isLoading, refetch } = useAuditTemplatesQuery()
  const { startRun, isStarting } = useAuditRunsMutation()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleStartAudit = async (template: AuditTemplate) => {
    const run = await startRun(template.id)
    router.push(`/(tabs)/audits/runs/conduct/${run.id}`)
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => String(item.id)}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No templates yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.templateName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.templateDesc}>{item.description}</Text>
            )}
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.startButton}
                onPress={() => handleStartAudit(item)}
                disabled={isStarting}
              >
                <Text style={styles.startButtonText}>Start Audit</Text>
              </Pressable>
              <Pressable
                style={styles.editButton}
                onPress={() =>
                  router.push(`/(tabs)/audits/templates/${item.id}`)
                }
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(tabs)/audits/templates/create')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  )
}
