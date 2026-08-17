import { render } from '@testing-library/react'
import React from 'react'
import { Mascot } from '../Mascot'
import { test, expect } from 'vitest'

test('renders Mascot component correctly', () => {
  const { container } = render(<Mascot />)
  const img = container.querySelector('img')
  expect(img).toBeInTheDocument()
})
