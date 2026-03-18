import React from 'react'
import NewCostRecordScreen from '@/app/(tabs)/costs/new'

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

jest.mock('@/hooks/useCostsQuery', () => ({
  useCostReferencesQuery: jest.fn(),
}))

jest.mock('@/hooks/useCostsMutation', () => ({
  useCreateCostRecordMutation: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useCostReferencesQuery } = jest.requireMock('@/hooks/useCostsQuery') as {
  useCostReferencesQuery: jest.Mock
}
const { useCreateCostRecordMutation } = jest.requireMock('@/hooks/useCostsMutation') as {
  useCreateCostRecordMutation: jest.Mock
}

describe('NewCostRecordScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    backMock.mockReset()
    mutateMock.mockReset()

    useCostReferencesQuery.mockReturnValue({
      areas: [{ id: 7, name: 'Kitchen Ops' }],
      isLoading: false,
      isError: false,
      error: null,
    })

    useCreateCostRecordMutation.mockReturnValue({
      createCostRecord: mutateMock,
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

  it('submits a new cost record from the frontend form', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<NewCostRecordScreen />)
    })

    const titleInput = tree.root.findByProps({ placeholder: 'e.g., Spoiled produce' })
    const amountInput = tree.root.findByProps({ placeholder: 'e.g., 86.50' })
    const vendorInput = tree.root.findByProps({ placeholder: 'Fresh Greens Co.' })
    const notesInput = tree.root.findByProps({ placeholder: 'Describe what happened or what was purchased.' })
    const saveButton = tree.root.findByProps({ accessibilityLabel: 'Save cost record' })

    renderer.act(() => {
      titleInput.props.onChangeText('Spoiled produce')
      amountInput.props.onChangeText('86.50')
      vendorInput.props.onChangeText('Fresh Greens Co.')
      notesInput.props.onChangeText('Walk-in cooler issue overnight.')
    })

    renderer.act(() => {
      saveButton.props.onPress()
    })

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'waste',
        title: 'Spoiled produce',
        amount: '86.50',
        areaId: 7,
        vendorName: 'Fresh Greens Co.',
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    )
  })
})
