import React from 'react'
import TaskDetailsScreen from '@/app/(tabs)/tasks/details/[id]'

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
    Image: host('Image'),
    StyleSheet: { create: (styles: unknown) => styles },
    Alert: { alert: jest.fn() },
    Platform: { OS: 'ios' },
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '14' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}))

jest.mock('@/hooks/useTasksQuery', () => ({
  useTasksQuery: jest.fn(),
}))

jest.mock('@/hooks/useTaskHistoryQuery', () => ({
  useTaskHistoryQuery: jest.fn(),
}))

jest.mock('@/hooks/useTasksMutation', () => ({
  useTasksMutation: jest.fn(),
}))

const { useTasksQuery } = jest.requireMock('@/hooks/useTasksQuery') as {
  useTasksQuery: jest.Mock
}
const { useTaskHistoryQuery } = jest.requireMock('@/hooks/useTaskHistoryQuery') as {
  useTaskHistoryQuery: jest.Mock
}
const { useTasksMutation } = jest.requireMock('@/hooks/useTasksMutation') as {
  useTasksMutation: jest.Mock
}

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

describe('TaskDetailsScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    useTasksQuery.mockReturnValue({
      isLoading: false,
      tasks: [
        {
          id: 14,
          title: 'Clean fryers',
          description: 'Deep clean the fryer station.',
          dueDate: '2026-03-17',
          complete: true,
          sectionId: 7,
          sectionName: 'Kitchen Operations',
          listId: 2,
          listName: 'Closing',
          recurrence: 'daily',
          lastCompletedAt: '2026-03-17T14:30:00.000Z',
          deadlineTime: '15:00',
          requiresPicture: true,
          relevanceTag: null,
          priority: 'high',
        },
      ],
    })
    useTaskHistoryQuery.mockReturnValue({
      isLoading: false,
      completions: [
        {
          id: 10,
          taskId: 14,
          completedAt: '2026-03-17T14:30:00.000Z',
          dueDate: '2026-03-17',
          deadlineTime: '15:00',
          onTime: true,
          pictureUrl: '/uploads/today.jpg',
        },
        {
          id: 9,
          taskId: 14,
          completedAt: '2026-03-16T14:20:00.000Z',
          dueDate: '2026-03-16',
          deadlineTime: '15:00',
          onTime: true,
          pictureUrl: '/uploads/yesterday.jpg',
        },
      ],
    })
    useTasksMutation.mockReturnValue({
      toggleCompleteAsync: jest.fn(),
      completeWithPicture: jest.fn(),
      isTogglingComplete: false,
      isUploadingPicture: false,
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

  it('shows only the current cycle evidence for a recurring task', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<TaskDetailsScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const images = tree.root.findAllByType('Image')
    const imageUris = images.map((node: any) => node.props.source?.uri)

    expect(texts).toContain('Current Evidence')
    expect(texts).not.toContain('Completion Photos')
    expect(imageUris).toContain('/uploads/today.jpg')
    expect(imageUris).not.toContain('/uploads/yesterday.jpg')
  })
})
