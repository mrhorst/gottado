import { FlatList, Pressable, Text, View } from 'react-native'
import styles from '../styles'
import { Stack } from 'expo-router'
import { useSections } from '@/context/section/SectionContext'
import { useNavigation } from '@react-navigation/native'

const SectionListScreen = () => {
  const { sections, isLoading } = useSections()
  const navigation = useNavigation<any>()

  if (isLoading) return <Text>Loading...</Text>

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: 'Sections' }} />

      <View style={[{ marginTop: 20 }, styles.tasksContainer]}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}>
            Sections
          </Text>
        </View>
        <FlatList
          data={sections}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('SectionDetails', { id: item.id })
              }
            >
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
