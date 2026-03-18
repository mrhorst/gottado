import React from 'react'
import CostsScreen from '@/app/(tabs)/costs/index'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const renderer = require('react-test-renderer')

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const pushMock = jest.fn()

jest.mock('react-native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')

  const host = (name: string) => {
    const Component = ({ children, ...props }: any) =>
      React.createElement(name, props, children)
    Component.displayName = name
    return Component
  }

  return {
    View: host('View'),
    Text: host('Text'),
    ScrollView: host('ScrollView'),
    Pressable: host('Pressable'),
    ActivityIndicator: host('ActivityIndicator'),
    StyleSheet: { create: (styles: unknown) => styles },
    Platform: { OS: 'web' },
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

jest.mock('@/hooks/useCostsQuery', () => ({
  useCostRecordsQuery: jest.fn(),
}))

jest.mock('@/services/costsService', () => ({
  exportCostRecordsCsv: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useCostRecordsQuery } = jest.requireMock('@/hooks/useCostsQuery') as {
  useCostRecordsQuery: jest.Mock
}
const { exportCostRecordsCsv } = jest.requireMock('@/services/costsService') as {
  exportCostRecordsCsv: jest.Mock
}

const getTextNodes = (tree: any) => tree.root.findAll((node: any) => node.type === 'Text')

describe('CostsScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pushMock.mockReset()
    useCostRecordsQuery.mockReturnValue({
      selectedDate: '2026-03-18',
      records: [
        {
          id: 3,
          kind: 'waste',
          title: 'Spoiled produce',
          entryDate: '2026-03-18',
          amount: '86.50',
          areaName: 'Kitchen Ops',
          vendorName: 'Fresh Greens Co.',
          notes: 'Walk-in cooler issue overnight.',
        },
      ],
      kindFilter: 'all',
      setKindFilter: jest.fn(),
      summary: {
        totalAmount: '86.50',
        wasteCount: 1,
        purchaseCount: 0,
        vendorIssueCount: 0,
      },
      goToPreviousDate: jest.fn(),
      goToNextDate: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    })
    exportCostRecordsCsv.mockResolvedValue('entryDate,kind,title\n2026-03-18,waste,Spoiled produce')
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((message?: unknown) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) {
        return
      }
    })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('shows cost records, supports filters, and exposes create/export actions', async () => {
    let tree: any

    await renderer.act(async () => {
      tree = renderer.create(<CostsScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const createButton = tree.root.findByProps({ accessibilityLabel: 'Create cost record' })
    const exportButton = tree.root.findByProps({ accessibilityLabel: 'Export cost records' })

    expect(texts).toContain('Costs')
    expect(texts).toContain('Spoiled produce')
    expect(texts).toContain('Kitchen Ops')
    expect(texts).toContain('Fresh Greens Co.')
    expect(texts).toContain('All')
    expect(texts).toContain('Waste')

    renderer.act(() => {
      createButton.props.onPress()
    })

    expect(pushMock).toHaveBeenCalledWith('/(tabs)/costs/new')

    await renderer.act(async () => {
      await exportButton.props.onPress()
    })

    expect(exportCostRecordsCsv).toHaveBeenCalledWith({
      from: '2026-03-18',
      to: '2026-03-18',
      kind: 'all',
    })
  })
})
