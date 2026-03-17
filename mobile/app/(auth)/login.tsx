import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/context/auth/AuthContext'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'expo-router'
import { colors, layout, spacing } from '@/styles/theme'
import { login } from '@/services/userService'
import AppButton from '@/components/ui/AppButton'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormField from '@/components/ui/FormField'

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
    padding: layout.screenPadding,
    backgroundColor: colors.background,
    gap: spacing.md,
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
          <ScreenHeader
            title='Sign In'
            subtitle='Access your team tasks, checklists, and operations dashboard.'
          />
          <FormField label='Email'>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              keyboardType='email-address'
              placeholder='Email'
            />
          </FormField>
          <FormField label='Password'>
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder='Password'
            />
          </FormField>
        </View>
        <AppButton label='Sign In' onPress={onSubmit} />
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
