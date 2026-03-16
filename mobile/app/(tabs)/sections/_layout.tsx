import { colors } from '@/styles/theme'
import { Link, Stack } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'

const styles = StyleSheet.create({
  headerLink: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '400',
  },
})

const SectionsScreenLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: true }}>
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
      <Pressable>
        <Text style={styles.headerLink}>New Section</Text>
      </Pressable>
    </Link>
  )
}

export default SectionsScreenLayout
