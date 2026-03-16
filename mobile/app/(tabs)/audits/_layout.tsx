import { Stack } from 'expo-router'

export default function AuditsLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ title: 'Audits' }} />
      <Stack.Screen
        name='templates/index'
        options={{ title: 'Templates' }}
      />
      <Stack.Screen
        name='templates/[id]'
        options={{ title: 'Template Detail' }}
      />
      <Stack.Screen
        name='templates/create'
        options={{ title: 'New Template', presentation: 'modal' }}
      />
      <Stack.Screen name='runs/index' options={{ title: 'Audit History' }} />
      <Stack.Screen name='runs/[id]' options={{ title: 'Audit Summary' }} />
      <Stack.Screen
        name='runs/conduct/[runId]'
        options={{ title: 'Conduct Audit', headerBackVisible: false }}
      />
      <Stack.Screen
        name='actions/[runId]'
        options={{ title: 'Action Plan' }}
      />
      <Stack.Screen
        name='follow-ups/[id]'
        options={{ title: 'Follow-Up Review' }}
      />
    </Stack>
  )
}
