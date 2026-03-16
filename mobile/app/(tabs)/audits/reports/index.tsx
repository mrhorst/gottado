import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { usePartnerReportQuery } from '@/hooks/usePartnerReportQuery'
import { colors, spacing, typography } from '@/styles/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'
import { exportPartnerCSV } from '@/services/auditService'

const PRESTO_ZONES = [
  'People',
  'Routines', 
  'Execution',
  'Standards',
  'Team Leadership',
  'Operations & Upkeep',
]

const PRESTO_COLORS: Record<string, string> = {
  'People': '#FF6B6B',
  'Routines': '#4ECDC4',
  'Execution': '#45B7D1',
  'Standards': '#96CEB4',
  'Team Leadership': '#FFEAA7',
  'Operations & Upkeep': '#DDA0DD',
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: colors.iOSred,
  high: '#FF9500',
  medium: '#FFCC00',
  low: '#34C759',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  // Period selector
  periodSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  periodTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    ...typography.body2,
    color: colors.text,
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  periodRange: {
    ...typography.caption,
    color: '#8e8e93',
    marginTop: spacing.sm,
  },
  // Summary cards
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryValue: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 32,
  },
  summaryLabel: {
    ...typography.caption,
    color: '#8e8e93',
    marginTop: spacing.xs,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  trendUp: {
    color: '#34C759',
  },
  trendDown: {
    color: colors.iOSred,
  },
  trendStable: {
    color: '#8e8e93',
  },
  // Zone scores
  zoneSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  zoneName: {
    ...typography.body1,
    flex: 1,
    fontWeight: '500',
  },
  zoneBarContainer: {
    width: 100,
    height: 8,
    backgroundColor: '#e5e5ea',
    borderRadius: 4,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  zoneBar: {
    height: '100%',
    borderRadius: 4,
  },
  zoneScore: {
    ...typography.body2,
    fontWeight: '600',
    width: 35,
    textAlign: 'right',
  },
  zoneTrend: {
    ...typography.caption,
    width: 30,
    textAlign: 'center',
  },
  // Action items
  actionSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  actionStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionStatBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
  },
  actionStatValue: {
    ...typography.h3,
    color: colors.primary,
  },
  actionStatLabel: {
    ...typography.caption,
    color: '#8e8e93',
    marginTop: 2,
  },
  priorityList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  priorityItem: {
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  priorityLabel: {
    ...typography.caption,
    fontSize: 11,
    color: '#8e8e93',
  },
  priorityValue: {
    ...typography.body2,
    fontWeight: '600',
  },
  highImpactList: {
    marginTop: spacing.md,
  },
  highImpactTitle: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  highImpactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  highImpactPriority: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  highImpactText: {
    ...typography.body2,
    flex: 1,
  },
  highImpactStatus: {
    ...typography.caption,
    color: '#8e8e93',
    fontSize: 11,
  },
  // Task stats
  taskSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  taskGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  taskBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
  },
  taskBoxSuccess: {
    backgroundColor: '#34C75920',
  },
  taskBoxWarning: {
    backgroundColor: '#FF950020',
  },
  taskValue: {
    ...typography.h2,
    fontWeight: '700',
  },
  taskValueSuccess: {
    color: '#34C759',
  },
  taskValueWarning: {
    color: '#FF9500',
  },
  taskLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  // Export button
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonText: {
    ...typography.button,
    color: '#fff',
    fontSize: 18,
    marginRight: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

type PeriodPreset = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom'

const getPeriodDates = (preset: PeriodPreset): { start: string; end: string } => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  switch (preset) {
    case 'thisWeek': {
      const dayOfWeek = now.getDay()
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(now.setDate(diff))
      return { start: monday.toISOString().split('T')[0], end: today }
    }
    case 'lastWeek': {
      const dayOfWeek = now.getDay()
      const diff = now.getDate() - dayOfWeek - 6
      const lastMonday = new Date(now.setDate(diff))
      const lastSunday = new Date(now.setDate(lastMonday.getDate() + 6))
      return { start: lastMonday.toISOString().split('T')[0], end: lastSunday.toISOString().split('T')[0] }
    }
    case 'thisMonth': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: firstDay.toISOString().split('T')[0], end: today }
    }
    case 'lastMonth': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: firstDay.toISOString().split('T')[0], end: lastDay.toISOString().split('T')[0] }
    }
    default:
      return { start: today, end: today }
  }
}

