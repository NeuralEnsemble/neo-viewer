import React from "react";
import Plot from "react-plotly.js";
import { PLOT_CONFIG } from "./plotConfig";

export default function GraphPanel(props) {
    const lineProperties = {
        type: "scatter",
        mode: "lines", //,
        //marker: {color: 'green'},
    };
    if (props.show) {
        const data = props.data.map((trace) => {
            return { ...lineProperties, ...trace };
        });
        return (
            <Plot
                data={data}
                config={PLOT_CONFIG}
                layout={{
                    // While uirevision stays the same, Plotly keeps the user's zoom and pan when the data change
                    uirevision: props.preserveZoom ? "keep" : undefined,
                    margin: {
                        l: 50,
                        r: 50,
                        b: 50,
                        t: 50,
                        pad: 4,
                    },
                    xaxis: {
                        title: {
                            text: props.axisLabels.x,
                        },
                    },
                    yaxis: {
                        title: {
                            text: props.axisLabels.y,
                        },
                    },
                }}
                useResizeHandler={!Boolean(props.width && props.height)}
                style={{
                    width: parseInt(props.width) || "100%",
                    height: parseInt(props.height) || "100%",
                }}
            />
        );
    } else {
        return <div />;
    }
}
