import { Button, FlatList, Pressable, Text, View } from 'react-native'
import NavigationHeader from '../components/ui/NavigationHeader'
import { useNavigate, useParams } from 'react-router-native'
import { useSectionQuery } from '../hooks/useSectionQuery'
import { useSectionMembersQuery } from '../hooks/useSectionMembersQuery'

const SectionScreen = () => {
  const { id } = useParams()
  const sectionId = Number(id)
  const nav = useNavigate()

  const { sections } = useSectionQuery()
  const { sectionMembersResponse, isLoading } = useSectionMembersQuery()
  const section = sections?.find((s) => s.id === sectionId)

  const sectionMembers = sectionMembersResponse?.members

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
              <Text style={{ fontWeight: 600, fontSize: 16, padding: 10 }}>
                {item.member} ({item.role})
              </Text>
            )}
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <Button
            title='Add Member'
            onPress={() => nav(`/sections/${id}/add-member`)}
          />
        </View>
      </View>
    </View>
  )
}
export default SectionScreen
