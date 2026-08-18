import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Canvas 2D context for visualizers in test
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  }) as any
}

// Mock Capacitor WidgetBridgePlugin and MediaSession for web test environment
vi.mock('capacitor-widget-bridge', () => ({
  WidgetBridgePlugin: {
    updatePlaybackState: vi.fn().mockResolvedValue({}),
    clearPlaybackState: vi.fn().mockResolvedValue({}),
  }
}))

vi.mock('@capgo/capacitor-media-session', () => ({
  MediaSession: {
    setMetadata: vi.fn().mockResolvedValue({}),
    setPlaybackState: vi.fn().mockResolvedValue({}),
    setActionHandler: vi.fn().mockResolvedValue({}),
  }
}))