export default function PartnerReport() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [period, setPeriod] = useState<PeriodPreset>('thisWeek')
  
  const dates = useMemo(() => getPeriodDates(period), [period])
  const { report, isLoading } = usePartnerReportQuery(dates.start, dates.end)

  const handleExport = useCallback(async () => {
    try {
      const csvText = await exportPartnerCSV(dates.start, dates.end)
      const fileUri = FileSystem.cacheDirectory + `partner-report-${dates.start}.csv`
      await FileSystem.writeAsStringAsync(fileUri, csvText)
      await Share.share({
        url: fileUri,
        title: `Partner Report ${dates.start} to ${dates.end}`,
      })
    } catch (error) {
      Alert.alert('Export Failed', 'Could not generate CSV export.')
    }
  }, [dates])

  const handleShare = useCallback(async () => {
    if (!report) return
    
    const summary = `
Partner Report: ${report.period.start} to ${report.period.end}

Summary:
• ${report.summary.totalAudits} audits completed
• Average score: ${report.summary.averageScore}/5
• ${report.summary.criticalFindings} critical findings
• ${report.summary.openActions} open action items

Zone Scores:
${Object.entries(report.zoneBreakdown).map(([zone, data]) => `• ${zone}: ${data.score}/5`).join('\n')}

Task Completion:
• ${report.completedTasks.onTime} on time
• ${report.completedTasks.late} late
• ${report.completedTasks.total} total
    `.trim()
    
    await Share.share({
      message: summary,
      title: `Partner Report ${report.period.start}`,
    })
  }, [report])

  if (isLoading || !report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Partner Report</Text>
        <Pressable onPress={handleShare}>
          <Ionicons name='share-outline' size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Period Selector */}
        <View style={styles.periodSection}>
          <Text style={styles.periodTitle}>Reporting Period</Text>
          <View style={styles.periodButtons}>
            {(['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'] as PeriodPreset[]).map((p) => (
              <Pressable
                key={p}
                style={[styles.periodButton, period === p && styles.periodButtonActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
                  {p.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.periodRange}>{dates.start} → {dates.end}</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{report.summary.totalAudits}</Text>
            <Text style={styles.summaryLabel}>Audits Completed</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{report.summary.averageScore.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Average Score</Text>
            <View style={styles.trendIndicator}>
              <Ionicons
                name={
                  report.summary.trending === 'up'
                    ? 'trending-up'
                    : report.summary.trending === 'down'
                    ? 'trending-down'
                    : 'remove'
                }
                size={16}
                color={
                  report.summary.trending === 'up'
                    ? '#34C759'
                    : report.summary.trending === 'down'
                    ? colors.iOSred
                    : '#8e8e93'
                }
              />
              <Text
                style={[
                  report.summary.trending === 'up'
                    ? styles.trendUp
                    : report.summary.trending === 'down'
                    ? styles.trendDown
                    : styles.trendStable,
                  { marginLeft: 4, fontSize: 12 },
                ]}
              >
                {report.summary.trending}
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.iOSred }]}>
              {report.summary.criticalFindings}
            </Text>
            <Text style={styles.summaryLabel}>Critical Findings</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{report.summary.openActions}</Text>
            <Text style={styles.summaryLabel}>Open Actions</Text>
          </View>
        </View>

        {/* Zone Breakdown */}
        <View style={styles.zoneSection}>
          <Text style={styles.sectionTitle}>Zone Performance</Text>
          {PRESTO_ZONES.map((zone) => {
            const data = report.zoneBreakdown[zone]
            if (!data) return null
            return (
              <View key={zone} style={styles.zoneRow}>
                <Text style={styles.zoneName}>{zone}</Text>
                <View style={styles.zoneBarContainer}>
                  <View
                    style={[
                      styles.zoneBar,
                      {
                        width: `${(data.score / 5) * 100}%`,
                        backgroundColor: PRESTO_COLORS[zone],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.zoneScore}>{data.score.toFixed(1)}</Text>
                <Text style={styles.zoneTrend}>
                  {data.score > data.previousScore ? '↑' : data.score < data.previousScore ? '↓' : '→'}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Action Items */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          <View style={styles.actionStats}>
            <View style={styles.actionStatBox}>
              <Text style={styles.actionStatValue}>{report.actionItems.total}</Text>
              <Text style={styles.actionStatLabel}>Total</Text>
            </View>
            <View style={styles.actionStatBox}>
              <Text style={styles.actionStatValue}>{report.actionItems.byStatus.proposed}</Text>
              <Text style={styles.actionStatLabel}>Proposed</Text>
            </View>
            <View style={styles.actionStatBox}>
              <Text style={styles.actionStatValue}>{report.actionItems.byStatus.approved}</Text>
              <Text style={styles.actionStatLabel}>Approved</Text>
            </View>
          </View>

          <View style={styles.priorityList}>
            {(['critical', 'high', 'medium', 'low'] as const).map((priority) => (
              <View key={priority} style={styles.priorityItem}>
                <View style={[styles.priorityDot, { backgroundColor: SEVERITY_COLORS[priority] }]} />
                <Text style={styles.priorityLabel}>{priority}</Text>
                <Text style={styles.priorityValue}>{report.actionItems.byPriority[priority]}</Text>
              </View>
            ))}
          </View>

          {report.actionItems.highImpact.length > 0 && (
            <View style={styles.highImpactList}>
              <Text style={styles.highImpactTitle}>High Impact Items</Text>
              {report.actionItems.highImpact.map((item) => (
                <View key={item.id} style={styles.highImpactItem}>
                  <View
                    style={[
                      styles.highImpactPriority,
                      { backgroundColor: SEVERITY_COLORS[item.priority] },
                    ]}
                  />
                  <Text style={styles.highImpactText} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.highImpactStatus}>{item.status}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Task Completion */}
        <View style={styles.taskSection}>
          <Text style={styles.sectionTitle}>Task Completion</Text>
          <View style={styles.taskGrid}>
            <View style={[styles.taskBox, styles.taskBoxSuccess]}>
              <Text style={[styles.taskValue, styles.taskValueSuccess]}>
                {report.completedTasks.onTime}
              </Text>
              <Text style={styles.taskLabel}>On Time</Text>
            </View>
            <View style={[styles.taskBox, styles.taskBoxWarning]}>
              <Text style={[styles.taskValue, styles.taskValueWarning]}>
                {report.completedTasks.late}
              </Text>
              <Text style={styles.taskLabel}>Late</Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <Pressable style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>Export CSV</Text>
          <Ionicons name='download-outline' size={20} color='#fff' />
        </Pressable>
      </ScrollView>
    </View>
  )
}