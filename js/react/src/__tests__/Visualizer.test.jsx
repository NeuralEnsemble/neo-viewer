import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Visualizer from '../Visualizer'

const { makeSegment, createMockDataStoreInstance } = vi.hoisted(() => {
    function makeSegment(numSignals, { hasAsProp = false } = {}) {
        const analogsignals = Array.from({ length: numSignals }, (_, i) => ({
            name: `Signal #${i}`,
        }))
        const seg = { analogsignals, spiketrains: [] }
        if (hasAsProp) {
            seg.as_prop = analogsignals
        }
        return seg
    }

    function createMockDataStoreInstance(segments) {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            isConsistentAcrossSegments: vi.fn().mockReturnValue(false),
            getLabels: vi.fn().mockReturnValue(
                segments.map((seg, i) => ({
                    label: `Segment #${i}`,
                    signalLabels: seg.analogsignals.map((s) => s.name),
                }))
            ),
            getSignal: vi.fn().mockResolvedValue({
                values: [1, 2, 3],
                times_dimensionality: 's',
                values_units: 'mV',
                sampling_period: 0.001,
            }),
            getSignalsFromAllSegments: vi.fn().mockResolvedValue([{
                values: [1, 2, 3],
                times_dimensionality: 's',
                values_units: 'mV',
                sampling_period: 0.001,
            }]),
            getSpikeTrains: vi.fn().mockResolvedValue([]),
            metadata: vi.fn().mockReturnValue({}),
            blocks: [{ segments, consistency: 'consistent' }],
            initialized: true,
        }
    }

    return { makeSegment, createMockDataStoreInstance }
})

// Mock DataStore
vi.mock('../datastore', () => {
    const MockDataStore = vi.fn().mockImplementation(function () {
        return createMockDataStoreInstance([makeSegment(2), makeSegment(2)])
    })
    return { default: MockDataStore }
})

// Mock child panels to avoid needing full MUI + Plotly setup
vi.mock('../HeaderPanel', () => ({
    default: (props) => (
        <div
            data-testid="header-panel"
            data-segment-id={props.segmentId}
            data-signal-id={props.signalId}
        />
    ),
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
        const failingInstance = {
            initialize: vi.fn().mockRejectedValue(new Error('404 Not Found')),
            isConsistentAcrossSegments: vi.fn().mockReturnValue(false),
            getLabels: vi.fn().mockReturnValue([
                { label: 'Segment #0', signalLabels: ['Signal #0'] },
            ]),
            metadata: vi.fn().mockReturnValue({}),
            initialized: false,
        }
        // Both the useRef and useEffect create a DataStore, so mock both
        DataStore.mockImplementation(function () { return failingInstance })

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

describe('Visualizer - dynamic source changes', () => {
    it('reinitializes DataStore when source prop changes', async () => {
        const DataStore = (await import('../datastore')).default

        const { rerender } = render(
            <Visualizer source="http://example.com/file1.nwb" showSignals={true} />
        )
        await waitFor(() => {
            expect(screen.getByTestId('graph-panel')).toBeInTheDocument()
        })

        const callCountAfterFirst = DataStore.mock.calls.length

        rerender(
            <Visualizer source="http://example.com/file2.nwb" showSignals={true} />
        )
        await waitFor(() => {
            expect(DataStore.mock.calls.length).toBeGreaterThan(callCountAfterFirst)
        })

        // Verify the new DataStore was created with the new source
        const lastCall = DataStore.mock.calls[DataStore.mock.calls.length - 1]
        expect(lastCall[0]).toBe('http://example.com/file2.nwb')
    })

    it('keeps segmentId and signalId when valid for the new source', async () => {
        // Both sources have 2 segments with 2 signals each
        const DataStore = (await import('../datastore')).default
        DataStore.mockImplementation(function () {
            return createMockDataStoreInstance([makeSegment(2), makeSegment(2)])
        })

        const { rerender } = render(
            <Visualizer source="http://example.com/file1.nwb" segmentId={1} signalId={1} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.segmentId).toBe('1')
            expect(header.dataset.signalId).toBe('1')
        })

        rerender(
            <Visualizer source="http://example.com/file2.nwb" segmentId={1} signalId={1} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.segmentId).toBe('1')
            expect(header.dataset.signalId).toBe('1')
        })
    })

    it('resets segmentId to 0 when invalid for the new source', async () => {
        const DataStore = (await import('../datastore')).default
        let callCount = 0
        DataStore.mockImplementation(function () {
            callCount++
            // First source: 3 segments; second source: 1 segment
            const segments = callCount <= 1
                ? [makeSegment(2), makeSegment(2), makeSegment(2)]
                : [makeSegment(2)]
            return createMockDataStoreInstance(segments)
        })

        const { rerender } = render(
            <Visualizer source="http://example.com/file1.nwb" segmentId={2} signalId={0} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.segmentId).toBe('2')
        })

        rerender(
            <Visualizer source="http://example.com/file2.nwb" segmentId={2} signalId={0} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.segmentId).toBe('0')
        })
    })

    it('resets signalId to 0 when invalid for the new source', async () => {
        const DataStore = (await import('../datastore')).default
        let callCount = 0
        DataStore.mockImplementation(function () {
            callCount++
            // First source: 4 signals; second source: 1 signal
            const segments = callCount <= 1
                ? [makeSegment(4)]
                : [makeSegment(1)]
            return createMockDataStoreInstance(segments)
        })

        const { rerender } = render(
            <Visualizer source="http://example.com/file1.nwb" segmentId={0} signalId={3} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.signalId).toBe('3')
        })

        rerender(
            <Visualizer source="http://example.com/file2.nwb" segmentId={0} signalId={3} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.signalId).toBe('0')
        })
    })

    it('validates signalId using as_prop when available', async () => {
        const DataStore = (await import('../datastore')).default
        let callCount = 0
        DataStore.mockImplementation(function () {
            callCount++
            // First source uses as_prop with 3 signals; second source uses as_prop with 1 signal
            const segments = callCount <= 1
                ? [makeSegment(3, { hasAsProp: true })]
                : [makeSegment(1, { hasAsProp: true })]
            return createMockDataStoreInstance(segments)
        })

        const { rerender } = render(
            <Visualizer source="http://example.com/file1.nwb" segmentId={0} signalId={2} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.signalId).toBe('2')
        })

        rerender(
            <Visualizer source="http://example.com/file2.nwb" segmentId={0} signalId={2} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.signalId).toBe('0')
        })
    })

    it('keeps segmentId "all" when source changes', async () => {
        const DataStore = (await import('../datastore')).default
        DataStore.mockImplementation(function () {
            return createMockDataStoreInstance([makeSegment(2)])
        })

        const { rerender } = render(
            <Visualizer source="http://example.com/file1.nwb" segmentId="all" signalId={0} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.segmentId).toBe('all')
        })

        rerender(
            <Visualizer source="http://example.com/file2.nwb" segmentId="all" signalId={0} showSignals={true} />
        )
        await waitFor(() => {
            const header = screen.getByTestId('header-panel')
            expect(header.dataset.segmentId).toBe('all')
        })
    })
})
