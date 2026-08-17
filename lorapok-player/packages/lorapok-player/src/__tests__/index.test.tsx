import { test, expect } from 'vitest'
import { LorapokPlayer, Logo, Mascot } from '../lib/index'

test('exports LorapokPlayer components', () => {
  expect(LorapokPlayer).toBeDefined()
  expect(Logo).toBeDefined()
  expect(Mascot).toBeDefined()
})
