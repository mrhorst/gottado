import { StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { createUser } from '@/services/userService'
import api from '@/services/api'
import { useAuth } from '@/context/auth/AuthContext'
import { Input } from '@/components/ui/Input'
import { colors, layout, spacing } from '@/styles/theme'
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
    padding: layout.screenPadding,
    backgroundColor: colors.background,
    gap: spacing.md,
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
        <ScreenHeader
          title='Create Account'
          subtitle='Set up your account to join your organization and start completing checklists.'
        />
      </View>

      <View style={styles.container}>
        <FormField label='Name'>
          <Input
            value={name}
            onChangeText={setName}
            autoCapitalize='none'
            placeholder='Name'
          />
        </FormField>
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

        <AppButton label='Create Account' onPress={onSubmit} />
      </View>
    </View>
  )
}
export default SignupScreen
