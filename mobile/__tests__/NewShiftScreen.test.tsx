import React from 'react'
import NewShiftScreen from '@/app/(tabs)/labor/new'

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
    Alert: { alert: jest.fn() },
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: backMock }),
}))

jest.mock('@/hooks/useLaborQuery', () => ({
  useLaborReferencesQuery: jest.fn(),
}))

jest.mock('@/hooks/useLaborMutation', () => ({
  useCreateShiftMutation: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useLaborReferencesQuery } = jest.requireMock('@/hooks/useLaborQuery') as {
  useLaborReferencesQuery: jest.Mock
}
const { useCreateShiftMutation } = jest.requireMock('@/hooks/useLaborMutation') as {
  useCreateShiftMutation: jest.Mock
}

describe('NewShiftScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    backMock.mockReset()
    mutateMock.mockReset()

    useLaborReferencesQuery.mockReturnValue({
      areas: [{ id: 7, name: 'Kitchen Ops', teamId: 4, teamName: 'AM Kitchen Team' }],
      teams: [{ id: 4, name: 'AM Kitchen Team', description: 'Morning kitchen crew' }],
      members: [{ id: 3, name: 'Jordan Lead', email: 'jordan@example.com', role: 'editor' }],
      isLoading: false,
      isError: false,
      error: null,
    })

    useCreateShiftMutation.mockReturnValue({
      createShift: mutateMock,
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

  it('submits a manager-facing shift plan from the frontend form', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<NewShiftScreen />)
    })

    const roleInput = tree.root.findByProps({ placeholder: 'e.g., Open kitchen line' })
    const notesInput = tree.root.findByProps({ placeholder: 'Optional shift notes for the manager or lead.' })
    const createButton = tree.root.findByProps({ accessibilityLabel: 'Save shift' })

    renderer.act(() => {
      roleInput.props.onChangeText('Open kitchen line')
      notesInput.props.onChangeText('Prep all stations before 8:30.')
    })

    renderer.act(() => {
      createButton.props.onPress()
    })

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Open kitchen line',
        areaId: 7,
        assignedTeamId: 4,
        assignedUserId: 3,
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    )
  })
})
