import { Stack } from 'expo-router'
import { Button, Text, TextInput, View } from 'react-native'
import styles from '../styles'
import { useState } from 'react'
import { createUser } from '@/app/services/userService'
import NavigationHeader from '@/app/components/ui/NavigationHeader'
import api from '@/app/services/api'
import { useAuth } from '@/app/context/auth/AuthContext'
import { useLocation, useNavigate } from 'react-router-native'

const SignupScreen = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const location = useLocation()
  const nav = useNavigate()

  const onSubmit = async () => {
    try {
      await createUser(email, name, password)
      const { data } = await api.post('/login', {
        email,
        password,
      }) // need to refactor this
      await login(data.token)

      const redirectTo = location.state?.from ?? '/dashboard'

      nav(redirectTo, { replace: true })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <View style={styles.screenContainer}>
      <NavigationHeader />
      <View style={{ marginBottom: 30 }}>
        <Text style={styles.header}>Sign Up</Text>
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        autoCapitalize='none'
        style={styles.input}
        placeholder='Name'
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
        style={styles.input}
        placeholder='Email'
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholder='Password'
      />
      <Button title='Create account' onPress={onSubmit} />
      <Stack.Screen options={{ title: 'Sign up' }} />
    </View>
  )
}
export default SignupScreen
