import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { createUser } from '@/services/userService'
import api from '@/services/api'
import { useAuth } from '@/context/auth/AuthContext'
import { Input } from '@/components/ui/Input'
import { colors, typography } from '@/styles/theme'

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  appName: {
    fontSize: 55,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 70,
    letterSpacing: 0,
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

const SignupScreen = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const onSubmit = async () => {
    try {
      await createUser(email, name, password)
      const { data } = await api.post('/login', {
        email,
        password,
      }) // need to refactor this
      await login(data.token)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.container}>
        <Text style={styles.appName}>gottado</Text>
      </View>

      <View style={styles.container}>
        <Input
          value={name}
          onChangeText={setName}
          autoCapitalize='none'
          placeholder='Name'
        />
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

        <Pressable style={styles.primaryButton} onPress={onSubmit}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </Pressable>
      </View>
    </View>
  )
}
export default SignupScreen
