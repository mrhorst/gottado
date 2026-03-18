import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenMotion from '@/components/ui/ScreenMotion'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useLogbookEntriesQuery } from '@/hooks/useLogbookQuery'
import { colors, spacing, typography } from '@/styles/theme'

const LogbookDetailScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const templateId = Number(id)
  const { template, entries, isLoading, isError, error } = useLogbookEntriesQuery(templateId)

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  if (isError) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <Text style={s.errorText}>Error: {error?.message}</Text>
        </View>
      </ScreenMotion>
    )
  }

  if (!template) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <EmptyState title='Log not found' icon='book-outline' />
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <ScreenHeader
          title={template.title}
          subtitle={template.description || 'Operational notes and handoff context.'}
        />
        <View style={s.heroAction}>
          <AppButton
            label='New Entry'
            accessibilityLabel='Create log entry'
            onPress={() => router.push(`/(tabs)/logbook/${templateId}/new-entry`)}
            icon={<Ionicons name='create-outline' size={18} color='#fff' />}
            style={s.createButton}
          />
        </View>

        {entries.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No entries yet'
              description='Add the first entry for this log type.'
              icon='reader-outline'
            />
          </AppCard>
        ) : (
          entries.map((entry) => (
            <AppCard key={entry.id} style={s.entryCard}>
              <View style={s.entryHeader}>
                <Text style={s.entryTitle}>{entry.title || 'Log Entry'}</Text>
                <Text style={s.entryDate}>{entry.entryDate}</Text>
              </View>
              <Text style={s.entryBody}>{entry.body}</Text>
              <Text style={s.entryMeta}>
                {entry.authorName} • {new Date(entry.createdAt).toLocaleString()}
              </Text>
            </AppCard>
          ))
        )}
      </ScrollView>
    </ScreenMotion>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  content: { padding: spacing.md, paddingBottom: 120, gap: spacing.md },
  heroAction: { alignItems: 'flex-start' },
  createButton: { minWidth: 128 },
  entryCard: { gap: spacing.sm },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  entryTitle: { ...typography.h4, color: colors.text, flex: 1 },
  entryDate: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  entryBody: { fontSize: 14, lineHeight: 20, color: colors.text },
  entryMeta: { fontSize: 12, color: colors.textMuted },
  errorText: { fontSize: 16, color: colors.text },
})

export default LogbookDetailScreen
