import React from 'react'
import TasksScreen from '@/app/(tabs)/tasks/index'

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

const { useSectionQuery } = jest.requireMock('@/hooks/useSectionQuery') as {
  useSectionQuery: jest.Mock
}
const { useTasksQuery } = jest.requireMock('@/hooks/useTasksQuery') as {
  useTasksQuery: jest.Mock
}

describe('TasksScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pushMock.mockReset()
    useSectionQuery.mockReturnValue({
      sections: [{ id: 7, name: 'Kitchen Operations', role: 'editor' }],
      isLoading: false,
    })
    useTasksQuery.mockReturnValue({
      isLoading: false,
      tasks: [
        {
          id: 1,
          title: 'Line check',
          description: '',
          dueDate: new Date().toISOString().split('T')[0],
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

  it('uses the new task overview hero instead of the old areas heading', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<TasksScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)

    expect(texts).toContain('Tasks')
    expect(texts).toContain('Choose an area')
    expect(texts).toContain('Open a checklist and start checking work off.')
    expect(texts).not.toContain('Pick an area to open its checklists and start checking work off.')
  })
})
