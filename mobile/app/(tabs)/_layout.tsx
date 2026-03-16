import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { colors } from '@/styles/theme'

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
          headerShown: false,
          title: 'Dashboard',
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
        name='sections'
        options={{
          headerShown: false,
          title: 'Sections',
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
        name='action-items'
        options={{
          headerShown: false,
          title: 'Actions',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'flash' : 'flash-outline'}
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
