import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AppButton from '@/components/ui/AppButton'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { useLogbookTemplatesQuery } from '@/hooks/useLogbookQuery'
import { colors, spacing, typography } from '@/styles/theme'

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'No entries yet'

const LogbookScreen = () => {
  const router = useRouter()
  const { templates, isLoading, isError, error } = useLogbookTemplatesQuery()

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

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.title}>Manager Logbook</Text>
          <Text style={s.subtitle}>
            Capture shift notes, handoffs, incidents, and custom operational reports in one place.
          </Text>
          <View style={s.heroAction}>
            <AppButton
              label='New Log Type'
              accessibilityLabel='Create log type'
              onPress={() => router.push('/(tabs)/logbook/new')}
              icon={<Ionicons name='add-circle' size={18} color='#fff' />}
              style={s.createButton}
            />
          </View>
        </View>

        {templates.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No log types yet'
              description='Create your first log type so managers can start recording operational context.'
              icon='book-outline'
            />
          </AppCard>
        ) : (
          templates.map((template) => (
            <Pressable
              key={template.id}
              onPress={() => router.push(`/(tabs)/logbook/${template.id}`)}
            >
              <AppCard style={s.card}>
                <View style={s.cardHeader}>
                  <View style={s.cardCopy}>
                    <Text style={s.cardTitle}>{template.title}</Text>
                    {!!template.description && (
                      <Text style={s.cardDescription}>{template.description}</Text>
                    )}
                  </View>
                  <Ionicons name='chevron-forward' size={18} color='#c7c7cc' />
                </View>
                <View style={s.metaRow}>
                  {template.isSystem && (
                    <View style={s.pill}>
                      <Text style={s.pillText}>General</Text>
                    </View>
                  )}
                  <View style={s.pill}>
                    <Text style={s.pillText}>{template.entryCount} entries</Text>
                  </View>
                </View>
                <Text style={s.preview}>{template.lastEntryPreview || 'No entries yet.'}</Text>
                <Text style={s.timestamp}>
                  {template.lastAuthorName ? `${template.lastAuthorName} • ` : ''}
                  {formatDateTime(template.lastEntryAt)}
                </Text>
              </AppCard>
            </Pressable>
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
  hero: { gap: 4 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { fontSize: 14, lineHeight: 20, color: colors.textSecondary, maxWidth: 420 },
  heroAction: { marginTop: spacing.sm, alignItems: 'flex-start' },
  createButton: { minWidth: 152 },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  cardCopy: { flex: 1, gap: 4 },
  cardTitle: { ...typography.h4, color: colors.text },
  cardDescription: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  preview: { fontSize: 14, lineHeight: 20, color: colors.text },
  timestamp: { fontSize: 12, color: colors.textMuted },
  errorText: { fontSize: 16, color: colors.text },
})

export default LogbookScreen
