import { FlatList, Pressable, Text, View } from 'react-native'
import styles from '../../styles'
import { useSections } from '@/context/section/SectionContext'
import { useRouter } from 'expo-router'

const SectionListScreen = () => {
  const { sections, isLoading } = useSections()
  const router = useRouter()

  if (isLoading) return <Text>Loading...</Text>

  return (
    <View style={styles.screenContainer}>
      <View style={[{ marginTop: 20 }, styles.tasksContainer]}>
        <FlatList
          data={sections}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/sections/${item.id}`)}>
              <Text style={{ fontSize: 18, fontWeight: 700, margin: 10 }}>
                {item.name} ({item.role})
              </Text>
            </Pressable>
          )}
        ></FlatList>
      </View>
    </View>
  )
}
export default SectionListScreen
