import React from 'react'
import TeamDetailScreen from '@/app/(tabs)/areas/teams/[id]'

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
    ActivityIndicator: host('ActivityIndicator'),
    StyleSheet: { create: (styles: unknown) => styles },
  }
})

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '12' }),
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useQuery } = jest.requireMock('@tanstack/react-query') as {
  useQuery: jest.Mock
}

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

describe('TeamDetailScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    useQuery.mockReturnValue({
      data: {
        team: {
          id: 12,
          name: 'AM Kitchen Team',
          description: 'Morning crew',
          memberCount: 4,
          active: true,
        },
        members: [
          { userId: 2, name: 'Pat Cook', email: 'pat@example.com', role: 'lead' },
          { userId: 3, name: 'Jess Prep', email: 'jess@example.com', role: 'member' },
        ],
        nonMembers: [],
      },
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

  it('shows team members and roles', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<TeamDetailScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)

    expect(texts).toContain('AM Kitchen Team')
    expect(texts).toContain('Pat Cook')
    expect(texts).toContain('Jess Prep')
    expect(texts).toContain('lead')
    expect(texts).toContain('member')
  })
})
