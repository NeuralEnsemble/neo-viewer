import React from 'react';
import DataStore from './datastore';
import HeaderPanel from './HeaderPanel';
import GraphPanel from './GraphPanel';
import SpikeTrainPanel from './SpikeTrainPanel';
import ErrorPanel from './ErrorPanel';


const defaultBaseUrl = "https://neo-viewer.brainsimulation.eu";


function generateTimes(n, tStart, samplingPeriod) {
    const times = Array(n);
    for (let i = 0; i < n; i++) {
        times[i] = i * samplingPeriod + tStart;
    }
    return times;
}

function transformSpikeData(inputData) {
    console.log(inputData);
    return Object.entries(inputData).map(([key, value]) => {
        //console.log(key);
        //console.log(value);
        return {
            x: value.times,  // todo: scale by units?
            y: Array(value.times.length).fill(key)
        }
    });
}


export default function Visualizer(props) {
    const [segmentId, setSegmentId] = React.useState(0);
    const [signalId, setSignalId] = React.useState(0);
    const [consistent, setConsistent] = React.useState(false);
    const [showSignals, setShowSignals] = React.useState(false);
    const [showSpikeTrains, setShowSpikeTrains] = React.useState(false);
    const [downSampleFactor, setDownSampleFactor] = React.useState(1);
    const [labels, setLabels] = React.useState([{label: "Segment #0", signalLabels: ["Signal #0"]}]);
    const [signalData, setSignalData] = React.useState([]);
    const [spikeData, setSpikeData] = React.useState([]);
    const [axisLabels, setAxisLabels] = React.useState({x: "", y: ""});
    const [spikeTrainAxisLabels, setSpikeTrainAxisLabels] = React.useState({x: ""});
    const [errorMessage, setErrorMessage] = React.useState("");

    const datastore = React.useRef(new DataStore(props.source, props.baseUrl || defaultBaseUrl));

    React.useEffect(() => {
        if (props.segmentId) {
            setSegmentId(props.segmentId);
        }
        if (props.signalId) {
            setSignalId(props.signalId);
        }
        if (props.showSignals !== false) {
            setShowSignals(true);
        }
        if (props.showSpikeTrains) {
            setShowSpikeTrains(true);
        }
        if (props.downSampleFactor) {
            setDownSampleFactor(props.downSampleFactor);
        }
        // setSegmentId and setSignalId may not be immediately executed
        // so we can't assume segmentId and signalId have been set by now
        const currentSegmentId = props.segmentId || segmentId;
        const currentSignalId = props.signalId || signalId;
        const currentShowSignals = (props.showSignals !== false);
        const currentShowSpikeTrains = props.showSpikeTrains || false;

        datastore.current.initialize()
            .catch(err => {
                console.log(`Error initializing datastore: ${err}`);
                setErrorMessage(`Unable to read data file (${err})`);
            })
            .then(res => {
                setConsistent(datastore.current.isConsistentAcrossSegments(0));
                updateGraphData(currentSegmentId, currentSignalId, currentShowSignals, currentShowSpikeTrains);
            })
            .catch(err => {
                console.log(`Error after initializing datastore: ${err}`);
                setErrorMessage(`There was a problem reading data from the data file (${err})`);
            });
    }, []);

    function updateGraphData(newSegmentId, newSignalId, showSignals, showSpikeTrains) {
        console.log(`segmentId=${newSegmentId} signalId=${newSignalId} showSignals=${showSignals} showSpikeTrains=${showSpikeTrains}`);
        setSegmentId(newSegmentId);
        setSignalId(newSignalId);
        setShowSignals(showSignals);
        setShowSpikeTrains(showSpikeTrains);
        if (newSegmentId === "all") {
            if (showSignals) {
                datastore.current.getSignalsFromAllSegments(0, newSignalId, props.downSampleFactor)
                    .then(results => {
                        setLabels(datastore.current.getLabels(0));
                        setSignalData(results.map(res => {
                            return {
                                x: generateTimes(res.values.length, 0.0, res.sampling_period),
                                y: res.values
                            };
                        }));
                        setAxisLabels({x: results[0].times_dimensionality, y: results[0].values_units});
                    })
                    .catch(err => {
                        setErrorMessage(`There was a problem loading signal #${newSignalId} from all segments (${err})`);
                    });
            }
                // todo: handle get spike trains from all segments
        } else {
            if (showSignals) {
                datastore.current.getSignal(0, newSegmentId, newSignalId, props.downSampleFactor)
                    .then(res => {
                        console.log(res);
                        console.log(datastore.current);
                        setLabels(datastore.current.getLabels(0));
                        setSignalData([{
                            x: generateTimes(res.values.length, res.t_start, res.sampling_period),
                            y: res.values
                        }]);
                        setAxisLabels({x: res.times_dimensionality, y: res.values_units});
                    })
                    .catch(err => {
                        setErrorMessage(`There was a problem loading signal #${newSignalId} from segment #${newSegmentId} (${err})`);
                    });
            }
            if (showSpikeTrains) {
                datastore.current.getSpikeTrains(0, newSegmentId)
                    .then(res => {
                        setSpikeData(transformSpikeData(res));
                        setSpikeTrainAxisLabels({x: "ms"})  // todo: use 'units' from data
                    })
                    .catch(err => {
                        setErrorMessage(`There was a problem loading spiketrains from segment #${newSegmentId} (${err})`);
                    });
            }
        }
    }

    return (
        <div>
            <HeaderPanel
                source={props.source}
                ioType={props.ioType}
                downSampleFactor={props.downSampleFactor}
                segmentId={segmentId}
                signalId={signalId}
                consistent={consistent}
                labels={labels}
                showSignals={showSignals}
                showSpikeTrains={showSpikeTrains}
                updateGraphData={updateGraphData}
                metadata={datastore.current.metadata(0)}
            />
            <ErrorPanel message={errorMessage} />
            <GraphPanel
                data={signalData}
                axisLabels={axisLabels}
                show={showSignals}
                width={props.width}
                height={props.height} />
            <SpikeTrainPanel
                data={spikeData}
                axisLabels={spikeTrainAxisLabels}
                show={showSpikeTrains}
                width={props.width}
                height={props.height} />
        </div>
    )

}