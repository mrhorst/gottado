import React from 'react'
import AreasScreen from '@/app/(tabs)/areas/index'

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
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    Platform: { OS: 'ios' },
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/hooks/useSectionQuery', () => ({
  useSectionQuery: jest.fn(),
}))

jest.mock('@/hooks/useTasksQuery', () => ({
  useTasksQuery: jest.fn(),
}))

jest.mock('@/hooks/useSectionMutation', () => ({
  useSectionMutation: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

const { useSectionQuery } = jest.requireMock('@/hooks/useSectionQuery') as {
  useSectionQuery: jest.Mock
}
const { useTasksQuery } = jest.requireMock('@/hooks/useTasksQuery') as {
  useTasksQuery: jest.Mock
}
const { useSectionMutation } = jest.requireMock('@/hooks/useSectionMutation') as {
  useSectionMutation: jest.Mock
}

describe('AreasScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    useSectionQuery.mockReturnValue({
      sections: [{ id: 7, name: 'Kitchen Operations', role: 'owner' }],
      archivedSections: [{ id: 8, name: 'Storage', role: 'owner' }],
      isLoading: false,
      isError: false,
    })
    useTasksQuery.mockReturnValue({
      tasks: [
        {
          id: 1,
          title: 'Line check',
          description: '',
          dueDate: null,
          complete: false,
          sectionId: 7,
          sectionName: 'Kitchen Operations',
          listId: 12,
          listName: 'Opening',
          recurrence: null,
          lastCompletedAt: null,
          deadlineTime: null,
          requiresPicture: false,
          relevanceTag: null,
          priority: 'medium',
        },
      ],
    })
    useSectionMutation.mockReturnValue({
      archiveSection: jest.fn(),
      unarchiveSection: jest.fn(),
      deleteSection: jest.fn(),
      renameSection: jest.fn(),
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

  it('renders the areas hero with the teams entry point', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<AreasScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)

    expect(texts).toContain('Areas')
    expect(texts).toContain('Manage checklists, members, and structure in one place.')
    expect(texts).toContain('Teams')
    expect(texts).toContain('Archived')
    expect(texts).toContain('My Areas')
  })
})
