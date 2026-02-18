import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GraphPanel from '../GraphPanel'

vi.mock('react-plotly.js', () => ({
    default: ({ layout, data, ...props }) => (
        <div data-testid="plotly-plot" data-xaxis={layout?.xaxis?.title?.text} data-yaxis={layout?.yaxis?.title?.text} />
    ),
}))

const sampleData = [{ x: [0, 1, 2], y: [1, 2, 3] }]
const axisLabels = { x: 's', y: 'mV' }

describe('GraphPanel', () => {
    it('renders nothing when show is false', () => {
        const { container } = render(
            <GraphPanel show={false} data={sampleData} axisLabels={axisLabels} />
        )
        // renders an empty <div />
        expect(screen.queryByTestId('plotly-plot')).not.toBeInTheDocument()
    })

    it('renders plot when show is true', () => {
        render(<GraphPanel show={true} data={sampleData} axisLabels={axisLabels} />)
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument()
    })

    it('passes correct axis labels to Plotly layout', () => {
        render(<GraphPanel show={true} data={sampleData} axisLabels={axisLabels} />)
        const plot = screen.getByTestId('plotly-plot')
        expect(plot).toHaveAttribute('data-xaxis', 's')
        expect(plot).toHaveAttribute('data-yaxis', 'mV')
    })
})
