import { Ionicons } from '@expo/vector-icons'
import { Link, Tabs } from 'expo-router'
import { colors } from '@/styles/theme'
import { Pressable } from 'react-native'

const headerActionStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
}

const headerActionMutedStyle = {
  ...headerActionStyle,
  backgroundColor: '#f2f2f7',
}

const headerActionPrimaryStyle = {
  ...headerActionStyle,
  backgroundColor: colors.primary,
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '700', color: colors.text },
        headerLeftContainerStyle: { paddingLeft: 8 },
        headerRightContainerStyle: { paddingRight: 8 },
        sceneStyle: { backgroundColor: '#f2f2f7' },
      }}
    >
      <Tabs.Screen
        name='dashboard'
        options={{
          headerShown: true,
          title: '',
          headerLeft: () => (
            <Link href='/select-org' asChild>
              <Pressable
                hitSlop={8}
                style={headerActionMutedStyle}
              >
                <Ionicons name='business-outline' size={16} color={colors.text} />
              </Pressable>
            </Link>
          ),
          headerRight: () => (
            <Link href='/(tabs)/tasks/new' asChild>
              <Pressable
                hitSlop={8}
                style={headerActionPrimaryStyle}
              >
                <Ionicons name='add' size={18} color='#fff' />
              </Pressable>
            </Link>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='labor'
        options={{
          headerShown: false,
          title: 'Labor',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='tasks'
        options={{
          headerShown: false,
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'checkmark-done' : 'checkmark-done-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='areas'
        options={{
          headerShown: false,
          title: 'Areas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'layers' : 'layers-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='audits'
        options={{
          headerShown: false,
          title: 'Audits',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'clipboard' : 'clipboard-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='logbook'
        options={{
          headerShown: false,
          title: 'Logbook',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='user'
        options={{
          title: 'User',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}
