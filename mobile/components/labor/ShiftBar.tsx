import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { radius } from '@/styles/theme'
import type { LaborShift } from '@/types/labor'

interface ShiftBarProps {
  shift: LaborShift
  left: number
  width: number
  isDraft: boolean
  onPress: (shift: LaborShift) => void
}

const ShiftBar = React.memo(({ shift, left, width, isDraft, onPress }: ShiftBarProps) => {
  const barColor = shift.teamColor ?? '#6B7280'
  const label = shift.assignedUserName ?? shift.title

  return (
    <Pressable
      onPress={() => onPress(shift)}
      style={[
        s.bar,
        {
          left,
          width: Math.max(width, 24), // minimum touchable width
          backgroundColor: barColor,
          opacity: isDraft ? 0.6 : 1,
        },
      ]}
      accessibilityLabel={`${shift.title}, ${shift.startTime} to ${shift.endTime}`}
    >
      <Text style={s.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={s.time} numberOfLines={1}>
        {shift.startTime}–{shift.endTime}
      </Text>
    </Pressable>
  )
})

ShiftBar.displayName = 'ShiftBar'
export default ShiftBar

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    justifyContent: 'center',
    minHeight: 36,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  time: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
})
