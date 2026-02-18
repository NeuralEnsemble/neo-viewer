import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Visualizer from '../Visualizer'

// Mock DataStore
vi.mock('../datastore', () => {
    const MockDataStore = vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        isConsistentAcrossSegments: vi.fn().mockReturnValue(false),
        getLabels: vi.fn().mockReturnValue([
            { label: 'Segment #0', signalLabels: ['Signal #0'] },
        ]),
        getSignal: vi.fn().mockResolvedValue({
            values: [1, 2, 3],
            times_dimensionality: 's',
            values_units: 'mV',
            sampling_period: 0.001,
        }),
        getSpikeTrains: vi.fn().mockResolvedValue([]),
        metadata: vi.fn().mockReturnValue({}),
        initialized: true,
    }))
    return { default: MockDataStore }
})

// Mock child panels to avoid needing full MUI + Plotly setup
vi.mock('../HeaderPanel', () => ({
    default: () => <div data-testid="header-panel" />,
}))
vi.mock('../GraphPanel', () => ({
    default: ({ show }) => show ? <div data-testid="graph-panel" /> : <div />,
}))
vi.mock('../SpikeTrainPanel', () => ({
    default: () => <div data-testid="spike-train-panel" />,
}))
vi.mock('../ErrorPanel', () => ({
    default: ({ message }) => message ? <div data-testid="error-panel">{message}</div> : '',
}))

describe('Visualizer', () => {
    it('renders without crashing with a source prop', async () => {
        render(<Visualizer source="http://example.com/file.nwb" />)
        expect(screen.getByTestId('header-panel')).toBeInTheDocument()
    })

    it('shows ErrorPanel when DataStore.initialize rejects', async () => {
        const DataStore = (await import('../datastore')).default
        DataStore.mockImplementationOnce(() => ({
            initialize: vi.fn().mockRejectedValue(new Error('404 Not Found')),
            isConsistentAcrossSegments: vi.fn().mockReturnValue(false),
            getLabels: vi.fn().mockReturnValue([
                { label: 'Segment #0', signalLabels: ['Signal #0'] },
            ]),
            metadata: vi.fn().mockReturnValue({}),
            initialized: false,
        }))

        render(<Visualizer source="http://example.com/file.nwb" />)
        await waitFor(() => {
            expect(screen.getByTestId('error-panel')).toBeInTheDocument()
        })
    })

    it('renders GraphPanel when showSignals is true', async () => {
        render(<Visualizer source="http://example.com/file.nwb" showSignals={true} />)
        await waitFor(() => {
            expect(screen.getByTestId('graph-panel')).toBeInTheDocument()
        })
    })
})
