import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useAuth } from '@/context/auth/AuthContext'
import { useRouter } from 'expo-router'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7', // Light gray iOS background
    padding: 20,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 30,
    marginTop: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e1e1e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#666',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  footer: {
    marginTop: 'auto',
    gap: 15,
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

const ProfileScreen = () => {
  const { user, endSession } = useAuth()

  const router = useRouter()

  if (!user) return null

  // const date = new Date(user.iat * 1000).toLocaleString()

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
              router.replace('/(auth)/login')
            },
          },
        ],
        { cancelable: true }
      )
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {/* <Text>Last login: {date}</Text> */}
        </View>
      </View>
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
export default ProfileScreen
