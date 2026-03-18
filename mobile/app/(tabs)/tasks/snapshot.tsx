import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useDailySnapshotQuery } from '@/hooks/useTaskHistoryQuery'
import { colors, spacing, typography } from '@/styles/theme'
const API_URL = process.env.EXPO_PUBLIC_API_URL || ''

const resolveImageUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_URL}${url}`
  return url
}

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
  areaCard: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 14,
    overflow: 'hidden',
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  areaHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  areaTitle: {
    ...typography.h4,
    color: colors.text,
  },
  areaCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  completionCard: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
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
  completionIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  indicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surfaceMuted,
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
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
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(28, 28, 30, 0.28)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailCopy: {
    flex: 1,
    gap: 4,
  },
  detailEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailTitle: {
    ...typography.h3,
    color: colors.text,
  },
  detailMeta: {
    ...typography.body2,
    color: colors.textMuted,
  },
  detailClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  detailGrid: {
    gap: spacing.sm,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    ...typography.body1,
    color: colors.text,
  },
  detailPhoto: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
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
  const [selectedCompletionId, setSelectedCompletionId] = useState<number | null>(null)
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({})
  const { snapshot, isLoading } = useDailySnapshotQuery(date)
  const selectedCompletion = useMemo(
    () =>
      snapshot?.completions.find((completion) => completion.id === selectedCompletionId) ?? null,
    [selectedCompletionId, snapshot]
  )
  const groupedAreas = useMemo(() => {
    if (!snapshot) return []

    const grouped = new Map<string, typeof snapshot.completions>()
    snapshot.completions.forEach((completion) => {
      const existing = grouped.get(completion.sectionName) ?? []
      existing.push(completion)
      grouped.set(completion.sectionName, existing)
    })

    return Array.from(grouped.entries()).map(([sectionName, completions]) => ({
      sectionName,
      completions,
    }))
  }, [snapshot])

  useEffect(() => {
    setExpandedAreas((current) => {
      const next = { ...current }
      groupedAreas.forEach((group) => {
        if (next[group.sectionName] == null) {
          next[group.sectionName] = true
        }
      })
      return next
    })
  }, [groupedAreas])

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
          data={groupedAreas}
          keyExtractor={(item) => item.sectionName}
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
          renderItem={({ item }) => {
            const isExpanded = expandedAreas[item.sectionName] ?? true
            const taskCountLabel = `${item.completions.length} task${item.completions.length === 1 ? '' : 's'}`

            return (
              <View style={styles.areaCard}>
                <Pressable
                  accessibilityLabel={`Toggle area ${item.sectionName}`}
                  style={styles.areaHeader}
                  onPress={() =>
                    setExpandedAreas((current) => ({
                      ...current,
                      [item.sectionName]: !isExpanded,
                    }))
                  }
                >
                  <View style={styles.areaHeaderLeft}>
                    <Text style={styles.areaTitle}>{item.sectionName}</Text>
                    <Text style={styles.areaCount}>{taskCountLabel}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>

                {isExpanded &&
                  item.completions.map((completion) => (
                    <Pressable
                      key={completion.id}
                      accessibilityLabel={`Open completion details for ${completion.taskTitle}`}
                      onPress={() => setSelectedCompletionId(completion.id)}
                    >
                      <View style={styles.completionCard}>
                        <View
                          style={[
                            styles.statusIcon,
                            {
                              backgroundColor:
                                completion.onTime === true
                                  ? '#34C75920'
                                  : completion.onTime === false
                                    ? colors.iOSred + '20'
                                    : '#8e8e9320',
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              completion.onTime === true
                                ? 'checkmark'
                                : completion.onTime === false
                                  ? 'time-outline'
                                  : 'remove'
                            }
                            size={18}
                            color={
                              completion.onTime === true
                                ? '#34C759'
                                : completion.onTime === false
                                  ? colors.iOSred
                                  : '#8e8e93'
                            }
                          />
                        </View>
                        <View style={styles.completionInfo}>
                          <Text style={styles.completionTitle}>{completion.taskTitle}</Text>
                          <Text style={styles.completionMeta}>
                            {completion.recurrence
                              ? `${completion.recurrence.replace('_', ' ')} \u2022 `
                              : ''}
                            {completion.completedByName}
                          </Text>
                          <View style={styles.completionIndicators}>
                            {completion.requiresPicture && (
                              <IndicatorPill
                                icon='camera-outline'
                                label='Requires photo'
                              />
                            )}
                            {!!completion.pictureUrl && (
                              <IndicatorPill
                                icon='image-outline'
                                label='Photo uploaded'
                              />
                            )}
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.completionTime,
                            {
                              color:
                                completion.onTime === true
                                  ? '#34C759'
                                  : completion.onTime === false
                                    ? colors.iOSred
                                    : '#8e8e93',
                            },
                          ]}
                        >
                          {new Date(completion.completedAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
              </View>
            )
          }}
        />
      )}

      {selectedCompletion && (
        <Pressable style={styles.overlay} onPress={() => setSelectedCompletionId(null)}>
          <Pressable style={styles.detailSheet} onPress={() => undefined}>
            <View style={styles.detailHeader}>
              <View style={styles.detailCopy}>
                <Text style={styles.detailEyebrow}>{selectedCompletion.sectionName}</Text>
                <Text style={styles.detailTitle}>{selectedCompletion.taskTitle}</Text>
                <Text style={styles.detailMeta}>
                  {new Date(selectedCompletion.completedAt).toLocaleString()}
                </Text>
              </View>
              <Pressable
                accessibilityLabel='Close completion details'
                style={styles.detailClose}
                onPress={() => setSelectedCompletionId(null)}
              >
                <Ionicons name='close' size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.detailGrid}>
              <DetailRow label='Completed by' value={selectedCompletion.completedByName} />
              <DetailRow
                label='Status'
                value={
                  selectedCompletion.onTime === true
                    ? 'Completed on time'
                    : selectedCompletion.onTime === false
                      ? 'Completed late'
                      : 'Completed with no deadline'
                }
              />
              <DetailRow
                label='Photo requirement'
                value={selectedCompletion.requiresPicture ? 'Requires photo' : 'No photo required'}
              />
            </View>

            {!!selectedCompletion.pictureUrl ? (
              <View style={styles.detailGrid}>
                <Text style={styles.detailLabel}>Photo uploaded</Text>
                <Image
                  source={{ uri: resolveImageUrl(String(selectedCompletion.pictureUrl)) }}
                  style={styles.detailPhoto}
                  resizeMode='cover'
                />
              </View>
            ) : selectedCompletion.requiresPicture ? (
              <DetailRow label='Photo uploaded' value='No photo uploaded' />
            ) : null}
          </Pressable>
        </Pressable>
      )}
    </View>
  )
}

const IndicatorPill = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
  <View style={styles.indicatorPill}>
    <Ionicons name={icon} size={12} color={colors.textSecondary} />
    <Text style={styles.indicatorText}>{label}</Text>
  </View>
)

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
)
