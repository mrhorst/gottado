import { useAuth } from '@/context/auth/AuthContext'
import { useWorkspace } from '@/context/workspace/WorkspaceContext'
import { colors, spacing } from '@/styles/theme'
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
    borderColor: colors.iOSred, // iOS Red
  },
  selectButton: {
    backgroundColor: '#fff',
    paddingVertical: spacing.lg,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f1f9',
  },
  logoutText: {
    color: colors.iOSred,
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 30,
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
        contentContainerStyle={{ gap: 15 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.selectButton,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => handleSelectOrganization(item)}
          >
            <Text style={{ fontSize: 24, fontWeight: '700' }}>{item.name}</Text>
          </Pressable>
        )}
      />
      <View style={styles.footer}>
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
    </View>
  )
}

export default OrgSelectorScreen
