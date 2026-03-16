export const PRESTO_ZONES = [
  'People',
  'Routines',
  'Execution',
  'Standards',
  'Team Leadership',
  'Operations & Upkeep',
] as const

export type PrestoZone = (typeof PRESTO_ZONES)[number]

interface PrestoCheckpoint {
  zone: PrestoZone
  label: string
  scoringType: 'pass_fail'
  sortOrder: number
}

export const PRESTO_CHECKPOINTS: PrestoCheckpoint[] = [
  // People
  { zone: 'People', label: 'Shift staffed with aces in places', scoringType: 'pass_fail', sortOrder: 0 },
  { zone: 'People', label: 'Team is friendly and positive energy is felt', scoringType: 'pass_fail', sortOrder: 1 },
  { zone: 'People', label: 'Teamwork is evident', scoringType: 'pass_fail', sortOrder: 2 },
  { zone: 'People', label: 'Team was trained properly and following procedures', scoringType: 'pass_fail', sortOrder: 3 },
  { zone: 'People', label: 'Team is working with a sense of urgency', scoringType: 'pass_fail', sortOrder: 4 },
  { zone: 'People', label: 'Uniforms are following guidelines', scoringType: 'pass_fail', sortOrder: 5 },

  // Routines
  { zone: 'Routines', label: 'Opening and closing procedures are being followed', scoringType: 'pass_fail', sortOrder: 0 },
  { zone: 'Routines', label: 'Deep cleaning checklist is being utilized', scoringType: 'pass_fail', sortOrder: 1 },
  { zone: 'Routines', label: 'Prep list is posted and completed daily', scoringType: 'pass_fail', sortOrder: 2 },
  { zone: 'Routines', label: 'Cooler is organized, items stored properly off the ground', scoringType: 'pass_fail', sortOrder: 3 },
  { zone: 'Routines', label: 'Dry storage areas are organized', scoringType: 'pass_fail', sortOrder: 4 },
  { zone: 'Routines', label: 'FIFO is in place, dates and labels are correct', scoringType: 'pass_fail', sortOrder: 5 },
  { zone: 'Routines', label: '4-hour labels are in place and not expired', scoringType: 'pass_fail', sortOrder: 6 },

  // Execution
  { zone: 'Execution', label: 'Presentation is correct', scoringType: 'pass_fail', sortOrder: 0 },
  { zone: 'Execution', label: 'Temperature and food safety is being followed', scoringType: 'pass_fail', sortOrder: 1 },
  { zone: 'Execution', label: 'All menu items are available', scoringType: 'pass_fail', sortOrder: 2 },

  // Standards
  { zone: 'Standards', label: 'Dining room is clean and meeting standard', scoringType: 'pass_fail', sortOrder: 0 },
  { zone: 'Standards', label: 'Server station is clean and stocked', scoringType: 'pass_fail', sortOrder: 1 },
  { zone: 'Standards', label: 'Bathrooms are clean and stocked', scoringType: 'pass_fail', sortOrder: 2 },
  { zone: 'Standards', label: 'Cook line is organized, clean, and stocked', scoringType: 'pass_fail', sortOrder: 3 },
  { zone: 'Standards', label: 'Oven is clean (front, back, and top)', scoringType: 'pass_fail', sortOrder: 4 },
  { zone: 'Standards', label: 'Dishwasher area is clean and organized', scoringType: 'pass_fail', sortOrder: 5 },
  { zone: 'Standards', label: 'Staff area is cleaned and organized', scoringType: 'pass_fail', sortOrder: 6 },
  { zone: 'Standards', label: 'Kitchen ceiling tiles and walls are clean', scoringType: 'pass_fail', sortOrder: 7 },
  { zone: 'Standards', label: 'Dining room and service wall is organized', scoringType: 'pass_fail', sortOrder: 8 },

  // Team Leadership
  { zone: 'Team Leadership', label: 'Informative and uplifting pre-shifts are being conducted', scoringType: 'pass_fail', sortOrder: 0 },
  { zone: 'Team Leadership', label: 'Everyone knows their primary and secondary focus', scoringType: 'pass_fail', sortOrder: 1 },
  { zone: 'Team Leadership', label: 'Manager table visits ensuring great guest experience', scoringType: 'pass_fail', sortOrder: 2 },
  { zone: 'Team Leadership', label: 'Manager directing team positively, noting great things and opportunities', scoringType: 'pass_fail', sortOrder: 3 },

  // Operations & Upkeep — starts empty (dynamic zone)
]
