import React from 'react'
import AreaScreen from '@/app/(tabs)/tasks/area/[id]'

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
  useRouter: () => ({
    push: pushMock,
  }),
  useLocalSearchParams: () => ({ id: '7' }),
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('@/hooks/useSectionQuery', () => ({
  useSectionQuery: jest.fn(),
}))

jest.mock('@/hooks/useTasksQuery', () => ({
  useTasksQuery: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

const { useQuery } = jest.requireMock('@tanstack/react-query') as {
  useQuery: jest.Mock
}
const { useSectionQuery } = jest.requireMock('@/hooks/useSectionQuery') as {
  useSectionQuery: jest.Mock
}
const { useTasksQuery } = jest.requireMock('@/hooks/useTasksQuery') as {
  useTasksQuery: jest.Mock
}

describe('AreaScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pushMock.mockReset()
    useSectionQuery.mockReturnValue({
      sections: [{ id: 7, name: 'Kitchen Operations', role: 'editor' }],
      isLoading: false,
    })
    useTasksQuery.mockReturnValue({
      tasks: [],
      isLoading: false,
    })
    useQuery.mockReturnValue({
      data: [],
      isLoading: false,
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

  it('shows a settings action beside the area title without rendering the old manage card', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<AreaScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const settingsButton = tree.root.findByProps({ accessibilityLabel: 'Open area settings' })

    expect(texts).toContain('Kitchen Operations')
    expect(texts).not.toContain('Manage Area')
    expect(texts).not.toContain('Need to change members or create a checklist?')
    expect(settingsButton).toBeDefined()

    renderer.act(() => {
      settingsButton.props.onPress()
    })

    expect(pushMock).toHaveBeenCalledWith('/(tabs)/areas/7')
  })
})
