import React from 'react'
import NewIssueScreen from '@/app/(tabs)/issues/new'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const renderer = require('react-test-renderer')

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const backMock = jest.fn()
const mutateMock = jest.fn()

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
    TextInput: host('TextInput'),
    ScrollView: host('ScrollView'),
    KeyboardAvoidingView: host('KeyboardAvoidingView'),
    Pressable: host('Pressable'),
    ActivityIndicator: host('ActivityIndicator'),
    StyleSheet: { create: (styles: unknown) => styles },
    Platform: { OS: 'web' },
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: backMock }),
}))

jest.mock('@/hooks/useIssuesQuery', () => ({
  useIssueReferencesQuery: jest.fn(),
}))

jest.mock('@/hooks/useIssuesMutation', () => ({
  useCreateIssueRecordMutation: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useIssueReferencesQuery } = jest.requireMock('@/hooks/useIssuesQuery') as {
  useIssueReferencesQuery: jest.Mock
}
const { useCreateIssueRecordMutation } = jest.requireMock('@/hooks/useIssuesMutation') as {
  useCreateIssueRecordMutation: jest.Mock
}

describe('NewIssueScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    backMock.mockReset()
    mutateMock.mockReset()

    useIssueReferencesQuery.mockReturnValue({
      areas: [{ id: 7, name: 'Dining Room' }],
      isLoading: false,
      isError: false,
      error: null,
    })

    useCreateIssueRecordMutation.mockReturnValue({
      createIssueRecord: mutateMock,
      isPending: false,
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

  it('submits a new issue from the frontend form', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<NewIssueScreen />)
    })

    const titleInput = tree.root.findByProps({ placeholder: 'e.g., Guest complaint about cold food' })
    const notesInput = tree.root.findByProps({ placeholder: 'Capture what happened and what follow-up is needed.' })
    const saveButton = tree.root.findByProps({ accessibilityLabel: 'Save issue' })

    renderer.act(() => {
      titleInput.props.onChangeText('Guest complaint about cold food')
      notesInput.props.onChangeText('Table 12 received entrees below temp and asked for manager.')
    })

    renderer.act(() => {
      saveButton.props.onPress()
    })

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'guest',
        severity: 'high',
        title: 'Guest complaint about cold food',
        areaId: 7,
        followUpRequired: true,
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    )
  })
})
