import { useAuth } from '@/context/auth/AuthContext'
import { getTasks } from '@/services/taskService'
import { useQuery } from '@tanstack/react-query'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { colors, spacing, typography } from '@/styles/theme'
import { UserProfile } from '@/types/user'
import { useWorkspace } from '@/context/workspace/WorkspaceContext'
import { router } from 'expo-router'
import { useAuditDashboardQuery } from '@/hooks/useAuditDashboardQuery'
import { Ionicons } from '@expo/vector-icons'
import { useCompletionsByUserQuery } from '@/hooks/useTaskHistoryQuery'
import { useState } from 'react'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  orgChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  orgChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createTaskText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  zoneName: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  zoneScore: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  zoneTrend: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  auditRunCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  auditRunName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  auditRunDate: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scorePillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 15,
    color: '#8e8e93',
    marginTop: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  userRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  userCountText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  periodChipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  periodChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  periodChipActive: {
    backgroundColor: colors.primary,
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
  },
  periodChipTextActive: {
    color: '#fff',
  },
})

const PRESTO_ZONE_ORDER = [
  'People',
  'Routines',
  'Execution',
  'Standards',
  'Team Leadership',
  'Operations & Upkeep',
]

const sortZoneEntries = (entries: [string, number][]) =>
  entries.sort(([a], [b]) => {
    const ai = PRESTO_ZONE_ORDER.indexOf(a)
    const bi = PRESTO_ZONE_ORDER.indexOf(b)
    return (ai >= 0 ? ai : 999) - (bi >= 0 ? bi : 999)
  })

const getScoreColor = (score: number | null) => {
  if (score === null) return '#8e8e93'
  if (score >= 80) return '#34C759'
  if (score >= 50) return '#FF9500'
  return colors.iOSred
}

const AVATAR_COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA']

const Dashboard = () => {
  const { user } = useAuth()
  const { org, clearOrganization } = useWorkspace()
  const { width } = useWindowDimensions()
  const isWide = width > 700
  const [scoreLimit, setScoreLimit] = useState(5)

  if (!user || !org) return null

  return (
    <View style={styles.container}>
      <FlatList
        data={[1]}
        keyExtractor={() => 'dashboard'}
        ListHeaderComponent={
          <>
            <DashboardHeader
              user={user}
              orgName={org.name}
              onOrgPress={clearOrganization}
            />
            <View
              style={[
                styles.scrollContent,
                isWide && { maxWidth: 800, alignSelf: 'center', width: '100%' },
              ]}
            >
              {/* Create Task button */}
              <Pressable
                style={styles.createTaskButton}
                onPress={() => router.push('/(tabs)/tasks/new')}
              >
                <Ionicons name='add-circle' size={20} color='#fff' />
                <Text style={styles.createTaskText}>New Task</Text>
              </Pressable>

              <PendingTasksCard user={user} />
              <CompletionsByUserCard />
              <AuditSummarySection scoreLimit={scoreLimit} />
            </View>
          </>
        }
        renderItem={() => null}
      />
    </View>
  )
}

const DashboardHeader = ({
  user,
  orgName,
  onOrgPress,
}: {
  user: UserProfile
  orgName: string
  onOrgPress: () => void
}) => {
  const { dashboard } = useAuditDashboardQuery(5)
  const pendingActions = dashboard?.pendingActionsCount ?? 0

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Good{getTimeGreeting()},</Text>
          <Text style={styles.userName}>{user.name.split(' ')[0]}</Text>
        </View>
        <Pressable style={styles.orgChip} onPress={onOrgPress}>
          <Ionicons name='business-outline' size={14} color='#fff' />
          <Text style={styles.orgChipText}>{orgName}</Text>
        </Pressable>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{pendingActions}</Text>
        <Text style={styles.statLabel}>Pending Actions</Text>
      </View>
    </View>
  )
}

const getTimeGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return ' morning'
  if (h < 17) return ' afternoon'
  return ' evening'
}

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
]

