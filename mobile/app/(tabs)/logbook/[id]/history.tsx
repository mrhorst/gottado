import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenMotion from '@/components/ui/ScreenMotion'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useLogbookDayQuery, useLogbookHistoryQuery } from '@/hooks/useLogbookQuery'
import { colors, spacing, typography } from '@/styles/theme'

const HistoryScreen = () => {
  const { id, date } = useLocalSearchParams<{ id: string; date: string }>()
  const templateId = Number(id)
  const { entry, isLoading: entryLoading } = useLogbookDayQuery(templateId, date)
  const { edits, isLoading: historyLoading } = useLogbookHistoryQuery(templateId, date, true)

  const isLoading = entryLoading || historyLoading

  if (isLoading) {
    return (
      <ScreenMotion>
        <View style={[s.container, s.centered]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </ScreenMotion>
    )
  }

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <ScreenHeader title='Edit History' subtitle={`Entry for ${date}`} />

        {entry && (
          <AppCard style={s.card}>
            <View style={s.versionHeader}>
              <Text style={s.versionLabel}>Current Version</Text>
              <Text style={s.timestamp}>
                {entry.authorName} • {new Date(entry.updatedAt).toLocaleString()}
              </Text>
            </View>
            <Text style={s.body}>{entry.body}</Text>
          </AppCard>
        )}

        {edits.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No previous versions'
              description='This entry has not been edited.'
              icon='time-outline'
            />
          </AppCard>
        ) : (
          edits.map((edit) => (
            <AppCard key={edit.id} style={s.card}>
              <View style={s.versionHeader}>
                <Text style={s.previousLabel}>Previous Version</Text>
                <Text style={s.timestamp}>
                  {edit.editorName} • {new Date(edit.createdAt).toLocaleString()}
                </Text>
              </View>
              <Text style={s.body}>{edit.previousBody}</Text>
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
  card: { gap: spacing.sm },
  versionHeader: { gap: 2 },
  versionLabel: { ...typography.h4, color: colors.primary },
  previousLabel: { ...typography.h4, color: colors.textSecondary },
  timestamp: { fontSize: 12, color: colors.textMuted },
  body: { fontSize: 14, lineHeight: 20, color: colors.text },
})

export default HistoryScreen
