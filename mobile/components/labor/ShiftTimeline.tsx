import React, { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { colors, layout, radius, spacing } from '@/styles/theme'
import {
  computeTimeRange,
  getHourTicks,
  resolveEndMinutes,
  timeToMinutes,
  timeToPixel,
} from '@/utils/timelineLayout'
import ShiftBar from './ShiftBar'
import type { DayPart, LaborReferenceTeam, LaborShift, ScheduleStatus } from '@/types/labor'

const LANE_HEIGHT = 52
const HEADER_HEIGHT = 28
const TEAM_LABEL_WIDTH = 56
const SCROLLABLE_THRESHOLD_HOURS = 16

interface ShiftTimelineProps {
  shifts: LaborShift[]
  dayParts: DayPart[]
  teams: LaborReferenceTeam[]
  scheduleStatus: ScheduleStatus
  onShiftPress: (shift: LaborShift) => void
  onEmptyPress?: (time: string, teamId: number) => void
}

const ShiftTimeline = React.memo(
  ({ shifts, dayParts, teams, scheduleStatus, onShiftPress, onEmptyPress }: ShiftTimelineProps) => {
    const { width: screenWidth } = useWindowDimensions()
    const containerWidth = screenWidth - layout.screenPadding * 2

    const { rangeStart, rangeEnd } = useMemo(
      () => computeTimeRange(dayParts, shifts),
      [dayParts, shifts]
    )

    const rangeDurationHours = (rangeEnd - rangeStart) / 60
    const isScrollable = rangeDurationHours > SCROLLABLE_THRESHOLD_HOURS
    const timelineWidth = isScrollable
      ? (rangeDurationHours / SCROLLABLE_THRESHOLD_HOURS) * (containerWidth - TEAM_LABEL_WIDTH)
      : containerWidth - TEAM_LABEL_WIDTH

    const hourTicks = useMemo(() => getHourTicks(rangeStart, rangeEnd), [rangeStart, rangeEnd])

    // Group shifts by team
    const shiftsByTeam = useMemo(() => {
      const map = new Map<number, LaborShift[]>()
      for (const shift of shifts) {
        if (shift.assignedTeamId == null) continue
        const existing = map.get(shift.assignedTeamId) ?? []
        existing.push(shift)
        map.set(shift.assignedTeamId, existing)
      }
      return map
    }, [shifts])

    // Unassigned shifts (no team)
    const unassignedShifts = useMemo(
      () => shifts.filter((s) => s.assignedTeamId == null),
      [shifts]
    )

    // Only show teams that have shifts or are in the references
    const visibleTeams = useMemo(() => {
      const teamsWithShifts = new Set(shifts.map((s) => s.assignedTeamId).filter(Boolean))
      return teams.filter((t) => teamsWithShifts.has(t.id) || teams.length <= 6)
    }, [teams, shifts])

    const isDraft = scheduleStatus === 'draft'

    const handleEmptyPress = (teamId: number, pageX: number, timelineLeft: number) => {
      if (!onEmptyPress) return
      const relativeX = pageX - timelineLeft - TEAM_LABEL_WIDTH
      const minutes = rangeStart + (relativeX / timelineWidth) * (rangeEnd - rangeStart)
      // Snap to 15 minutes
      const snapped = Math.round(minutes / 15) * 15
      const h = Math.floor(snapped / 60)
      const m = snapped % 60
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      onEmptyPress(time, teamId)
    }

    const renderLane = (teamId: number, teamName: string, teamColor: string) => {
      const laneShifts = shiftsByTeam.get(teamId) ?? []

      return (
        <View key={teamId} style={s.lane}>
          <View style={[s.teamLabel, { backgroundColor: teamColor + '18' }]}>
            <View style={[s.teamDot, { backgroundColor: teamColor }]} />
            <Text style={s.teamName} numberOfLines={2}>
              {teamName}
            </Text>
          </View>
          <Pressable
            style={[s.laneTrack, { width: timelineWidth }]}
            onPress={(e) => handleEmptyPress(teamId, e.nativeEvent.pageX, 0)}
          >
            {laneShifts.map((shift) => {
              const startMin = timeToMinutes(shift.startTime)
              const endMin = resolveEndMinutes(startMin, timeToMinutes(shift.endTime))
              const left = timeToPixel(startMin, rangeStart, rangeEnd, timelineWidth)
              const right = timeToPixel(endMin, rangeStart, rangeEnd, timelineWidth)

              return (
                <ShiftBar
                  key={shift.id}
                  shift={shift}
                  left={left}
                  width={right - left}
                  isDraft={isDraft}
                  onPress={onShiftPress}
                />
              )
            })}
          </Pressable>
        </View>
      )
    }

    const timelineContent = (
      <>
        {/* Hour ticks header */}
        <View style={s.headerRow}>
          <View style={s.teamLabelSpacer} />
          <View style={[s.tickRow, { width: timelineWidth }]}>
            {hourTicks.map((tick) => {
              const x = timeToPixel(tick.minutes, rangeStart, rangeEnd, timelineWidth)
              return (
                <View key={tick.minutes} style={[s.tick, { left: x }]}>
                  <Text style={s.tickLabel}>{tick.label}</Text>
                  <View style={s.tickLine} />
                </View>
              )
            })}
          </View>
        </View>

        {/* Day part bands */}
        {dayParts.length > 0 && (
          <View style={s.headerRow}>
            <View style={s.teamLabelSpacer} />
            <View style={[s.dayPartRow, { width: timelineWidth }]}>
              {dayParts.map((dp) => {
                const left = timeToPixel(
                  timeToMinutes(dp.startTime),
                  rangeStart,
                  rangeEnd,
                  timelineWidth
                )
                const right = timeToPixel(
                  timeToMinutes(dp.endTime),
                  rangeStart,
                  rangeEnd,
                  timelineWidth
                )
                return (
                  <View key={dp.id} style={[s.dayPartBand, { left, width: right - left }]}>
                    <Text style={s.dayPartLabel} numberOfLines={1}>
                      {dp.name}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Team lanes */}
        {visibleTeams.map((t) => renderLane(t.id, t.name, t.color))}

        {/* Unassigned lane */}
        {unassignedShifts.length > 0 && (
          <View style={s.lane}>
            <View style={[s.teamLabel, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={s.teamName} numberOfLines={2}>
                Unassigned
              </Text>
            </View>
            <View style={[s.laneTrack, { width: timelineWidth }]}>
              {unassignedShifts.map((shift) => {
                const startMin = timeToMinutes(shift.startTime)
                const endMin = timeToMinutes(shift.endTime)
                const left = timeToPixel(startMin, rangeStart, rangeEnd, timelineWidth)
                const right = timeToPixel(endMin, rangeStart, rangeEnd, timelineWidth)

                return (
                  <ShiftBar
                    key={shift.id}
                    shift={shift}
                    left={left}
                    width={right - left}
                    isDraft={isDraft}
                    onPress={onShiftPress}
                  />
                )
              })}
            </View>
          </View>
        )}
      </>
    )

    if (isScrollable) {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={s.container}>{timelineContent}</View>
        </ScrollView>
      )
    }

    return <View style={s.container}>{timelineContent}</View>
  }
)

ShiftTimeline.displayName = 'ShiftTimeline'
export default ShiftTimeline

const s = StyleSheet.create({
  container: {
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
  },
  teamLabelSpacer: {
    width: TEAM_LABEL_WIDTH,
  },
  tickRow: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  tickLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tickLine: {
    width: 1,
    flex: 1,
    backgroundColor: colors.borderSubtle,
    marginTop: 2,
  },
  dayPartRow: {
    height: 20,
    position: 'relative',
    marginBottom: 4,
  },
  dayPartBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  dayPartLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  lane: {
    flexDirection: 'row',
    height: LANE_HEIGHT,
  },
  teamLabel: {
    width: TEAM_LABEL_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teamName: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  laneTrack: {
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
})
