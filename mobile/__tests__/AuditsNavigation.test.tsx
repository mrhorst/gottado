import React from 'react'
import AuditsHome from '@/app/(tabs)/audits/index'
import TabsLayout from '@/app/(tabs)/_layout'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const renderer = require('react-test-renderer')

const pushMock = jest.fn()
const tabScreenNames: string[] = []

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

jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')

  function Tabs({ children }: any) {
    return React.createElement('Tabs', {}, children)
  }

  function TabsScreen({ name }: { name: string }) {
    tabScreenNames.push(name)
    return React.createElement('TabsScreen', { name })
  }

  Tabs.Screen = TabsScreen

  return {
    useRouter: () => ({ push: pushMock }),
    Link: ({ children }: any) => React.createElement(React.Fragment, null, children),
    Tabs,
  }
})

jest.mock('@/hooks/useAuditDashboardQuery', () => ({
  useAuditDashboardQuery: jest.fn(),
}))

jest.mock('@/components/ui/ScreenMotion', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

const { useAuditDashboardQuery } = jest.requireMock('@/hooks/useAuditDashboardQuery') as {
  useAuditDashboardQuery: jest.Mock
}

describe('Audits navigation', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pushMock.mockReset()
    tabScreenNames.length = 0
    useAuditDashboardQuery.mockReturnValue({
      isLoading: false,
      dashboard: {
        averageScore: 82,
        pendingActionsCount: 3,
        upcomingFollowUps: [],
        zoneScores: {},
        previousZoneScores: {},
        recentRuns: [],
      },
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

  it('routes action items through audits instead of a separate top-level tab', () => {
    let homeTree: any

    renderer.act(() => {
      homeTree = renderer.create(<AuditsHome />)
    })

    const actionItemsButton = homeTree.root.findByProps({
      accessibilityLabel: 'Open action items',
    })

    renderer.act(() => {
      actionItemsButton.props.onPress()
    })

    renderer.act(() => {
      renderer.create(<TabsLayout />)
    })

    expect(pushMock).toHaveBeenCalledWith('/(tabs)/audits/actions')
    expect(tabScreenNames).not.toContain('action-items')
  })
})
