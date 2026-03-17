import { colors } from '@/styles/theme'
import { baseStackScreenOptions } from '@/styles/navigation'
import { Ionicons } from '@expo/vector-icons'
import { Link, Stack, useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'
import { NewSection } from '../sections/_layout'

const styles = StyleSheet.create({
  headerLink: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '400',
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
})

const TasksScreenLayout = () => {
  return (
    <Stack screenOptions={{ ...baseStackScreenOptions, headerShown: true }}>
      <Stack.Screen
        name='index'
        options={{
          title: 'Tasks',
          headerLargeTitle: true,
          gestureEnabled: false,
          headerLeft: () => <SnapshotLink />,
          headerRight: () => <NewTask />,
        }}
      />
      <Stack.Screen
        name='new'
        options={{ title: 'New Task', headerRight: () => <NewSection /> }}
      />
      <Stack.Screen
        name='[id]'
        options={{ title: 'Edit Task' }}
      />
      <Stack.Screen
        name='section/[id]'
        options={{ title: 'Section' }}
      />
      <Stack.Screen
        name='list/[id]'
        options={{ title: 'Checklist' }}
      />
      <Stack.Screen
        name='details/[id]'
        options={{ title: 'Task Details', headerLeft: () => <BackToTasks /> }}
      />
      <Stack.Screen
        name='snapshot'
        options={{ title: 'Daily Snapshot' }}
      />
    </Stack>
  )
}

const NewTask = () => {
  return (
    <Link href='/tasks/new' asChild>
      <Pressable style={styles.headerButton} hitSlop={8}>
        <Text style={styles.headerLink}>New Task</Text>
      </Pressable>
    </Link>
  )
}

const SnapshotLink = () => {
  return (
    <Link href='/tasks/snapshot' asChild>
      <Pressable style={styles.headerButton} hitSlop={8}>
        <Ionicons name='calendar-outline' size={22} color={colors.primary} />
      </Pressable>
    </Link>
  )
}

const BackToTasks = () => {
  const router = useRouter()

  return (
    <Pressable
      style={styles.headerButton}
      hitSlop={8}
      onPress={() => {
        if (router.canGoBack()) {
          router.back()
          return
        }
        router.replace('/(tabs)/tasks')
      }}
    >
      <Ionicons name='chevron-back' size={22} color={colors.primary} />
    </Pressable>
  )
}

export default TasksScreenLayout
