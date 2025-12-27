import { useAuth } from '@/context/auth/AuthContext'
import { useWorkspace } from '@/context/workspace/WorkspaceContext'
import { router } from 'expo-router'
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7', // Light gray iOS background
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff3b30', // iOS Red
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 17,
    fontWeight: '600',
  },
})

const OrgSelectorScreen = () => {
  const { endSession, user } = useAuth()
  const { organizations, handleSelectOrganization } = useWorkspace()

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out?')

      if (confirmed) {
        await endSession()
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: async () => {
              await endSession()
            },
          },
        ],
        { cancelable: true }
      )
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={organizations}
        renderItem={({ item }) => (
          <View style={{ padding: 15, borderWidth: 1 }}>
            <Pressable onPress={() => handleSelectOrganization(item)}>
              <Text>{item.name}</Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && { opacity: 0.7 },
        ]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  )
}

export default OrgSelectorScreen
