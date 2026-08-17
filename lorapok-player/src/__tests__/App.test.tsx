import { render, screen } from '@testing-library/react'
import React from 'react'
import App from '../App'
import { test, expect, vi } from 'vitest'

// Mock window object for Electron IPC
Object.defineProperty(window, 'ipcRenderer', {
  value: {
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
    invoke: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  writable: true,
})

test('renders main application header', () => {
  render(<App />)
  // Initially, it should show the logo text and "LorapokToon"
  expect(screen.getByText('LorapokToon')).toBeInTheDocument()
})
