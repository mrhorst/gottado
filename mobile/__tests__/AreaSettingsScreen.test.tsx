import React from 'react'
import AreaSettingsScreen from '@/app/(tabs)/areas/[id]'

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

  const SectionList = ({
    sections = [],
    ListHeaderComponent,
    ListFooterComponent,
    renderSectionHeader,
    renderItem,
  }: any) => {
    const header =
      typeof ListHeaderComponent === 'function'
        ? React.createElement(ListHeaderComponent)
        : ListHeaderComponent
    const footer =
      typeof ListFooterComponent === 'function'
        ? React.createElement(ListFooterComponent)
        : ListFooterComponent

    return React.createElement(
      'SectionList',
      {},
      header,
      sections.map((section: any, sectionIndex: number) =>
        React.createElement(
          React.Fragment,
          { key: `${section.title}-${sectionIndex}` },
          renderSectionHeader?.({ section }),
          section.data.map((item: any, itemIndex: number) =>
            React.createElement(
              React.Fragment,
              { key: `${section.title}-${itemIndex}` },
              renderItem?.({ item, section, index: itemIndex })
            )
          )
        )
      ),
      footer
    )
  }

  return {
    View: host('View'),
    Text: host('Text'),
    Pressable: host('Pressable'),
    ActivityIndicator: host('ActivityIndicator'),
    SectionList,
    StyleSheet: { create: (styles: unknown) => styles },
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    Platform: { OS: 'ios' },
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ children, ...props }: any) => React.createElement('Ionicons', props, children),
}))

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '7' }),
  useRouter: () => ({ navigate: jest.fn(), push: jest.fn() }),
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}))

jest.mock('@/hooks/useSectionQuery', () => ({
  useSectionQuery: jest.fn(),
}))

jest.mock('@/hooks/useTasksQuery', () => ({
  useTasksQuery: jest.fn(),
}))

jest.mock('@/hooks/useMembershipQuery', () => ({
  useMembershipQuery: jest.fn(),
}))

jest.mock('@/hooks/useMembershipMutation', () => ({
  useMembershipMutation: jest.fn(),
}))

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

const { useQuery, useMutation, useQueryClient } = jest.requireMock('@tanstack/react-query') as {
  useQuery: jest.Mock
  useMutation: jest.Mock
  useQueryClient: jest.Mock
}
const { useSectionQuery } = jest.requireMock('@/hooks/useSectionQuery') as {
  useSectionQuery: jest.Mock
}
const { useTasksQuery } = jest.requireMock('@/hooks/useTasksQuery') as {
  useTasksQuery: jest.Mock
}
const { useMembershipQuery } = jest.requireMock('@/hooks/useMembershipQuery') as {
  useMembershipQuery: jest.Mock
}
const { useMembershipMutation } = jest.requireMock('@/hooks/useMembershipMutation') as {
  useMembershipMutation: jest.Mock
}

describe('AreaSettingsScreen', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers()
    useSectionQuery.mockReturnValue({
      sections: [{ id: 7, name: 'Kitchen Operations', role: 'editor' }],
    })
    useTasksQuery.mockReturnValue({
      tasks: [],
    })
    useMembershipQuery.mockReturnValue({
      sectionMembersResponse: {
        members: [],
        nonMembers: [],
      },
      isLoading: false,
      isError: false,
    })
    useMembershipMutation.mockReturnValue({
      unsubscribeMember: jest.fn(),
      updateMember: jest.fn(),
    })
    useQuery.mockReturnValue({
      data: [],
      isLoading: false,
    })
    useMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    })
    useQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
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
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    consoleErrorSpy.mockRestore()
  })

  it('shows a compact checklist add action instead of the old new checklist button card', () => {
    let tree: any

    renderer.act(() => {
      tree = renderer.create(<AreaSettingsScreen />)
      jest.runOnlyPendingTimers()
    })

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const addButton = tree.root.findByProps({ accessibilityLabel: 'Add checklist' })

    expect(texts).toContain('Kitchen Operations')
    expect(texts).toContain('Checklists')
    expect(texts).not.toContain('New Checklist')
    expect(addButton).toBeDefined()
  })
})
