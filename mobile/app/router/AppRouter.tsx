import LoginScreen from '../screens/auth/LoginScreen'
import TasksScreen from '../screens/tasks/TasksScreen'
import DashboardScreen from '../screens/DashboardScreen'
import ProfileScreen from '../screens/user/ProfileScreen'
import NewTaskScreen from '../screens/tasks/NewTaskScreen'
import AddSectionMemberScreen from '../screens/sections/AddSectionMemberScreen'
import SectionDetailScreen from '../screens/sections/SectionDetailScreen'
import SectionListScreen from '../screens/sections/SectionListScreen'
import SignupScreen from '../screens/auth/SignupScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useLoggedUser } from '../context/user/UserContext'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: 'grey',
        tabBarActiveTintColor: 'blue',
        animation: 'shift',
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
            name='CreateTask'
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
