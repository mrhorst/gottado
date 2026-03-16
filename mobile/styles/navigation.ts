import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { colors } from './theme'

export const baseStackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: '#fff' },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerBackTitleVisible: false,
  headerLeftContainerStyle: { paddingLeft: 8 },
  headerRightContainerStyle: { paddingRight: 8 },
  contentStyle: { backgroundColor: '#f2f2f7' },
  animation: 'slide_from_right',
}
