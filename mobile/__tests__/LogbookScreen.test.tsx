import React from 'react'
import LogbookScreen from '@/app/(tabs)/logbook/index'

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
}))

jest.mock('@/hooks/useLogbookQuery', () => ({
  useLogbookTemplatesQuery: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useLogbookTemplatesQuery } = jest.requireMock('@/hooks/useLogbookQuery') as {
  useLogbookTemplatesQuery: jest.Mock
}

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

describe('LogbookScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pushMock.mockReset()
    useLogbookTemplatesQuery.mockReturnValue({
      templates: [
        {
          id: 1,
          title: 'General Log',
          description: 'Daily operating notes',
          isSystem: true,
          entryCount: 3,
          lastEntryAt: '2026-03-18T12:00:00.000Z',
          lastEntryPreview: 'Opened strong and labor was on target.',
          lastAuthorName: 'Alex Manager',
        },
        {
          id: 2,
          title: 'Dining Room Reports',
          description: 'Front-of-house observations',
          isSystem: false,
          entryCount: 1,
          lastEntryAt: '2026-03-18T13:00:00.000Z',
          lastEntryPreview: 'Two guest recoveries and one table move.',
          lastAuthorName: 'Jordan Lead',
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

  it('shows general and custom logs with a visible create entry point', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<LogbookScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const createButton = tree.root.findByProps({ accessibilityLabel: 'Create log type' })

    expect(texts).toContain('Manager Logbook')
    expect(texts).toContain('General Log')
    expect(texts).toContain('Dining Room Reports')

    renderer.act(() => {
      createButton.props.onPress()
    })

    expect(pushMock).toHaveBeenCalledWith('/(tabs)/logbook/new')
  })
})
