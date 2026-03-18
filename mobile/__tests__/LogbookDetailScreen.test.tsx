import React from 'react'
import LogbookDetailScreen from '@/app/(tabs)/logbook/[id]'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const renderer = require('react-test-renderer')

const pushMock = jest.fn()

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
  useLocalSearchParams: () => ({ id: '2' }),
}))

jest.mock('@/hooks/useLogbookQuery', () => ({
  useLogbookEntriesQuery: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useLogbookEntriesQuery } = jest.requireMock('@/hooks/useLogbookQuery') as {
  useLogbookEntriesQuery: jest.Mock
}

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

describe('LogbookDetailScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pushMock.mockReset()
    useLogbookEntriesQuery.mockReturnValue({
      template: {
        id: 2,
        title: 'Dining Room Reports',
        description: 'Front-of-house observations',
      },
      entries: [
        {
          id: 7,
          title: 'Lunch Rush',
          body: 'Strong lunch sales and two guest recovery issues handled.',
          entryDate: '2026-03-18',
          createdAt: '2026-03-18T14:00:00.000Z',
          authorName: 'Jordan Lead',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
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

  it('shows log entries and a way to add another entry', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<LogbookDetailScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const createButton = tree.root.findByProps({ accessibilityLabel: 'Create log entry' })

    expect(texts).toContain('Dining Room Reports')
    expect(texts).toContain('Lunch Rush')
    expect(texts.some((value: unknown) => String(value).includes('Jordan Lead'))).toBe(true)

    renderer.act(() => {
      createButton.props.onPress()
    })

    expect(pushMock).toHaveBeenCalledWith('/(tabs)/logbook/2/new-entry')
  })
})
