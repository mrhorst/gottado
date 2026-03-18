import React from 'react'
import SnapshotScreen from '@/app/(tabs)/tasks/snapshot'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const renderer = require('react-test-renderer')

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

jest.mock('react-native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')

  const host = (name: string) => {
    const Component = ({ children, ...props }: any) =>
      React.createElement(name, props, children)
    Component.displayName = name
    return Component
  }

  const FlatList = ({
    data = [],
    ListHeaderComponent,
    ListEmptyComponent,
    renderItem,
  }: any) => {
    const header =
      typeof ListHeaderComponent === 'function'
        ? React.createElement(ListHeaderComponent)
        : ListHeaderComponent
    const empty =
      typeof ListEmptyComponent === 'function'
        ? React.createElement(ListEmptyComponent)
        : ListEmptyComponent

    return React.createElement(
      'FlatList',
      {},
      header,
      data.length === 0
        ? empty
        : data.map((item: any, index: number) =>
            React.createElement(
              React.Fragment,
              { key: `${item.id}-${index}` },
              renderItem?.({ item, index })
            )
          )
    )
  }

  return {
    View: host('View'),
    Text: host('Text'),
    Pressable: host('Pressable'),
    ActivityIndicator: host('ActivityIndicator'),
    FlatList,
    Image: host('Image'),
    StyleSheet: { create: (styles: unknown) => styles },
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('@/hooks/useTaskHistoryQuery', () => ({
  useDailySnapshotQuery: jest.fn(),
}))

const { useDailySnapshotQuery } = jest.requireMock('@/hooks/useTaskHistoryQuery') as {
  useDailySnapshotQuery: jest.Mock
}

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

describe('SnapshotScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    useDailySnapshotQuery.mockReturnValue({
      isLoading: false,
      snapshot: {
        date: '2026-03-16',
        summary: {
          total: 1,
          onTime: 1,
          late: 0,
          noDeadline: 0,
        },
        completions: [
          {
            id: 99,
            taskId: 14,
            taskTitle: 'Clean fryers',
            sectionName: 'Kitchen Operations',
            recurrence: 'daily',
            completedAt: '2026-03-16T14:30:00.000Z',
            dueDate: '2026-03-16',
            deadlineTime: '15:00',
            onTime: true,
            requiresPicture: true,
            pictureUrl: '/uploads/fryers-clean.jpg',
            completedBy: 7,
            completedByName: 'Jordan Smith',
          },
          {
            id: 100,
            taskId: 22,
            taskTitle: 'Refill sauces',
            sectionName: 'Front Counter',
            recurrence: null,
            completedAt: '2026-03-16T15:10:00.000Z',
            dueDate: '2026-03-16',
            deadlineTime: null,
            onTime: null,
            requiresPicture: false,
            pictureUrl: null,
            completedBy: 8,
            completedByName: 'Taylor Reed',
          },
        ],
      },
    })
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((message?: unknown) => {
      if (
        typeof message === 'string' &&
        message.includes('react-test-renderer is deprecated')
      ) {
        return
      }
    })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('opens completion details with assignee and photo evidence from the snapshot list', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<SnapshotScreen />)
    })

    const card = tree.root.findByProps({
      accessibilityLabel: 'Open completion details for Clean fryers',
    })

    expect(getTextNodes(tree).map((node: any) => node.props.children)).toContain(
      'Requires photo'
    )

    renderer.act(() => {
      card.props.onPress()
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const image = tree.root.findByType('Image')

    expect(texts).toContain('Completed by')
    expect(texts).toContain('Jordan Smith')
    expect(texts).toContain('Photo uploaded')
    expect(image.props.source).toEqual({
      uri: '/uploads/fryers-clean.jpg',
    })
  })

  it('groups snapshot completions by area', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<SnapshotScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)

    expect(texts).toContain('Kitchen Operations')
    expect(texts).toContain('Front Counter')
    expect(texts).toContain('1 task')
  })
})
