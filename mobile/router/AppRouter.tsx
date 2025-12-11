import LoginScreen from '@/app/auth/LoginScreen'
import TasksScreen from '@/app/tasks/TasksScreen'
import DashboardScreen from '@/app/DashboardScreen'
import ProfileScreen from '@/app/user/ProfileScreen'
import NewTaskScreen from '@/app/tasks/NewTaskScreen'
import AddSectionMemberScreen from '@/app/sections/AddSectionMemberScreen'
import SectionDetailScreen from '@/app/sections/SectionDetailScreen'
import SectionListScreen from '@/app/sections/SectionListScreen'
import SignupScreen from '@/app/auth/SignupScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useLoggedUser } from '../context/user/UserContext'
import NewSectionScreen from '@/app/sections/NewSectionScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: 'grey',
        tabBarActiveTintColor: 'blue',
        animation: 'none',
      }}
    >
      <Tab.Screen name='Dashboard' component={DashboardScreen} />
      <Tab.Screen name='Tasks' component={TasksScreen} />
      <Tab.Screen name='Sections' component={SectionListScreen} />
      <Tab.Screen name='User' component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function AppRouter() {
  const { user } = useLoggedUser()
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name='Home' component={HomeTabs} />
          <Stack.Screen
            name='NewTask'
            component={NewTaskScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'New Task',
            }}
          />
          <Stack.Screen
            name='SectionDetails'
            component={SectionDetailScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name='NewSection'
            component={NewSectionScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name='AddSectionMember'
            component={AddSectionMemberScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name='Login' component={LoginScreen} />
          <Stack.Screen name='SignUp' component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
