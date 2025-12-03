import { useParams } from 'react-router-native'
import { useSectionQuery } from '../hooks/useSectionQuery'
import {
  SectionNonMembers,
  useSectionMembersQuery,
} from '../hooks/useSectionMembersQuery'
import { FlatList, Pressable, Text, TextInput, View } from 'react-native'
import NavigationHeader from '../components/ui/NavigationHeader'
import styles from './styles'
import { useState } from 'react'

const AddSectionMemberScreen = () => {
  const { id } = useParams()
  const sectionId = Number(id)

  const { sections } = useSectionQuery()
  const { sectionMembersResponse, isLoading } = useSectionMembersQuery()
  const section = sections?.find((s) => s.id === sectionId)

  const nonSectionMembers = sectionMembersResponse?.nonMembers

  const [searchName, setSearchName] = useState('')

  if (isLoading) return <Text>Loading...</Text>

  const _renderItem = ({ item }: { item: SectionNonMembers }) => {
    return (
      <Pressable>
        <Text style={{ fontSize: 18 }}>
          {item.name} ({item.email})
        </Text>
      </Pressable>
    )
  }

  const dataToDisplay = nonSectionMembers?.filter((m) =>
    m.name.toLowerCase().includes(searchName.toLowerCase())
  )

  return (
    <View>
      <NavigationHeader />
      <View>
        <Text style={{ fontWeight: 600, fontSize: 20, textAlign: 'center' }}>
          Section: {section?.name}
        </Text>
      </View>
      <View>
        <View style={{ marginTop: 20, padding: 20, gap: 30 }}>
          <TextInput
            placeholder='non member name...'
            style={styles.input}
            value={searchName}
            onChangeText={(name) => setSearchName(name)}
          />
          <FlatList data={dataToDisplay} renderItem={_renderItem} />
        </View>
      </View>
    </View>
  )
}
export default AddSectionMemberScreen
