import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => ({
      on: vi.fn(),
      emit: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      connected: true,
    })),
  }
})
