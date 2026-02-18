import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import DataStore from '../datastore'

const BLOCK_DATA = {
    block: [
        {
            consistency: 'consistent',
            segments: [
                {
                    name: 'Segment A',
                    analogsignals: [{ name: 'Signal 1' }],
                    spiketrains: [],
                },
                {
                    name: 'Segment B',
                    analogsignals: [{ name: 'Signal 1' }],
                    spiketrains: [],
                },
            ],
        },
    ],
}

const SEGMENT_DATA = {
    name: 'Segment A',
    analogsignals: [{ name: 'Signal 1', values: [1, 2, 3] }],
    spiketrains: [],
}

const SIGNAL_DATA = {
    name: 'Signal 1',
    values: [1, 2, 3],
    times_dimensionality: 's',
    values_units: 'mV',
    sampling_period: 0.001,
}

function mockFetch(data) {
    return vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(data),
    })
}

beforeEach(() => {
    global.fetch = mockFetch(BLOCK_DATA)
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe('DataStore.initialize()', () => {
    it('fetches the correct URL', async () => {
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.initialize()
        expect(global.fetch).toHaveBeenCalledWith(
            'http://api.example.com/blockdata/?url=http://example.com/file.nwb'
        )
    })

    it('stores blocks after initialization', async () => {
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.initialize()
        expect(ds.blocks).toEqual(BLOCK_DATA.block)
        expect(ds.initialized).toBe(true)
    })

    it('is idempotent (does not fetch twice)', async () => {
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.initialize()
        await ds.initialize()
        expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('rejects on HTTP error', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found',
        })
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await expect(ds.initialize()).rejects.toThrow('404 Not Found')
    })

    it('rejects on network failure', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await expect(ds.initialize()).rejects.toThrow('Network error')
    })
})

describe('DataStore.loadSegment()', () => {
    it('constructs the correct URL', async () => {
        global.fetch = mockFetch(SEGMENT_DATA)
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.loadSegment(0, 1)
        expect(global.fetch).toHaveBeenCalledWith(
            'http://api.example.com/segmentdata/?url=http://example.com/file.nwb&segment_id=1'
        )
    })

    it('rejects with descriptive message on error', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
        })
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await expect(ds.loadSegment(0, 2)).rejects.toMatch('Error loading segment #2')
    })
})

describe('DataStore.loadSignal()', () => {
    it('constructs the correct URL', async () => {
        global.fetch = mockFetch(SIGNAL_DATA)
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.loadSignal(0, 1, 2, 4)
        expect(global.fetch).toHaveBeenCalledWith(
            'http://api.example.com/analogsignaldata/?url=http://example.com/file.nwb&segment_id=1&analog_signal_id=2&down_sample_factor=4'
        )
    })

    it('rejects with descriptive message on error', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
        })
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await expect(ds.loadSignal(0, 1, 2, 1)).rejects.toMatch('Error loading signal #2 in segment #1')
    })
})

describe('DataStore.loadSpikeTrains()', () => {
    it('constructs the correct URL', async () => {
        global.fetch = mockFetch({})
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.loadSpikeTrains(0, 1)
        expect(global.fetch).toHaveBeenCalledWith(
            'http://api.example.com/spiketraindata/?url=http://example.com/file.nwb&segment_id=1'
        )
    })

    it('rejects with descriptive message on error', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
        })
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await expect(ds.loadSpikeTrains(0, 3)).rejects.toMatch('Error loading spiketrain data from segment #3')
    })
})

describe('DataStore.getSignal()', () => {
    it('returns cached value without fetching when already loaded', async () => {
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.initialize()
        // Manually inject loaded signal data
        ds.blocks[0].segments[0].analogsignals[0] = { ...SIGNAL_DATA, values: [1, 2, 3] }
        global.fetch = vi.fn()  // should not be called

        const result = await ds.getSignal(0, 0, 0, 1)
        expect(result.values).toEqual([1, 2, 3])
        expect(global.fetch).not.toHaveBeenCalled()
    })
})

describe('DataStore.getLabels()', () => {
    it('returns default labels before initialization', () => {
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        const labels = ds.getLabels(0)
        expect(labels).toEqual([{ label: 'Segment #0', signalLabels: ['Signal #0'] }])
    })

    it('returns correct labels from block data after initialization', async () => {
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.initialize()
        const labels = ds.getLabels(0)
        expect(labels).toHaveLength(2)
        expect(labels[0].label).toBe('Segment A')
        expect(labels[0].signalLabels).toEqual(['Signal 1'])
        expect(labels[1].label).toBe('Segment B')
    })
})

describe('DataStore.isConsistentAcrossSegments()', () => {
    it('returns true when block consistency is "consistent"', async () => {
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.initialize()
        expect(ds.isConsistentAcrossSegments(0)).toBe(true)
    })

    it('returns false when block consistency is not "consistent"', async () => {
        const inconsistentData = {
            block: [{ ...BLOCK_DATA.block[0], consistency: 'inconsistent' }],
        }
        global.fetch = mockFetch(inconsistentData)
        const ds = new DataStore('http://example.com/file.nwb', 'http://api.example.com')
        await ds.initialize()
        expect(ds.isConsistentAcrossSegments(0)).toBe(false)
    })
})
