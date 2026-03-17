import React from 'react'
import ScreenHeader from '@/components/ui/ScreenHeader'
import FormField from '@/components/ui/FormField'
import AppChip from '@/components/ui/AppChip'
import EmptyState from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'

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
    TextInput: host('TextInput'),
    Pressable: host('Pressable'),
    ActivityIndicator: host('ActivityIndicator'),
    StyleSheet: { create: (styles: unknown) => styles },
  }
})

const getTextNodes = (tree: any) =>
  tree.root.findAll((node: any) => node.type === 'Text')

const renderTree = (element: React.ReactElement) => {
  let tree: any

  renderer.act(() => {
    tree = renderer.create(element)
  })

  return tree
}

describe('design system primitives', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
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

  it('renders a consistent screen header block', () => {
    const tree = renderTree(
      <ScreenHeader
        eyebrow='Tasks'
        title='Kitchen Opening'
        subtitle='Review the checklist and complete the shift setup.'
      />
    )

    const texts = getTextNodes(tree).map((node: any) => node.props.children)

    expect(texts).toContain('Tasks')
    expect(texts).toContain('Kitchen Opening')
    expect(
      texts
    ).toContain('Review the checklist and complete the shift setup.')
  })

  it('renders a form field wrapper with label and hint', () => {
    const tree = renderTree(
      <FormField label='Section name' hint='Keep it short and scannable'>
        <Input value='' onChangeText={() => undefined} placeholder='Kitchen' />
      </FormField>
    )

    const texts = getTextNodes(tree).map((node: any) => node.props.children)
    const input = tree.root.findByType('TextInput')

    expect(texts).toContain('Section name')
    expect(texts).toContain('Keep it short and scannable')
    expect(input.props.placeholder).toBe('Kitchen')
  })

  it('renders an app chip label', () => {
    const tree = renderTree(<AppChip label='Requires photo' />)

    expect(getTextNodes(tree).map((node: any) => node.props.children)).toContain(
      'Requires photo'
    )
  })

  it('renders an empty state with title and description', () => {
    const tree = renderTree(
      <EmptyState
        title='No tasks here'
        description='This section does not have any actionable items yet.'
      />
    )

    const texts = getTextNodes(tree).map((node: any) => node.props.children)

    expect(texts).toContain('No tasks here')
    expect(
      texts
    ).toContain('This section does not have any actionable items yet.')
  })

  it('forwards input changes through the shared text field', () => {
    const onChangeText = jest.fn()

    const tree = renderTree(
      <Input value='' onChangeText={onChangeText} placeholder='Email' />
    )

    renderer.act(() => {
      tree.root.findByType('TextInput').props.onChangeText('ops@gottado.app')
    })

    expect(onChangeText).toHaveBeenCalledWith('ops@gottado.app')
  })
})
