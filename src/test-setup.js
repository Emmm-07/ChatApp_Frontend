import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest'

afterEach(() => {
    cleanup();
});

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