import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuditRunsQuery } from '@/hooks/useAuditRunsQuery'
import { useState, useCallback } from 'react'
import { colors, spacing, typography } from '@/styles/theme'

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
  },
  templateName: {
    ...typography.body1,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  scoreBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
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

const getScoreColor = (score: number | null) => {
  if (score === null) return '#8e8e93'
  if (score >= 80) return '#34C759'
  if (score >= 50) return '#FF9500'
  return colors.iOSred
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return { backgroundColor: '#34C75920', color: '#34C759' }
    case 'in_progress':
      return { backgroundColor: colors.primary + '20', color: colors.primary }
    case 'cancelled':
      return { backgroundColor: '#8e8e9320', color: '#8e8e93' }
    default:
      return { backgroundColor: '#8e8e9320', color: '#8e8e93' }
  }
}

export default function AuditHistoryScreen() {
  const { runs, isLoading, refetch } = useAuditRunsQuery()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

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
        data={runs}
        keyExtractor={(item) => String(item.id)}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No audits yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status)
          return (
            <Pressable
              style={styles.card}
              onPress={() => {
                if (item.status === 'in_progress') {
                  router.push(`/(tabs)/audits/runs/conduct/${item.id}`)
                } else {
                  router.push(`/(tabs)/audits/runs/${item.id}`)
                }
              }}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.templateName}>{item.templateName}</Text>
                <Text style={styles.date}>
                  {new Date(item.startedAt).toLocaleDateString()}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.backgroundColor },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusStyle.color }]}
                  >
                    {item.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              {item.overallScore !== null && (
                <View
                  style={[
                    styles.scoreBox,
                    { backgroundColor: getScoreColor(item.overallScore) },
                  ]}
                >
                  <Text style={styles.scoreText}>{item.overallScore}</Text>
                </View>
              )}
            </Pressable>
          )
        }}
      />
    </View>
  )
}
