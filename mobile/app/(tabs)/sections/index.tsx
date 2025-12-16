import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SectionProps, useSections } from '@/context/section/SectionContext'
import { useRouter } from 'expo-router'
import { colors, spacing } from '@/styles/theme'
import { useTasksQuery } from '@/hooks/useTasksQuery'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: 20,
  },
  sectionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    backgroundColor: colors.background,
  },
  sectionCardText: {
    fontSize: 18,
    fontWeight: '500',
  },
  sectionOwnerRoleText: {
    fontWeight: '800',
    color: '#2d2d2dff',
  },
  sectionEditorRoleText: {
    fontWeight: '800',
    color: colors.primary,
  },
  sectionViewerRole: {
    fontWeight: '800',
    color: colors.error,
  },
})

const SectionListScreen = () => {
  const { sections, isLoading } = useSections()
  const { tasks } = useTasksQuery()

  const router = useRouter()

  const sectionRole = (item: SectionProps) =>
    item.role === 'owner'
      ? styles.sectionOwnerRoleText
      : item.role === 'editor'
      ? styles.sectionEditorRoleText
      : styles.sectionViewerRole

  const sectionTasks = (item: SectionProps) =>
    tasks.filter((t) => t.sectionName === item.name).length

  const canSeeSectionInfo = (item: SectionProps) => {
    if (item.role === 'viewer') {
      Alert.prompt(
        'No Access',
        'You do not have permission to see this section',
        [],
        'default'
      )
    } else {
      router.push(`/sections/${item.id}`)
    }
  }

  sections?.sort((a, b) => sectionTasks(b) - sectionTasks(a))

  if (isLoading) return <Text>Loading...</Text>
  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={({ item }) => (
          <ScrollView>
            <Pressable onPress={() => canSeeSectionInfo(item)}>
              <View style={styles.sectionCard}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 15,
                    alignItems: 'center',
                  }}
                >
                  <Text style={styles.sectionCardText}>{item.name}</Text>
                  <Text>
                    <Text style={sectionRole(item)}>{item.role}</Text>
                  </Text>
                </View>

                <Text>Tasks: {sectionTasks(item)}</Text>
              </View>
            </Pressable>
          </ScrollView>
        )}
      ></FlatList>
    </View>
  )
}
export default SectionListScreen
