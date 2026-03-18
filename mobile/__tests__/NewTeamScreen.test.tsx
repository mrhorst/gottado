import React from 'react'
import NewTeamScreen from '@/app/(tabs)/areas/teams/new'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const renderer = require('react-test-renderer')

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const backMock = jest.fn()
const createTeamMock = jest.fn()

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
    Pressable: host('Pressable'),
    KeyboardAvoidingView: host('KeyboardAvoidingView'),
    ActivityIndicator: host('ActivityIndicator'),
    StyleSheet: { create: (styles: unknown) => styles },
    Platform: { OS: 'ios' },
  }
})

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: backMock }),
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('@/hooks/useTeamsMutation', () => ({
  useTeamsMutation: () => ({
    createTeam: createTeamMock,
    isCreating: false,
  }),
}))

describe('NewTeamScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    backMock.mockReset()
    createTeamMock.mockReset()
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

  it('submits a new team and returns to the previous screen on success', () => {
    let tree: any

    createTeamMock.mockImplementation(
      (
        payload: { name: string; description?: string },
        options: { onSuccess?: () => void }
      ) => {
        options?.onSuccess?.()
      }
    )

    renderer.act(() => {
      tree = renderer.create(<NewTeamScreen />)
    })

    const inputs = tree.root.findAllByType('TextInput')
    const createButton = tree.root.findByProps({ label: 'Create Team' })

    renderer.act(() => {
      inputs[0].props.onChangeText('AM Kitchen Team')
      inputs[1].props.onChangeText('Morning kitchen crew')
    })

    renderer.act(() => {
      createButton.props.onPress()
    })

    expect(createTeamMock).toHaveBeenCalledWith(
      {
        name: 'AM Kitchen Team',
        description: 'Morning kitchen crew',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    )
    expect(backMock).toHaveBeenCalled()
  })
})
