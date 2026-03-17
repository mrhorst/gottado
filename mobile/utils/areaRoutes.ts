export const getAreaOperationsPath = (
  areaId: number
): `/(tabs)/tasks/area/${number}` => `/(tabs)/tasks/area/${areaId}`

export const getAreaChecklistPath = (
  areaId: number,
  listId: number
): `/(tabs)/tasks/area/${number}/list/${number}` =>
  `/(tabs)/tasks/area/${areaId}/list/${listId}`

export const getAreaSettingsPath = (
  areaId: number
): `/(tabs)/areas/${number}` => `/(tabs)/areas/${areaId}`
