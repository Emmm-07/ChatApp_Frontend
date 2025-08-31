import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

describe('App', () => { 
    it('renders App component without  crashing', () => {
        render(<App/>)
        expect(document.body).toBeInTheDocument()
    })
 })