import { render } from '@testing-library/react'
import React from 'react'
import { Logo } from '../Logo'
import { test, expect } from 'vitest'

test('renders logo svg correctly', () => {
  const { container } = render(<Logo className="test-class" />)
  const svg = container.querySelector('svg')
  expect(svg).toBeInTheDocument()
  expect(svg).toHaveClass('test-class')
  expect(svg).toHaveAttribute('viewBox', '0 0 512 512')
})
