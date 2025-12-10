import { useState } from 'react'
import { Button, Pressable, Text, TextInput, View } from 'react-native'
import { useAuth } from '../../context/auth/AuthContext'
import styles from '../styles'
import api from '../../services/api'
import { Stack } from 'expo-router'
import { useNavigation } from '@react-navigation/native'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login } = useAuth()
  const navigation = useNavigation<any>()

  const onSubmit = async () => {
    const { data } = await api.post('/login', { email, password }) // need to refactor this
    await login(data.token)
  }

  return (
    <View style={styles.screenContainer}>
      <View style={{ justifyContent: 'center', flex: 1 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Login</Text>
        </View>
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
        <Stack.Screen options={{ title: 'Login' }} />
        <View>
          <Text>Not a user yet? </Text>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text>Click here to create an account!</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
export default LoginScreen
