import axios from 'axios'
import { useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import { useAuth } from '../auth/AuthContext'
import { useLocation, useNavigate } from 'react-router-native'
import styles from './styles'

const API_URL = process.env.EXPO_PUBLIC_API_URL
const api = axios.create({
  baseURL: API_URL + '/api',
})

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation()

  const onSubmit = async () => {
    const { data } = await api.post('/login', { email, password })
    await login(data.token)

    const redirectTo = location.state?.from ?? '/tasks'
    nav(redirectTo)
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.header}>Login</Text>
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
      <Button title='Sign in' onPress={onSubmit} />
    </View>
  )
}
export default LoginScreen
