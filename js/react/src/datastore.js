async function get(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    return { data: await response.json() };
}

function range(n) {
    return [...Array(n).keys()];
}


class DataStore {
    constructor(datafileUrl, baseUrl) {
        this.baseUrl = baseUrl;
        this.datafileUrl = datafileUrl;
        this.blocks = [];
        this.initialized = false;
    }

    initialize() {
        if (!this.initialized) {
            const url = `${this.baseUrl}/blockdata/?url=${this.datafileUrl}`;
            console.log(`Initialising datastore for ${url}`);
            return get(url)
                .then(res => {
                    this.blocks = res.data.block;
                    this.initialized = true;
                    console.log(`Initialized datastore for ${this.datafileUrl}`);
                    console.log(this.blocks);
                });
        } else {
            return Promise.resolve();
        }
    }

    segmentIsLoaded(blockId, segmentId) {
        const segmentArray = this.blocks[blockId].segments;
        if (segmentArray.length > segmentId) {
            return (segmentArray[segmentId].analogsignals.length > 0);
        } else {
            return false;
        }
    }

    signalIsLoaded(blockId, segmentId, signalId) {
        if (this.segmentIsLoaded(blockId, segmentId)) {
            const signalArray = this.blocks[blockId].segments[segmentId].analogsignals;
            if (signalArray.length > signalId) {
                if (signalArray[signalId].values) {
                    return true
                } else {
                    return false
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    spikeTrainsAreLoaded(blockId, segmentId) {
        if (this.segmentIsLoaded(blockId, segmentId)) {
            const stArray = this.blocks[blockId].segments[segmentId].spiketrains;
            if (stArray.length > 0 && stArray[0].t_stop) {
                return true
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    loadSegment(blockId, segmentId) {
        const url = `${this.baseUrl}/segmentdata/?url=${this.datafileUrl}&segment_id=${segmentId}`;
        console.log(`Trying to load segment #${segmentId}`);
        return get(url)
            .catch(err => Promise.reject(`Error loading segment #${segmentId}: ${err.message}`));
    }

    loadSignal(blockId, segmentId, signalId, downSampleFactor) {
        const url = `${this.baseUrl}/analogsignaldata/?url=${this.datafileUrl}&segment_id=${segmentId}&analog_signal_id=${signalId}&down_sample_factor=${downSampleFactor || 1}`;
        console.log(`Trying to load signal #${signalId} in segment #${segmentId}`);
        return get(url)
            .catch(err => Promise.reject(`Error loading signal #${signalId} in segment #${segmentId}: ${err.message}`));
    }

    loadSpikeTrains(blockId, segmentId) {
        const url = `${this.baseUrl}/spiketraindata/?url=${this.datafileUrl}&segment_id=${segmentId}`;
        console.log(`Trying to load spiketrains for #${segmentId}`);
        return get(url)
            .catch(err => Promise.reject(`Error loading spiketrain data from segment #${segmentId}: ${err.message}`));
    }

    getSignal(blockId, segmentId, signalId, downSampleFactor) {
        if (this.segmentIsLoaded(blockId, segmentId)) {
            if (this.signalIsLoaded(blockId, segmentId, signalId)) {
                console.log(`1. Returning already-loaded signal #${signalId} in segment #${segmentId}`);
                return new Promise((resolve, reject) => {
                    resolve(this.blocks[blockId].segments[segmentId].analogsignals[signalId]);
                    reject();
                });
            } else {
                return this.loadSignal(blockId, segmentId, signalId, downSampleFactor)
                    .then(res => {
                        console.log(`2. Loaded signal for signal #${signalId} in segment #${segmentId}`);
                        this.blocks[blockId].segments[segmentId].analogsignals[signalId] = res.data;
                        return res.data;
                    });
            }
        } else {
            return this.loadSegment(blockId, segmentId)
                .then(res => {
                    console.log(`3a. Loaded data for segment #${segmentId}`);
                    this.blocks[blockId].segments[segmentId] = res.data;
                    return this.loadSignal(blockId, segmentId, signalId, downSampleFactor);
                })
                .then(res => {
                    console.log(`3b. Loaded signal for signal #${signalId} in segment #${segmentId}`);
                    this.blocks[blockId].segments[segmentId].analogsignals[signalId] = res.data;
                    return res.data;
                });
        }
    }

    getSignalsFromAllSegments(blockId, signalId, downSampleFactor) {
        const promises = range(this.blocks[blockId].segments.length).map(segmentId => {
            return this.getSignal(blockId, segmentId, signalId, downSampleFactor);
        });
        return Promise.all(promises);
    }

    getSpikeTrains(blockId, segmentId) {
        if (this.segmentIsLoaded(blockId, segmentId)) {
            if (this.spikeTrainsAreLoaded(blockId, segmentId)) {
                console.log(`1. Returning already-loaded spiketrains in segment #${segmentId}`);
                return new Promise((resolve, reject) => {
                    resolve(this.blocks[blockId].segments[segmentId].spiketrains);
                    reject();
                });
            } else {
                return this.loadSpikeTrains(blockId, segmentId)
                    .then(res => {
                        console.log(`2. Loaded spiketrains in segment #${segmentId}`);
                        this.blocks[blockId].segments[segmentId].spiketrains = res.data;
                        return res.data;
                    });
            }
        } else {
            return this.loadSegment(blockId, segmentId)
                .then(res => {
                    console.log(`3a. Loaded data for segment #${segmentId}`);
                    this.blocks[blockId].segments[segmentId] = res.data;
                    return this.loadSpikeTrains(blockId, segmentId);
                })
                .then(res => {
                    console.log(`3b. Loaded spiketrains in segment #${segmentId}`);
                    this.blocks[blockId].segments[segmentId].spiketrains = res.data;
                    return res.data;
                });
        }
    }

    getLabels(blockId) {
        console.log(`Getting labels for block #${blockId}`);
        console.log(this);
        let labels = [{
            label: "Segment #0",
            signalLabels: ["Signal #0"]
        }];
        if (this.initialized) {
            labels = this.blocks[blockId].segments.map((seg, iSeg) => {
                let signals = seg.analogsignals;
                if (seg.as_prop) {
                    signals = seg.as_prop;
                }
                let signalLabels = signals.map((sig, iSig) => {
                    return sig.name || `Signal #${iSig}`
                });
                if (signalLabels.length === 0) {
                    signalLabels = ["Signal #0"];
                }
                return {
                    label: seg.name || `Segment #${iSeg}`,
                    signalLabels: signalLabels
                };
            });
        }
        console.log(labels);
        return labels;
    }

    isConsistentAcrossSegments(blockId) {
        console.log(`Consistency: ${this.blocks[blockId].consistency}`);
        return (this.blocks[blockId].consistency === "consistent");
    }

    metadata(blockId) {
        if (this.initialized) {
            return this.blocks[blockId];
        } else {
            return {};
        }
    }
}


export default DataStore;
