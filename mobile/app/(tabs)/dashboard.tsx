import { useAuth } from '@/context/auth/AuthContext'
import { getTasks } from '@/services/taskService'
import { useQuery } from '@tanstack/react-query'

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@/styles/theme'
import { UserProfile } from '@/types/user'
import { useWorkspace } from '@/context/workspace/WorkspaceContext'
import { Pressable } from 'react-native-gesture-handler'
import { router } from 'expo-router'

const styles = StyleSheet.create({
  screenContainer: {
    paddingTop: spacing.xl,
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  orgBadge: {
    backgroundColor: colors.primary + '15', // 15% opacity version of your primary
    padding: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  orgText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  container: {
    padding: spacing.md,
    flex: 0,
  },
  welcomeText: {
    ...typography.h1,
    color: colors.text,
  },
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: spacing.lg,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Android Shadow
    elevation: 4,
  },
  countText: {
    fontSize: 48,
    color: colors.primary,
  },
  subtitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
})

const Dashboard = () => {
  const { user } = useAuth()
  const { org } = useWorkspace()

  if (!user || !org) return null

  return (
    <View style={styles.screenContainer}>
      {/* Begin Header section */}
      <View style={styles.section}>
        <View style={styles.orgBadge}>
          <Text style={styles.orgText}>{org?.name}</Text>
        </View>
        {/* End Header section */}
        <Text style={styles.welcomeText}>
          Welcome, {user?.name.split(' ')[0]}!
        </Text>
      </View>
      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [pressed ? { opacity: 0.6 } : {}]}
          onPress={() => router.push('/(tabs)/tasks')}
        >
          <DashboardPendingTasks user={user} />
        </Pressable>
      </View>
    </View>
  )
}

const DashboardPendingTasks = ({ user }: { user: UserProfile }) => {
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: getTasks,
    enabled: !!user,
  })

  if (isLoading)
    return (
      <View style={{ marginTop: 10, flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )

  if (isError) {
    return <Text>Failed to fetch tasks... {error.message}</Text> // Need to fix this later..
  }

  const pendingCount = tasks.filter((t) => !t.complete).length

  return (
    <View style={styles.card}>
      <Text style={styles.countText}>{pendingCount}</Text>
      <Text style={styles.subtitle}>
        {pendingCount === 1 ? 'Task' : 'Tasks'} pending for today
      </Text>
    </View>
  )
}

export default Dashboard
