import React from 'react';
import Plot from 'react-plotly.js';

export default function SpikeTrainPanel(props) {
    const lineProperties = {
        type: 'scatter',
        mode: 'markers'
        //marker: {color: 'green'},
    };
    if (props.show) {
        const data = props.data.map(spikes => {
            return { ...lineProperties, ...spikes }
        });
        return (
            <Plot
                data={data}
                layout={{
                    margin: {
                        l: 50,
                        r: 50,
                        b: 50,
                        t: 50,
                        pad: 4,
                      },
                    xaxis: {
                        title: {
                            text: `Time (${props.axisLabels.x})`
                        }
                    },
                    yaxis: {
                        title: {
                            text: "Spike Trains"
                        }
                    },
                }}
                useResizeHandler={!Boolean(props.width && props.height)}
                style={{
                    width: props.width || "100%",
                    height: props.height || "100%",
                }}
            />
        );
    } else {
        return <div />
    }
}