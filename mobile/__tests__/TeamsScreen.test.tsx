import React from 'react'
import TeamsScreen from '@/app/(tabs)/areas/teams/index'

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
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/hooks/useTeamsQuery', () => ({
  useTeamsQuery: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useTeamsQuery } = jest.requireMock('@/hooks/useTeamsQuery') as {
  useTeamsQuery: jest.Mock
}

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

describe('TeamsScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    useTeamsQuery.mockReturnValue({
      teams: [
        { id: 12, name: 'AM Kitchen Team', description: 'Morning crew', memberCount: 4, active: true },
        { id: 13, name: 'PM Kitchen Team', description: 'Closing crew', memberCount: 3, active: true },
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

  it('renders teams inside the areas module', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<TeamsScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)

    expect(texts).toContain('Teams')
    expect(texts).toContain('AM Kitchen Team')
    expect(texts).toContain('PM Kitchen Team')
    expect(texts).toContain('Manage ownership across areas without changing access control.')
  })
})
