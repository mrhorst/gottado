import { useAuth } from '@/context/auth/AuthContext'
import { getTasks } from '@/services/taskService'
import { useQuery } from '@tanstack/react-query'

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@/styles/theme'
import { UserOrgs, UserProfile } from '@/types/user'
import { useWorkspace } from '@/context/workspace/WorkspaceContext'

const styles = StyleSheet.create({
  screenContainer: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    flex: 0,
  },
  welcomeText: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
  },
  orgText: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
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
      <DashboardOrgHeader org={org} />
      <View style={styles.container}>
        <View>
          <DashboardHeader user={user} />
          <DashboardPendingTasks user={user} />
        </View>
      </View>
    </View>
  )
}

const DashboardOrgHeader = ({ org }: { org: UserOrgs }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.orgText}>Workspace: {org?.name}</Text>
    </View>
  )
}

const DashboardHeader = ({ user }: { user: UserProfile }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
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

  const pendingTasks = tasks.filter((t) => t.complete === false)

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        You currently have {pendingTasks.length}
        {pendingTasks.length === 1 ? ' task' : ' tasks'} pending.
      </Text>
    </View>
  )
}

export default Dashboard
