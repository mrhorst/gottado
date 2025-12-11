import { Stack } from 'expo-router'
import { Button, Text, View } from 'react-native'
import styles from '@/app/styles'
import { useState } from 'react'
import { createUser } from '@/services/userService'
import api from '@/services/api'
import { useAuth } from '@/context/auth/AuthContext'
import { Input } from '@/components/ui/Input'

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
      <View style={{ marginBottom: 30 }}>
        <Text style={styles.headerText}>Sign Up</Text>
      </View>
      <Input
        value={name}
        onChangeText={setName}
        autoCapitalize='none'
        style={styles.input}
        placeholder='Name'
      />
      <Input
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
        style={styles.input}
        placeholder='Email'
      />
      <Input
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
