import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/context/auth/AuthContext'
import api from '@/services/api'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'expo-router'
import { colors, typography } from '@/styles/theme'
import { login } from '@/services/userService'

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  appName: {
    fontSize: 85,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 70,
    letterSpacing: -3,
  },

  container: { gap: 10 },
  screenContainer: {
    justifyContent: 'center',
    flex: 1,
    padding: 30,
  },
  primaryButton: {
    padding: 15,

    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  primaryButtonText: {
    ...typography.button,
    color: '#fff',
  },
})

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { startSession } = useAuth()
  const router = useRouter()

  const onSubmit = async () => {
    const { token } = await login(email, password)
    await startSession(token)
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.container}>
        <Text style={styles.appName}>gottado</Text>

        <View style={styles.container}>
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            keyboardType='email-address'
            placeholder='Email'
          />
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder='Password'
          />
        </View>
        <Pressable style={styles.primaryButton} onPress={onSubmit}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 10 }}>
        <Text>Not a user yet? </Text>
        <Pressable onPress={() => router.push('/signup')}>
          <Text>Click here to create an account!</Text>
        </Pressable>
      </View>
    </View>
  )
}
export default LoginScreen
