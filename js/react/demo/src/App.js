import React from "react";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Visualizer from "neural-activity-visualizer-react";
import SyntaxHighLighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import "./App.css";

const source1 =
    "https://object.cscs.ch/v1/AUTH_c0a333ecf7c045809321ce9d9ecdfdea/Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf";
// const source2 =
    // "https://object.cscs.ch/v1/AUTH_c0a333ecf7c045809321ce9d9ecdfdea/test/spiketrainsx2a.nix";

function App() {
    const [state, setState] = React.useState({
        source: source1,
        width: "",
        height: "",
        downSampleFactor: 1,
        ioType: "",
        showSignals: true,
        showSpikeTrains: false,
        disableChoice: false,
        segmentId: 0,
        signalId: 0
    });

    function handleChange(evt) {
        const value = evt.target.value;
        setState({
            ...state,
            [evt.target.name]:
                evt.target.type === "checkbox"
                    ? !state[evt.target.name]
                    : value,
        });
    }

    let example_attributes = `\tsource = "${state.source}"\n`
    example_attributes += state.width ? `\twidth = {${state.width}}\n` : ""
    example_attributes += state.height ? `\theight = {${state.height}}\n` : ""
    example_attributes += state.downSampleFactor !== 1 ? `\tdownSampleFactor = {${state.downSampleFactor}}\n` : ""
    example_attributes += state.ioType ? `\tioType = "${state.ioType}"\n` : ""
    example_attributes += !state.showSignals ? `\tshowSignals = {${state.showSignals}}\n` : ""
    example_attributes += state.showSpikeTrains ? `\tshowSpikeTrains = {${state.showSpikeTrains}}\n` : ""
    example_attributes += state.disableChoice ? `\tdisableChoice = {${state.disableChoice}}\n` : ""
    example_attributes += state.segmentId !== 0 ? `\tsegmentId = {${state.segmentId}}\n` : ""
    example_attributes += state.signalId !== 0 ? `\tsignalId = {${state.signalId}}\n` : ""

    console.log("State");
    console.log(state);
    return (
        <div className="container">
            <br />
            <br />
            <div className="rounded-box">
                <div className="title-container">
                    <img
                        className="ebrains-icon-small"
                        src="https://object.cscs.ch/v1/AUTH_c0a333ecf7c045809321ce9d9ecdfdea/EBRAINS_live_papers/resources/logos/EBRAINS.png"
                        alt="EBRAINS logo"
                        style={{
                            width: "50px",
                            height: "50px",
                            verticalAlign: "middle",
                        }}
                    />
                    <span
                        className="title-style"
                        style={{ paddingLeft: "15px", verticalAlign: "middle" }}
                    >
                        Neural Activity Visualizer
                    </span>
                    <div
                        className="subtitle-style"
                        style={{ paddingTop: "30px" }}
                    >
                        Javascript component for visualizing neural activity
                        data
                    </div>
                </div>
            </div>
            <br />
            <div className="text" style={{ margin: "25px" }}>
                The neural-activity-visualizer Javascript app, enables
                web-browser visualisation of electrophysiology datafiles in any
                format supported by the Neo library. It makes use of the{" "}
                <a
                    href="https://neo-viewer.brainsimulation.eu/#api_docs"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Neo Viewer REST API
                </a>
                .
            </div>
            <br />
            <hr />
            <h2 className="text" style={{ marginLeft: 0 }}>
                Example: Basic usage
            </h2>
            <div
                className="text"
                style={{ marginLeft: 10, marginTop: 25, fontWeight: "bold" }}
            >
                Source Code:
            </div>
            <div>
                <SyntaxHighLighter
                    language="javascript"
                    style={docco}
                    codeTagProps={{ style: { fontSize: 16, lineHeight: 2 } }}
                >
                    {`import Visualizer from 'neural-activity-visualizer-react'
                      ...
                      let source_url = "${source1}"
                      <Visualizer source={source_url} />`.replace(
                        /\n +/g,
                        "\n"
                    )}
                </SyntaxHighLighter>
            </div>
            <div
                className="text"
                style={{ marginLeft: 10, marginTop: 25, fontWeight: "bold" }}
            >
                Output:
            </div>
            <div>
                <Visualizer source={source1} />
            </div>
            <br />
            <br />
            <hr />

            <h2 className="text" style={{ marginLeft: 0 }}>
                Example: Interactive Demo
            </h2>
            <div
                className="text"
                style={{ marginLeft: 10, marginTop: 25, fontWeight: "bold" }}
            >
                Attributes:
            </div>
            <br />
            <div style={{ marginBottom: "20px" }}>
                <TextField
                    name="source"
                    label="source"
                    value={state.source}
                    onChange={handleChange}
                    // defaultValue={this.state.name}
                    // onBlur={this.handleFieldChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                        style: {
                            fontSize: 18,
                            // fontWeight: "bold",
                            color: "#000000",
                            fontFamily: "monospace",
                        },
                    }}
                    helperText="URL of source data file"
                />
            </div>
            <table
                className="text"
                border="1"
                cellPadding="10"
                style={{
                    borderCollapse: "collapse",
                    textAlign: "center",
                    width: "100%",
                }}
            >
                <thead>
                    <tr>
                        <th style={{ width: "200px" }}>Attribute</th>
                        <th style={{ width: "150px" }}>Value</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            width
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <TextField
                                    name="width"
                                    label=""
                                    value={state.width}
                                    onChange={handleChange}
                                    type="number"
                                    // defaultValue={this.state.name}
                                    // onBlur={this.handleFieldChange}
                                    variant="outlined"
                                    InputProps={{
                                        inputProps: {
                                            min: 0,
                                            max: 9999,
                                            maxLength: 4,
                                            style: { textAlign: "center" },
                                        },
                                    }}
                                />
                            </div>
                        </td>
                        <td className="text">
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Set width of visualization panel (in absolute
                                values; not in %). Inherits from parent as
                                default and is responsive.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            height
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <TextField
                                    name="height"
                                    label=""
                                    value={state.height}
                                    onChange={handleChange}
                                    type="number"
                                    // defaultValue={this.state.name}
                                    // onBlur={this.handleFieldChange}
                                    variant="outlined"
                                    InputProps={{
                                        inputProps: {
                                            min: 0,
                                            max: 9999,
                                            maxLength: 4,
                                            style: { textAlign: "center" },
                                        },
                                    }}
                                />
                            </div>
                        </td>
                        <td className="text">
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Set height of visualization panel (in absolute
                                values; not in %). Inherits from parent as
                                default (upto 450 px) and is responsive.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            downSampleFactor
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <TextField
                                    name="downSampleFactor"
                                    label=""
                                    value={state.downSampleFactor}
                                    onChange={handleChange}
                                    type="number"
                                    // defaultValue={this.state.name}
                                    // onBlur={this.handleFieldChange}
                                    variant="outlined"
                                    InputProps={{
                                        inputProps: {
                                            min: 0,
                                            max: 9999,
                                            maxLength: 4,
                                            style: { textAlign: "center" },
                                        },
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Factor by which data should be downsampled prior
                                to loading. Useful for faster loading of large
                                files. Accepts positive integer values. Default
                                value = 1 (no downsampling).
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            ioType
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <TextField
                                    name="ioType"
                                    label=""
                                    value={state.ioType}
                                    onChange={handleChange}
                                    // defaultValue={this.state.name}
                                    // onBlur={this.handleFieldChange}
                                    variant="outlined"
                                    InputProps={{
                                        inputProps: {
                                            style: { textAlign: "center" },
                                        },
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Can be used to manually specify the file type.
                                Particularly useful for generic file extensions
                                (e.g. .dat) to help identify data format. No
                                default value.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            showSignals
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <Checkbox
                                    name="showSignals"
                                    checked={state.showSignals}
                                    onChange={handleChange}
                                    sx={{
                                        "& .MuiSvgIcon-root": { fontSize: 28 },
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Option to enable/disable display of signals
                                panel on page loading. Default is true (i.e.
                                will display the signal panel).
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            showSpikeTrains
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <Checkbox
                                    name="showSpikeTrains"
                                    checked={state.showSpikeTrains}
                                    onChange={handleChange}
                                    sx={{
                                        "& .MuiSvgIcon-root": { fontSize: 28 },
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Option to enable/disable display of spiketrain
                                panel on page loading. Default is false (i.e.
                                will not display the spiketrain panel).
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            disableChoice
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <Checkbox
                                    name="disableChoice"
                                    checked={state.disableChoice}
                                    onChange={handleChange}
                                    sx={{
                                        "& .MuiSvgIcon-root": { fontSize: 28 },
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Option to enable/disable display of buttons to
                                hide/unhide siganl and spiketrain panel. Default
                                is false (i.e. will give users access to these
                                buttons).
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            segmentId
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <TextField
                                    name="segmentId"
                                    label=""
                                    value={state.segmentId}
                                    onChange={handleChange}
                                    type="number"
                                    // defaultValue={this.state.name}
                                    // onBlur={this.handleFieldChange}
                                    variant="outlined"
                                    InputProps={{
                                        inputProps: {
                                            min: 0,
                                            max: 9999,
                                            maxLength: 4,
                                            style: { textAlign: "center" },
                                        },
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Data segment to be displayed on page loading. Default value = 0, i.e. loads segment #0.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ fontFamily: "monospace", fontSize: 18 }}>
                            signalId
                        </td>
                        <td>
                            <div style={{ width: "20ch" }}>
                                <TextField
                                    name="signalId"
                                    label=""
                                    value={state.signalId}
                                    onChange={handleChange}
                                    type="number"
                                    // defaultValue={this.state.name}
                                    // onBlur={this.handleFieldChange}
                                    variant="outlined"
                                    InputProps={{
                                        inputProps: {
                                            min: 0,
                                            max: 9999,
                                            maxLength: 4,
                                            style: { textAlign: "center" },
                                        },
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div
                                style={{
                                    textAlign: "left",
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                Signal to be displayed on page loading. Default value = 0, i.e. loads signal #0.
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div
                className="text"
                style={{ marginLeft: 10, marginTop: 25, fontWeight: "bold" }}
            >
                Source Code:
            </div>
            <div>
                <SyntaxHighLighter
                    language="javascript"
                    style={docco}
                    codeTagProps={{ style: { fontSize: 16, lineHeight: 2 } }}
                >
                    {`import Visualizer from 'neural-activity-visualizer-react'
                      ...
                      <Visualizer
                        ${example_attributes}/>`.replace(/\n +/g,"\n"
                    )}
                </SyntaxHighLighter>
            </div>
            <div
                className="text"
                style={{ marginLeft: 10, marginTop: 25, fontWeight: "bold" }}
            >
                Output:
            </div>
            <div>
                <Visualizer
                    key={JSON.stringify(state)}
                    source={state.source}
                    width={state.width}
                    height={state.height}
                    downSampleFactor={state.downSampleFactor}
                    ioType={state.ioType}
                    showSpikeTrains={state.showSpikeTrains}
                    showSignals={state.showSignals}
                    disableChoice={state.disableChoice}
                    segmentId={state.segmentId}
                    signalId={state.signalId}
                />
            </div>
            <br />
            <br />
            <div className="rainbow-row">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <p className="text" style={{ margin: 10, marginTop: 25 }}>
                This project has received funding from the European Union’s
                Horizon 2020 Framework Programme for Research and Innovation
                under the Specific Grant Agreements No. 785907 and No. 945539
                (Human Brain Project SGA2 and SGA3).
            </p>
            <p className="text" style={{ margin: 10, marginBottom: 40 }}>
                If you encounter any problems,{" "}
                <a
                    href="https://github.com/NeuralEnsemble/neo-viewer/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    please let us know.
                </a>
            </p>
        </div>
    );
}

export default App;
