import { test, expect } from 'vitest'
import { LorapokPlayer, MediaPlayer, AudioPlayer } from '../lib/index'

test('exports LorapokPlayer components', () => {
  expect(LorapokPlayer).toBeDefined()
  expect(MediaPlayer).toBeDefined()
  expect(AudioPlayer).toBeDefined()
})
