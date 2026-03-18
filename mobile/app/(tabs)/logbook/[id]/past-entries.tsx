import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ScreenMotion from '@/components/ui/ScreenMotion'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useLogbookEntryDatesQuery } from '@/hooks/useLogbookQuery'
import { colors, spacing, typography } from '@/styles/theme'

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const PastEntriesScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const templateId = Number(id)
  const { dates, isLoading } = useLogbookEntryDatesQuery(templateId)

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
        <ScreenHeader
          title='Past Entries'
          subtitle='All dates with logbook entries.'
        />

        {dates.length === 0 ? (
          <AppCard>
            <EmptyState
              title='No entries yet'
              description='No logbook entries have been recorded.'
              icon='reader-outline'
            />
          </AppCard>
        ) : (
          dates.map((dateStr) => (
            <Pressable
              key={dateStr}
              onPress={() => router.push(`/(tabs)/logbook/${templateId}?date=${dateStr}`)}
            >
              <AppCard style={s.dateCard}>
                <View style={s.dateRow}>
                  <View style={s.dateInfo}>
                    <Text style={s.dateText}>{formatDate(dateStr)}</Text>
                    <Text style={s.dateRaw}>{dateStr}</Text>
                  </View>
                  <Ionicons name='chevron-forward' size={18} color='#c7c7cc' />
                </View>
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
  dateCard: { gap: spacing.xs },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfo: { flex: 1, gap: 2 },
  dateText: { ...typography.h4, color: colors.text },
  dateRaw: { fontSize: 12, color: colors.textMuted },
})

export default PastEntriesScreen
