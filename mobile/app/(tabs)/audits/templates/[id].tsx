import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useAuditTemplateDetailQuery } from '@/hooks/useAuditTemplatesQuery'
import { useAuditTemplatesMutation } from '@/hooks/useAuditTemplatesMutation'
import { colors, spacing, typography } from '@/styles/theme'

const PRESTO_ZONES = [
  'People',
  'Routines',
  'Execution',
  'Standards',
  'Team Leadership',
  'Operations & Upkeep',
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  zoneHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  checkpointCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkpointLabel: {
    ...typography.body1,
    flex: 1,
  },
  checkpointType: {
    ...typography.caption,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  addSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addSectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    marginBottom: spacing.sm,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  scoringToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scoringOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoringOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scoringOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  scoringOptionTextActive: {
    color: '#fff',
  },
  frameworkBadge: {
    backgroundColor: '#5856D620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  frameworkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5856D6',
    textTransform: 'uppercase',
  },
  zonePickerLabel: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  zonePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  zoneOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zoneOptionActive: {
    backgroundColor: '#5856D6',
    borderColor: '#5856D6',
  },
  zoneOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  zoneOptionTextActive: {
    color: '#fff',
  },
})

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { template, isLoading } = useAuditTemplateDetailQuery(Number(id))
  const { addCheckpoint, removeCheckpoint } = useAuditTemplatesMutation()

  const [zone, setZone] = useState('')
  const [label, setLabel] = useState('')
  const [scoringType, setScoringType] = useState<'score' | 'pass_fail'>(
    'score'
  )

  if (isLoading || !template) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  const isPresto = template.frameworkTag === 'presto'
  const zones = Object.keys(template.checkpoints || {})

  const handleAdd = () => {
    if (!zone.trim() || !label.trim()) return
    addCheckpoint({
      templateId: Number(id),
      zone: zone.trim(),
      label: label.trim(),
      scoringType,
    })
    setLabel('')
  }

  const handleRemove = (checkpointId: number) => {
    Alert.alert('Remove Checkpoint', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeCheckpoint({ templateId: Number(id), checkpointId }),
      },
    ])
  }

  const allCheckpoints = zones.flatMap((z) =>
    (template.checkpoints[z] || []).map((cp) => ({ ...cp, _zone: z }))
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={allCheckpoints}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            <Text style={{ ...typography.h2, marginBottom: spacing.sm }}>
              {template.name}
            </Text>
            {isPresto && (
              <View style={styles.frameworkBadge}>
                <Text style={styles.frameworkText}>PRESTO</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          const showZoneHeader =
            index === 0 || allCheckpoints[index - 1]._zone !== item._zone
          return (
            <>
              {showZoneHeader && (
                <Text style={styles.zoneHeader}>{item._zone}</Text>
              )}
              <Pressable
                style={styles.checkpointCard}
                onLongPress={() => handleRemove(item.id)}
              >
                <Text style={styles.checkpointLabel}>{item.label}</Text>
                <Text style={styles.checkpointType}>{item.scoringType}</Text>
              </Pressable>
            </>
          )
        }}
        ListFooterComponent={
          <View style={styles.addSection}>
            <Text style={styles.addSectionTitle}>Add Checkpoint</Text>

            {/* Zone input: dropdown for PRESTO, free-text otherwise */}
            {isPresto ? (
              <>
                <Text style={styles.zonePickerLabel}>Zone</Text>
                <View style={styles.zonePicker}>
                  {PRESTO_ZONES.map((z) => (
                    <Pressable
                      key={z}
                      style={[
                        styles.zoneOption,
                        zone === z && styles.zoneOptionActive,
                      ]}
                      onPress={() => setZone(z)}
                    >
                      <Text
                        style={[
                          styles.zoneOptionText,
                          zone === z && styles.zoneOptionTextActive,
                        ]}
                      >
                        {z}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <TextInput
                style={styles.input}
                value={zone}
                onChangeText={setZone}
                placeholder='Zone (e.g., Kitchen, Bathroom)'
              />
            )}

            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder='Checkpoint label'
            />
            <View style={styles.scoringToggle}>
              <Pressable
                style={[
                  styles.scoringOption,
                  scoringType === 'score' && styles.scoringOptionActive,
                ]}
                onPress={() => setScoringType('score')}
              >
                <Text
                  style={[
                    styles.scoringOptionText,
                    scoringType === 'score' && styles.scoringOptionTextActive,
                  ]}
                >
                  Score (0-5)
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.scoringOption,
                  scoringType === 'pass_fail' && styles.scoringOptionActive,
                ]}
                onPress={() => setScoringType('pass_fail')}
              >
                <Text
                  style={[
                    styles.scoringOptionText,
                    scoringType === 'pass_fail' &&
                      styles.scoringOptionTextActive,
                  ]}
                >
                  Pass / Fail
                </Text>
              </Pressable>
            </View>
            <Pressable style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add Checkpoint</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  )
}
