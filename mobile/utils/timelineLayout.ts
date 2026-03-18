import type { DayPart, LaborShift } from '@/types/labor'

/** Parse "HH:MM" to minutes since midnight */
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Format minutes since midnight back to "HH:MM" */
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Compute the visible time range from day parts, expanding if shifts fall outside */
export const computeTimeRange = (
  dayParts: DayPart[],
  shifts: LaborShift[]
): { rangeStart: number; rangeEnd: number } => {
  let rangeStart = 6 * 60 // 06:00 default
  let rangeEnd = 23 * 60 // 23:00 default

  if (dayParts.length > 0) {
    rangeStart = Math.min(...dayParts.map((dp) => timeToMinutes(dp.startTime)))
    rangeEnd = Math.max(...dayParts.map((dp) => timeToMinutes(dp.endTime)))
  }

  // Expand if shifts fall outside the day-part range
  for (const shift of shifts) {
    const start = timeToMinutes(shift.startTime)
    const end = timeToMinutes(shift.endTime)
    if (start < rangeStart) rangeStart = start
    if (end > rangeEnd) rangeEnd = end
  }

  // Ensure at least 1 hour range
  if (rangeEnd - rangeStart < 60) {
    rangeEnd = rangeStart + 60
  }

  return { rangeStart, rangeEnd }
}

/** Map a time (in minutes) to a pixel offset within the given width */
export const timeToPixel = (
  timeMinutes: number,
  rangeStart: number,
  rangeEnd: number,
  widthPx: number
): number => {
  const rangeDuration = rangeEnd - rangeStart
  if (rangeDuration <= 0) return 0
  return ((timeMinutes - rangeStart) / rangeDuration) * widthPx
}

/** Generate hour tick marks for the timeline header */
export const getHourTicks = (
  rangeStart: number,
  rangeEnd: number
): { minutes: number; label: string }[] => {
  const ticks: { minutes: number; label: string }[] = []
  // Start at the next full hour after rangeStart
  const firstHour = Math.ceil(rangeStart / 60) * 60
  for (let m = firstHour; m <= rangeEnd; m += 60) {
    const h = m / 60
    ticks.push({
      minutes: m,
      label: h <= 12 ? `${h === 0 ? 12 : h}${h < 12 ? 'a' : 'p'}` : `${h - 12}p`,
    })
  }
  return ticks
}
