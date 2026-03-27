import React from 'react'
import IssuesScreen from '@/app/(tabs)/issues/index'

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
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

jest.mock('@/hooks/useIssuesQuery', () => ({
  useIssueRecordsQuery: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useIssueRecordsQuery } = jest.requireMock('@/hooks/useIssuesQuery') as {
  useIssueRecordsQuery: jest.Mock
}

const getTextNodes = (tree: any) => tree.root.findAll((node: any) => node.type === 'Text')

describe('IssuesScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pushMock.mockReset()
    useIssueRecordsQuery.mockReturnValue({
      selectedDate: '2026-03-18',
      categoryFilter: 'all',
      setCategoryFilter: jest.fn(),
      records: [
        {
          id: 5,
          category: 'guest',
          severity: 'high',
          title: 'Guest complaint about cold food',
          entryDate: '2026-03-18',
          areaName: 'Dining Room',
          followUpRequired: true,
          notes: 'Table 12 received entrees below temp.',
        },
      ],
      summary: {
        total: 1,
        followUpCount: 1,
        highSeverityCount: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
    })
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((message?: unknown) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) {
        return
      }
    })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('shows issues and exposes a create entry point', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<IssuesScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const createButton = tree.root.findByProps({ accessibilityLabel: 'Create issue' })

    expect(texts).toContain('Issues')
    expect(texts).toContain('Guest complaint about cold food')
    expect(texts).toContain('Dining Room')
    expect(texts).toContain('Guest')

    renderer.act(() => {
      createButton.props.onPress()
    })

    expect(pushMock).toHaveBeenCalledWith('/(tabs)/issues/new')
  })
})
