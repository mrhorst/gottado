import { FlatList, Text, View } from 'react-native'
import NavigationHeader from '../components/ui/NavigationHeader'
import { useParams } from 'react-router-native'
import { useSectionQuery } from '../hooks/useSectionQuery'
import { useSectionMembersQuery } from '../hooks/useSectionMembersQuery'

const SectionScreen = () => {
  const { id } = useParams()
  const sectionId = Number(id)

  const { sections } = useSectionQuery()
  const { sectionMembersResponse, isLoading } = useSectionMembersQuery()
  const section = sections?.find((s) => s.id === sectionId)

  const sectionMembers = sectionMembersResponse?.members
  const nonSectionMembers = sectionMembersResponse?.nonMembers

  if (isLoading) return <Text>Loading...</Text>

  return (
    <View>
      <NavigationHeader />
      <View>
        <Text style={{ fontWeight: 600, fontSize: 20, textAlign: 'center' }}>
          {section?.name}
        </Text>
      </View>
      <View>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 600, fontSize: 20, textAlign: 'center' }}>
            Users subscribed
          </Text>

          <FlatList
            style={{ margin: 10 }}
            data={sectionMembers}
            renderItem={({ item }) => (
              <Text style={{ fontWeight: 600, fontSize: 20, padding: 10 }}>
                {item.member} ({item.role})
              </Text>
            )}
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 600, fontSize: 20, textAlign: 'center' }}>
            Users NOT subscribed
          </Text>

          <FlatList
            style={{ margin: 10 }}
            data={nonSectionMembers}
            renderItem={({ item }) => (
              <Text style={{ fontWeight: 600, fontSize: 20, padding: 10 }}>
                {item.name} ({item.email})
              </Text>
            )}
          />
        </View>
      </View>
    </View>
  )
}
export default SectionScreen
