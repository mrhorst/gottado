import { colors } from '@/styles/theme'
import { baseStackScreenOptions } from '@/styles/navigation'
import { Link, Stack } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'

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

const SectionsScreenLayout = () => {
  return (
    <Stack screenOptions={{ ...baseStackScreenOptions, headerShown: true }}>
      <Stack.Screen
        name='index'
        options={{ title: 'Sections', headerRight: () => <NewSection /> }}
      />
      <Stack.Screen
        name='[id]'
        options={{ title: 'Members' }}
      />
      <Stack.Screen
        name='add-member'
        options={{ title: 'Add Member', presentation: 'modal' }}
      />
    </Stack>
  )
}

export const NewSection = () => {
  return (
    <Link href={'/create-section'} asChild>
      <Pressable style={styles.headerButton} hitSlop={8}>
        <Text style={styles.headerLink}>New Section</Text>
      </Pressable>
    </Link>
  )
}

export default SectionsScreenLayout
