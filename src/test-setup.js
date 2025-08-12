import '@testing-library/jest-dom'
import { vi } from 'vitest'

global.WebSocket = vi.fn(() => ({
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
}));

vi.mock('./config.jsx', () => ({
    hostUrl: 'http://localhost:8000',
    wsURL: 'ws://localhost:8000/ws/socketserver'
}));