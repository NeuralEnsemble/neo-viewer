import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorPanel from '../ErrorPanel'

describe('ErrorPanel', () => {
    it('renders nothing when message is falsy', () => {
        const { container } = render(<ErrorPanel message="" />)
        expect(container.firstChild).toBeFalsy()
    })

    it('renders nothing when message is undefined', () => {
        const { container } = render(<ErrorPanel />)
        expect(container.firstChild).toBeFalsy()
    })

    it('renders an alert with role="alert" when message is set', () => {
        render(<ErrorPanel message="Something went wrong" />)
        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveTextContent('Something went wrong')
    })
})
