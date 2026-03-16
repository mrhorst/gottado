import { useAuth } from '@/context/auth/AuthContext'
import { useWorkspace } from '@/context/workspace/WorkspaceContext'
import { useTasksQuery } from '@/hooks/useTasksQuery'
import { useAuditDashboardQuery } from '@/hooks/useAuditDashboardQuery'
import { useCompletionsByUserQuery } from '@/hooks/useTaskHistoryQuery'
import ScreenMotion from '@/components/ui/ScreenMotion'
import { colors, spacing } from '@/styles/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const todayIso = () => new Date().toISOString().split('T')[0]

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const Dashboard = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { org } = useWorkspace()
  const { tasks, isLoading: tasksLoading } = useTasksQuery()
  const { dashboard, isLoading: auditLoading } = useAuditDashboardQuery()
  const { completionsByUser, isLoading: usersLoading } = useCompletionsByUserQuery(7)

  if (!user || !org) return null

  const today = todayIso()
  const pending = tasks.filter((t) => !t.complete)
  const overdue = pending.filter((t) => !!t.dueDate && t.dueDate < today)
  const dueToday = pending.filter((t) => t.dueDate === today)
  const recurring = pending.filter((t) => !!t.recurrence)

  const prioritized = [...pending]
    .sort((a, b) => {
      const aOverdue = a.dueDate && a.dueDate < today ? 1 : 0
      const bOverdue = b.dueDate && b.dueDate < today ? 1 : 0
      if (aOverdue !== bOverdue) return bOverdue - aOverdue

      const aDate = a.dueDate ?? '9999-12-31'
      const bDate = b.dueDate ?? '9999-12-31'
      if (aDate !== bDate) return aDate.localeCompare(bDate)

      return a.title.localeCompare(b.title)
    })
    .slice(0, 5)

  const pendingActions = dashboard?.pendingActionsCount ?? 0
  const averageScore = dashboard?.averageScore ?? null
  const followUps = dashboard?.upcomingFollowUps.length ?? 0
  const teamTop = completionsByUser?.users?.slice(0, 3) ?? []
  const loading = tasksLoading || auditLoading

  return (
    <ScreenMotion>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.hero}>
          <Text style={s.greeting}>{greeting()}, {user.name.split(' ')[0]}</Text>
          <View style={s.orgRow}>
            <Ionicons name='business-outline' size={13} color='#8e8e93' />
            <Text style={s.orgText}>{org.name}</Text>
          </View>
        </View>

        <View style={s.focusCard}>
          <Text style={s.sectionTitle}>Today Focus</Text>
          <View style={s.kpiGrid}>
            <Kpi label='Overdue' value={overdue.length} tone='danger' />
            <Kpi label='Due Today' value={dueToday.length} tone='warn' />
            <Kpi label='Pending' value={pending.length} tone='neutral' />
            <Kpi label='Actions' value={pendingActions} tone='accent' />
          </View>
        </View>

        <View style={s.quickRow}>
          <Pressable
            style={[s.quickButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/tasks/new')}
          >
            <Ionicons name='add-circle-outline' size={17} color='#fff' />
            <Text style={s.quickButtonText}>New Task</Text>
          </Pressable>
          <Pressable
            style={[s.quickButton, { backgroundColor: '#34C759' }]}
            onPress={() => router.push('/(tabs)/audits/quick')}
          >
            <Ionicons name='flash-outline' size={17} color='#fff' />
            <Text style={s.quickButtonText}>Quick Audit</Text>
          </Pressable>
        </View>

        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.sectionTitle}>Priority Tasks</Text>
            <Pressable onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={s.linkText}>View all</Text>
            </Pressable>
          </View>
          {loading ? (
            <ActivityIndicator size='small' color={colors.primary} />
          ) : prioritized.length === 0 ? (
            <Text style={s.emptyText}>No pending tasks right now.</Text>
          ) : (
            prioritized.map((task, idx) => (
              <Pressable
                key={task.id}
                style={[s.row, idx === prioritized.length - 1 && s.lastRow]}
                onPress={() => router.push(`/(tabs)/tasks/details/${task.id}`)}
              >
                <View style={s.rowLeft}>
                  <View
                    style={[
                      s.dot,
                      task.dueDate && task.dueDate < today
                        ? s.dotDanger
                        : task.dueDate === today
                          ? s.dotWarn
                          : s.dotNeutral,
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.taskTitle}>{task.title}</Text>
                    <Text style={s.taskMeta}>
                      {task.sectionName}
                      {task.recurrence ? ` • ${task.recurrence}` : ''}
                      {task.dueDate ? ` • ${task.dueDate}` : ''}
                    </Text>
                  </View>
                </View>
                <Ionicons name='chevron-forward' size={16} color='#c7c7cc' />
              </Pressable>
            ))
          )}
        </View>

        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.sectionTitle}>Team Momentum</Text>
            <Text style={s.metaCaption}>Last 7 days</Text>
          </View>
          {usersLoading ? (
            <ActivityIndicator size='small' color={colors.primary} />
          ) : teamTop.length === 0 ? (
            <Text style={s.emptyText}>No completion data yet.</Text>
          ) : (
            teamTop.map((member, idx) => (
              <View key={member.userId} style={[s.row, idx === teamTop.length - 1 && s.lastRow]}>
                <Text style={s.taskTitle}>{member.userName}</Text>
                <Text style={s.countValue}>{member.count}</Text>
              </View>
            ))
          )}
        </View>

        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.sectionTitle}>Audit Snapshot</Text>
            <Pressable onPress={() => router.push('/(tabs)/audits')}>
              <Text style={s.linkText}>Open</Text>
            </Pressable>
          </View>
          <View style={s.auditGrid}>
            <View style={s.auditMetric}>
              <Text style={s.auditValue}>{averageScore ?? '--'}</Text>
              <Text style={s.auditLabel}>Avg Score</Text>
            </View>
            <View style={s.auditMetric}>
              <Text style={s.auditValue}>{followUps}</Text>
              <Text style={s.auditLabel}>Follow-ups</Text>
            </View>
            <View style={s.auditMetric}>
              <Text style={s.auditValue}>{recurring.length}</Text>
              <Text style={s.auditLabel}>Recurring Tasks</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenMotion>
  )
}

const Kpi = ({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'danger' | 'warn' | 'neutral' | 'accent'
}) => {
  const toneColor =
    tone === 'danger'
      ? colors.iOSred
      : tone === 'warn'
        ? '#FF9500'
        : tone === 'accent'
          ? colors.primary
          : '#8e8e93'

  return (
    <View style={s.kpiCard}>
      <Text style={[s.kpiValue, { color: toneColor }]}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  hero: {
    gap: 4,
    marginBottom: spacing.xs,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orgText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
  },
  focusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
    marginBottom: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    flexGrow: 1,
    minWidth: 120,
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  metaCaption: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotDanger: {
    backgroundColor: colors.iOSred,
  },
  dotWarn: {
    backgroundColor: '#FF9500',
  },
  dotNeutral: {
    backgroundColor: '#c7c7cc',
  },
  taskTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  taskMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#8e8e93',
  },
  countValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  emptyText: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    fontSize: 14,
    color: '#8e8e93',
  },
  auditGrid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    gap: 10,
  },
  auditMetric: {
    flex: 1,
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  auditValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  auditLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
    marginTop: 2,
  },
})

export default Dashboard
