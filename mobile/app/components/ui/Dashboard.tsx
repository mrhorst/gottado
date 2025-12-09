import { useAuth } from '@/app/context/auth/AuthContext'
import { useSections } from '@/app/context/section/SectionContext'
import { LoggedUser, useLoggedUser } from '@/app/context/user/UserContext'
import styles from '@/app/screens/styles'
import { getTasks } from '@/app/services/taskService'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { Button, Pressable, Text, View } from 'react-native'

const Dashboard = () => {
  const { user } = useLoggedUser()
  const { logout } = useAuth()

  if (!user) return null

  return (
    <View style={styles.screenContainer}>
      <DashboardHeader user={user} />
      <DashboardPendingTasks user={user} />
      <DashboardButtonGrid />
      <View style={{ marginTop: 50 }}>
        <Button title='Logout' onPress={logout}></Button>
      </View>
      <Stack.Screen options={{ title: 'Dashboard' }} />
    </View>
  )
}

const DashboardHeader = ({ user }: { user: LoggedUser }) => {
  return (
    <View>
      <Text style={styles.header}>Welcome, {user?.name}!</Text>
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
    <View style={{ marginBottom: 30 }}>
      <Text style={{ textAlign: 'center' }}>
        You currently have {pendingTasks.length} tasks pending.
      </Text>
    </View>
  )
}

const DashboardButtonGrid = () => {
  const [isOwnerOrEditor, setIsOwnerOrEditor] = useState(false)
  const { sections } = useSections()

  useEffect(() => {
    const isFound = sections?.find(
      (s) => s.role === 'owner' || s.role === 'editor'
    )
    if (isFound) setIsOwnerOrEditor(true)
  }, [sections])

  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={styles.dashboardButtonContainer}>
        <DashboardButton to='Tasks' title='Tasks' />
        <DashboardButton to='Sections' title='Sections' />
        {isOwnerOrEditor ? (
          <DashboardButton to='CreateTask' title='Create Task' />
        ) : null}
        <DashboardButton to='Profile' title='Profile' />
      </View>
    </View>
  )
}

const DashboardButton = ({ to, title }: { to: string; title: string }) => {
  const navigation = useNavigation<any>()
  return (
    <Pressable
      style={styles.dashboardButton}
      onPress={() => navigation.navigate(to)}
    >
      <Text style={styles.dashboardButtonText}>{title}</Text>
    </Pressable>
  )
}
export default Dashboard
