import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useDailySnapshotQuery } from '@/hooks/useTaskHistoryQuery'
import { colors, spacing, typography } from '@/styles/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  dateText: {
    ...typography.h3,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: spacing.md,
    borderRadius: 14,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  summaryLabel: {
    ...typography.caption,
    marginTop: 4,
  },
  completionCard: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionInfo: {
    flex: 1,
  },
  completionTitle: {
    ...typography.body1,
    fontWeight: '600',
  },
  completionMeta: {
    ...typography.caption,
    marginTop: 2,
  },
  completionTime: {
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...typography.h3,
    color: '#c7c7cc',
    marginTop: spacing.md,
  },
})

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00')
  const today = formatDate(new Date())
  if (dateStr === today) return 'Today'

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === formatDate(yesterday)) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function SnapshotScreen() {
  const [date, setDate] = useState(formatDate(new Date()))
  const { snapshot, isLoading } = useDailySnapshotQuery(date)

  const shiftDate = (days: number) => {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + days)
    setDate(formatDate(d))
  }

  const isToday = date === formatDate(new Date())

  return (
    <View style={styles.container}>
      {/* Date navigation */}
      <View style={styles.dateNav}>
        <Pressable onPress={() => shiftDate(-1)}>
          <Ionicons name='chevron-back' size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
        <Pressable onPress={() => shiftDate(1)} disabled={isToday}>
          <Ionicons
            name='chevron-forward'
            size={24}
            color={isToday ? '#d1d1d6' : colors.primary}
          />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={snapshot?.completions || []}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            snapshot ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: colors.text }]}>
                      {snapshot.summary.total}
                    </Text>
                    <Text style={styles.summaryLabel}>Completed</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: '#34C759' }]}>
                      {snapshot.summary.onTime}
                    </Text>
                    <Text style={styles.summaryLabel}>On Time</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text
                      style={[styles.summaryNumber, { color: colors.iOSred }]}
                    >
                      {snapshot.summary.late}
                    </Text>
                    <Text style={styles.summaryLabel}>Late</Text>
                  </View>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name='checkmark-circle-outline' size={48} color='#d1d1d6' />
              <Text style={styles.emptyText}>No completions this day</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.completionCard}>
              <View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor:
                      item.onTime === true
                        ? '#34C75920'
                        : item.onTime === false
                          ? colors.iOSred + '20'
                          : '#8e8e9320',
                  },
                ]}
              >
                <Ionicons
                  name={
                    item.onTime === true
                      ? 'checkmark'
                      : item.onTime === false
                        ? 'time-outline'
                        : 'remove'
                  }
                  size={18}
                  color={
                    item.onTime === true
                      ? '#34C759'
                      : item.onTime === false
                        ? colors.iOSred
                        : '#8e8e93'
                  }
                />
              </View>
              <View style={styles.completionInfo}>
                <Text style={styles.completionTitle}>{item.taskTitle}</Text>
                <Text style={styles.completionMeta}>
                  {item.sectionName}
                  {item.recurrence
                    ? ` \u2022 ${item.recurrence.replace('_', ' ')}`
                    : ''}
                </Text>
              </View>
              <Text
                style={[
                  styles.completionTime,
                  {
                    color:
                      item.onTime === true
                        ? '#34C759'
                        : item.onTime === false
                          ? colors.iOSred
                          : '#8e8e93',
                  },
                ]}
              >
                {new Date(item.completedAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}
