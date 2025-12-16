import { colors } from '@/styles/theme'
import { Link, Stack } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'
import { NewSection } from '../sections/_layout'

const styles = StyleSheet.create({
  headerLink: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '400',
  },
})

const TasksScreenLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name='index'
        options={{ title: 'Tasks', headerRight: NewTask }}
      />
      <Stack.Screen
        name='new'
        options={{ title: 'New Task', headerRight: NewSection }}
      />
    </Stack>
  )
}

const NewTask = () => {
  return (
    <Link href='/tasks/new' asChild>
      <Pressable>
        <Text style={styles.headerLink}>New Task</Text>
      </Pressable>
    </Link>
  )
}

export default TasksScreenLayout