const CompletionsByUserCard = () => {
  const [days, setDays] = useState(7)
  const { completionsByUser, isLoading } = useCompletionsByUserQuery(days)

  return (
    <>
      <Text style={styles.sectionTitle}>Completed by User</Text>
      <View style={styles.card}>
        <View style={styles.periodChipRow}>
          {PERIOD_OPTIONS.map((opt) => {
            const isActive = days === opt.value
            return (
              <Pressable
                key={opt.value}
                style={[styles.periodChip, isActive && styles.periodChipActive]}
                onPress={() => setDays(opt.value)}
              >
                <Text
                  style={[
                    styles.periodChipText,
                    isActive && styles.periodChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
        {isLoading ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : !completionsByUser?.users.length ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <Ionicons name='checkmark-done-outline' size={28} color='#c7c7cc' />
            <Text style={styles.emptyText}>No completions yet</Text>
          </View>
        ) : (
          completionsByUser.users.map((u, i, arr) => (
            <View
              key={u.userId}
              style={[
                styles.userRow,
                i === arr.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.userRowLeft}>
                <View
                  style={[
                    styles.userAvatar,
                    { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] },
                  ]}
                >
                  <Text style={styles.userAvatarText}>
                    {u.userName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userNameText}>{u.userName}</Text>
              </View>
              <Text style={styles.userCountText}>{u.count}</Text>
            </View>
          ))
        )}
      </View>
    </>
  )
}

const PendingTasksCard = ({ user }: { user: UserProfile }) => {
  const {
    data: tasks = [],
    isLoading,
  } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: getTasks,
    enabled: !!user,
  })

  const pendingCount = tasks.filter((t) => !t.complete).length
  const completedCount = tasks.filter((t) => t.complete).length
  const total = tasks.length

  return (
    <>
      <Text style={styles.sectionTitle}>Tasks Overview</Text>
      <Pressable style={styles.card} onPress={() => router.push('/(tabs)/tasks')}>
        {isLoading ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : (
          <View style={styles.cardRow}>
            <View style={[styles.cardIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name='list' size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                {pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} pending
              </Text>
              <Text style={styles.cardSubtitle}>
                {completedCount} of {total} completed
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#c7c7cc' />
          </View>
        )}
      </Pressable>
    </>
  )
}

const AuditSummarySection = ({ scoreLimit }: { scoreLimit: number }) => {
  const { dashboard, isLoading } = useAuditDashboardQuery(scoreLimit)

  if (isLoading) {
    return (
      <>
        <Text style={styles.sectionTitle}>Audit Performance</Text>
        <View style={styles.card}>
          <ActivityIndicator size='small' color={colors.primary} />
        </View>
      </>
    )
  }

  if (!dashboard || dashboard.recentRuns.length === 0) {
    return (
      <>
        <Text style={styles.sectionTitle}>Audit Performance</Text>
        <View style={styles.emptyCard}>
          <Ionicons name='clipboard-outline' size={32} color='#c7c7cc' />
          <Text style={styles.emptyText}>No audits yet</Text>
        </View>
      </>
    )
  }

  const { zoneScores, previousZoneScores, recentRuns, upcomingFollowUps } =
    dashboard

  return (
    <>
      {/* Zone breakdown */}
      {zoneScores && Object.keys(zoneScores).length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Zone Breakdown</Text>
          <View style={styles.card}>
            {sortZoneEntries(Object.entries(zoneScores)).map(([zone, score], i, arr) => {
              const prev = previousZoneScores?.[zone]
              const diff = prev != null ? score - prev : null
              return (
                <View
                  key={zone}
                  style={[
                    styles.zoneRow,
                    i === arr.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.zoneName}>{zone}</Text>
                  <Text
                    style={[styles.zoneScore, { color: getScoreColor(score) }]}
                  >
                    {score}%
                  </Text>
                  {diff !== null && (
                    <Text
                      style={[
                        styles.zoneTrend,
                        { color: diff >= 0 ? '#34C759' : colors.iOSred },
                      ]}
                    >
                      {diff >= 0 ? '+' : ''}
                      {diff}
                    </Text>
                  )}
                </View>
              )
            })}
          </View>
        </>
      )}

      {/* Recent runs */}
      <Text style={styles.sectionTitle}>Recent Audits</Text>
      <View style={styles.card}>
        {recentRuns.slice(0, 5).map((run, i) => (
          <Pressable
            key={run.id}
            style={[
              styles.auditRunCard,
              i === Math.min(recentRuns.length, 5) - 1 && {
                borderBottomWidth: 0,
              },
            ]}
            onPress={() => router.push(`/(tabs)/audits/runs/${run.id}`)}
          >
            <View>
              <Text style={styles.auditRunName}>{run.templateName}</Text>
              {run.completedAt && (
                <Text style={styles.auditRunDate}>
                  {new Date(run.completedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
            {run.overallScore !== null && (
              <View
                style={[
                  styles.scorePill,
                  { backgroundColor: getScoreColor(run.overallScore) },
                ]}
              >
                <Text style={styles.scorePillText}>{run.overallScore}%</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Upcoming follow-ups */}
      {upcomingFollowUps.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Follow-ups</Text>
          <View style={styles.card}>
            {upcomingFollowUps.map((fu, i) => (
              <View
                key={fu.id}
                style={[
                  styles.auditRunCard,
                  i === upcomingFollowUps.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name='calendar-outline' size={18} color={colors.primary} />
                  <Text style={styles.auditRunName}>
                    {new Date(fu.scheduledDate).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.primary,
                    textTransform: 'capitalize',
                  }}
                >
                  {fu.status}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  )
}

export default Dashboard
