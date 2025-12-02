import { Text, View } from 'react-native'
import NavigationHeader from '../components/ui/NavigationHeader'
import { useParams } from 'react-router-native'
import { useSectionQuery } from '../hooks/useSectionQuery'
import { Stack } from 'expo-router'

const SectionScreen = () => {
  const { id } = useParams()
  const sectionId = Number(id)

  const { sections } = useSectionQuery()
  const section = sections?.find((s) => s.id === sectionId)
  console.log(section)

  return (
    <View>
      <NavigationHeader />
      <Stack.Screen options={{ title: section?.name }} />
      <Text style={{ fontWeight: 600, fontSize: 20, textAlign: 'center' }}>
        {section?.name}
      </Text>
    </View>
  )
}
export default SectionScreen
