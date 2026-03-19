import React, { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing } from '@/styles/theme'

interface DateStripProps {
  selectedDate: string
  onSelect: (date: string) => void
}

const generateDates = (center: string, range: number): string[] => {
  const dates: string[] = []
  const base = new Date(`${center}T12:00:00`)
  for (let i = -range; i <= range; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

const formatDay = (dateStr: string) => {
  const d = new Date(`${dateStr}T12:00:00`)
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
    day: d.getDate(),
  }
}

const today = () => new Date().toISOString().slice(0, 10)

const DateStrip = React.memo(({ selectedDate, onSelect }: DateStripProps) => {
  const dates = useMemo(() => generateDates(selectedDate, 7), [selectedDate])
  const todayStr = today()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.strip}
    >
      {dates.map((date) => {
        const { weekday, day } = formatDay(date)
        const isSelected = date === selectedDate
        const isToday = date === todayStr

        return (
          <Pressable
            key={date}
            onPress={() => onSelect(date)}
            style={[s.pill, isSelected && s.pillSelected]}
          >
            <Text style={[s.weekday, isSelected && s.textSelected]}>{weekday}</Text>
            <Text
              style={[
                s.day,
                isSelected && s.textSelected,
                isToday && !isSelected && s.dayToday,
              ]}
            >
              {day}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

DateStrip.displayName = 'DateStrip'
export default DateStrip

const s = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: 4,
  },
  pill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 48,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekday: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  day: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  dayToday: {
    color: colors.primary,
  },
  textSelected: {
    color: '#fff',
  },
})
