import { useAuth } from '@/context/auth/AuthContext'
import { LoggedUser, useLoggedUser } from '@/context/user/UserContext'
import { getTasks } from '@/services/taskService'
import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { Button, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@/styles/theme'

const styles = StyleSheet.create({
  screenContainer: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'center',
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
  subtitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
})

const Dashboard = () => {
  const { user } = useLoggedUser()
  const { logout } = useAuth()

  if (!user) return null

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Dashboard' }} />
      <View style={styles.container}>
        <View>
          <DashboardHeader user={user} />
          <DashboardPendingTasks user={user} />
        </View>

        <View>
          <Button title='Logout' onPress={logout}></Button>
        </View>
      </View>
    </View>
  )
}

const DashboardHeader = ({ user }: { user: LoggedUser }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
    </View>
  )
}

const DashboardPendingTasks = ({ user }: { user: LoggedUser }) => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.sub],
    queryFn: getTasks,
    enabled: !!user,
  })

  if (isLoading) return <Text>Loading...</Text>

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
