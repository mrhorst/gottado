import { StyleSheet, Text, View } from 'react-native'
import { TaskPriority } from '@/services/taskService'

const PRIORITY_META: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  low: { label: 'Low', bg: '#34C75915', text: '#34C759' },
  medium: { label: 'Medium', bg: '#FF950015', text: '#FF9500' },
  high: { label: 'High', bg: '#FF3B3015', text: '#FF3B30' },
}

const PriorityBadge = ({ priority = 'medium' }: { priority?: TaskPriority | null }) => {
  const meta = PRIORITY_META[priority ?? 'medium']
  return (
    <View style={[s.pill, { backgroundColor: meta.bg }]}>
      <Text style={[s.text, { color: meta.text }]}>{meta.label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  pill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
})

export default PriorityBadge
