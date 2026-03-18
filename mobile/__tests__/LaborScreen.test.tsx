import React from 'react'
import LaborScreen from '@/app/(tabs)/labor/index'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const renderer = require('react-test-renderer')

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const pushMock = jest.fn()

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
  useRouter: () => ({ push: pushMock }),
}))

jest.mock('@/hooks/useLaborQuery', () => ({
  useLaborShiftsQuery: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useLaborShiftsQuery } = jest.requireMock('@/hooks/useLaborQuery') as {
  useLaborShiftsQuery: jest.Mock
}

const getTextNodes = (tree: any) => tree.root.findAll((node: any) => node.type === 'Text')

describe('LaborScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pushMock.mockReset()
    useLaborShiftsQuery.mockReturnValue({
      shifts: [
        {
          id: 9,
          title: 'Open kitchen line',
          shiftDate: '2026-03-18',
          startTime: '08:00',
          endTime: '16:00',
          areaName: 'Kitchen Ops',
          assignedTeamName: 'AM Kitchen Team',
          assignedUserName: 'Jordan Lead',
          notes: 'Prep all stations before 8:30.',
        },
      ],
      selectedDate: '2026-03-18',
      setSelectedDate: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
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

  it('shows today labor plan and a visible create shift entry point', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<LaborScreen />)
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const createButton = tree.root.findByProps({ accessibilityLabel: 'Create shift' })

    expect(texts).toContain('Labor')
    expect(texts).toContain('Open kitchen line')
    expect(texts).toContain('Kitchen Ops')
    expect(texts).toContain('AM Kitchen Team')

    renderer.act(() => {
      createButton.props.onPress()
    })

    expect(pushMock).toHaveBeenCalledWith('/(tabs)/labor/new')
  })
})
