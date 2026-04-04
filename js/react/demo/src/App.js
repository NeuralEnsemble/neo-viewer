import React from "react";
import TextField from "@mui/material/TextField";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from "@mui/material/Checkbox";
import Visualizer from "neural-activity-visualizer-react";
import SyntaxHighLighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import "./App.css";

const source1 =
    "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf";

function App() {
    const [state, setState] = React.useState({
        sourceRadio: "sampleAnalogSignal",
        source: source1,
        selectedFileTypeURL: "",
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
        let name = evt.target.name;
        let value = evt.target.value;

        if (name === "sourceRadio") {
            let urlValue = ""
            let showSignals = false;
            let showSpikeTrains = false;
            if (value === "sampleAnalogSignal") {
                urlValue = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf"
                showSignals = true;
                showSpikeTrains = false;
            } else if (value === "sampleSpikeTrain") {
                urlValue = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-test/spiketrainsx2a.nix"
                showSignals = false;
                showSpikeTrains = true;
            } else {
                urlValue = ""
                showSignals = true;
                showSpikeTrains = false;
            }
            setState({
                ...state,
                source: urlValue,
                [name]: value,
                showSignals: showSignals,
                showSpikeTrains: showSpikeTrains
            });
        } else if (name === "dataFileURLselect") {
            setState({
                ...state,
                selectedFileTypeURL: value,
            });
        } else {
            setState({
                ...state,
                [name]:
                    evt.target.type === "checkbox"
                        ? !state[name]
                        : value,
            });
        }
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

    return (
        <div className="demo-page">

            {/* ── Header ── */}
            <header className="demo-header">
                <nav className="demo-nav">
                    <a href="/" className="demo-nav-brand">
                        <img src="./imgs/ebrains_logo.svg" alt="EBRAINS" />
                        <span className="demo-nav-brand-text">Neural Activity Visualizer</span>
                    </a>
                    <div className="demo-nav-links">
                        <a href="/">Home</a>
                        <a href="/api/docs" target="_blank" rel="noopener noreferrer">API Docs</a>
                        <a href="https://github.com/NeuralEnsemble/neo-viewer"
                           target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                </nav>
            </header>

            {/* ── Hero ── */}
            <div className="demo-hero">
                <h1>React Component</h1>
                <p>
                    The <code style={{fontFamily:"'IBM Plex Mono',monospace", color:"#00FF9D", background:"rgba(0,255,157,0.1)", padding:"0.1em 0.4em", borderRadius:"4px"}}>neural-activity-visualizer-react</code> component enables
                    web-browser visualisation of electrophysiology data files. It uses the{" "}
                    <a href="/api/docs" target="_blank" rel="noopener noreferrer">Neo Viewer REST API</a>.
                </p>
            </div>

            <main className="demo-main">
                <div className="demo-container">

                    {/* ── Installation ── */}
                    <h2 className="demo-section-heading">Installation</h2>
                    <div className="demo-intro">
                        The <code>neural-activity-visualizer-react</code> component can be installed via npm:
                    </div>
                    <SyntaxHighLighter
                        language="bash"
                        style={atomOneDark}
                        codeTagProps={{ style: { fontSize: 15, lineHeight: 1.6 } }}
                    >
                        npm install --save neural-activity-visualizer-react
                    </SyntaxHighLighter>

                    <div className="demo-accent-strip" />

                    {/* ── Basic Usage ── */}
                    <h2 className="demo-section-heading">Example: Basic Usage</h2>
                    <div className="source-label">Source Code</div>
                    <SyntaxHighLighter
                        language="javascript"
                        style={atomOneDark}
                        codeTagProps={{ style: { fontSize: 15, lineHeight: 1.6 } }}
                    >
                        {`import Visualizer from 'neural-activity-visualizer-react'
...
let source_url = "${source1}"
<Visualizer source={source_url} />`.replace(/\n +/g, "\n")}
                    </SyntaxHighLighter>
                    <div className="output-label">Output</div>
                    <Visualizer source={source1} />

                    <div className="demo-accent-strip" />

                    {/* ── Multiple File Types ── */}
                    <h2 className="demo-section-heading">Demo: Multiple File Types</h2>
                    <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: 16 }}>
                        NeoViewer supports a variety of file types. The dropdown below provides
                        examples of several formats that can be visualised.
                    </p>

                    <form>
                        <label style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, display: "block", marginBottom: 8 }}>
                            Choose a filetype:
                        </label>
                        <select
                            id="dataFileURLselect"
                            name="dataFileURLselect"
                            className="demo-select"
                            onChange={handleChange}
                        >
                            <option value="">-- Select File Type --</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/nwb/H19.29.141.11.21.01.nwb">NWB</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/axon/File_axon_1.abf">Axon</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/brainwaresrc/block_300ms_4rep_1clust_part_ch1.src">Brainwaresrc</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/intan/intan_rhd_test_1.rhd">Intan (.rhd)</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/intan/intan_rhs_test_1.rhs">Intan (.rhs)</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/micromed/File_micromed_1.TRC">Micromed</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/neuralynx/BML/plain_data/CSC1_trunc.txt">Neuralynx</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/neuroexplorer/File_neuroexplorer_1.nex">Neuroexplorer</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/plexon/File_plexon_3.plx">Plexon</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/rawbinarysignal/File_rawbinary_10kHz_2channels_16bit.raw">Rawbinarysignal</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/spike2/130322-1LY.smr">Spike2</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/tridesclous/tdc_example0/channel_group_0/segment_0/processed_signals.raw">Tridesclous</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/winedr/File_WinEDR_1.EDR">Winedr</option>
                            <option value="https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/winwcp/File_winwcp_1.wcp">Winwcp</option>
                        </select>
                        <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", display: "block", marginBottom: 6 }}>
                            Sample file URL:
                        </label>
                        <input
                            id="showSelectURL"
                            className="demo-input-readonly"
                            type="text"
                            value={state.selectedFileTypeURL === "" ? "<< select a file from above dropdown >>" : state.selectedFileTypeURL}
                            disabled
                        />
                    </form>
                    {state.selectedFileTypeURL && (
                        <Visualizer
                            key={JSON.stringify(state)}
                            source={state.selectedFileTypeURL}
                        />
                    )}

                    <div className="demo-accent-strip" />

                    {/* ── Interactive Demo ── */}
                    <h2 className="demo-section-heading">Example: Interactive Demo</h2>

                    <div style={{ marginBottom: 24 }}>
                        <span className="attr-label">source</span>
                        <FormControl>
                            <RadioGroup
                                row
                                defaultValue="sampleAnalogSignal"
                                name="sourceRadio"
                                onChange={handleChange}
                            >
                                <FormControlLabel
                                    value="sampleAnalogSignal"
                                    control={<Radio />}
                                    label={
                                        <span style={{ color: "rgba(255,255,255,0.85)" }}>
                                            Sample Analog Signal{" "}
                                            <a href="https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf"
                                               style={{ color: "#00FF9D" }}>(source)</a>
                                        </span>
                                    }
                                />
                                <FormControlLabel
                                    value="sampleSpikeTrain"
                                    control={<Radio />}
                                    label={
                                        <span style={{ color: "rgba(255,255,255,0.85)" }}>
                                            Sample Spike Train{" "}
                                            <a href="https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-test/spiketrainsx2a.nix"
                                               style={{ color: "#00FF9D" }}>(source)</a>
                                        </span>
                                    }
                                />
                                <FormControlLabel
                                    value="other"
                                    control={<Radio />}
                                    label={<span style={{ color: "rgba(255,255,255,0.85)" }}>Other</span>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <TextField
                            disabled={state.sourceRadio !== "other"}
                            name="source"
                            value={state.source}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                style: {
                                    fontSize: 15,
                                    color: "#ffffff",
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    padding: "5px 10px",
                                },
                            }}
                            helperText="URL of source data file"
                        />
                    </div>

                    <table className="demo-table">
                        <thead>
                            <tr>
                                <th style={{ width: 180 }}>Attribute</th>
                                <th style={{ width: 160 }}>Value</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>width</td>
                                <td>
                                    <TextField
                                        name="width"
                                        value={state.width}
                                        onChange={handleChange}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Set width of visualization panel (absolute values, not %).
                                    Inherits from parent by default and is responsive.
                                </td>
                            </tr>
                            <tr>
                                <td>height</td>
                                <td>
                                    <TextField
                                        name="height"
                                        value={state.height}
                                        onChange={handleChange}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Set height of visualization panel (absolute values, not %).
                                    Inherits from parent (up to 450 px) by default and is responsive.
                                </td>
                            </tr>
                            <tr>
                                <td>downSampleFactor</td>
                                <td>
                                    <TextField
                                        name="downSampleFactor"
                                        value={state.downSampleFactor}
                                        onChange={handleChange}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Factor by which data should be downsampled prior to loading.
                                    Useful for faster loading of large files. Default = 1 (no downsampling).
                                </td>
                            </tr>
                            <tr>
                                <td>ioType</td>
                                <td>
                                    <TextField
                                        name="ioType"
                                        value={state.ioType}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ inputProps: { style: { textAlign: "center" } } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Manually specify the file type. Useful for generic extensions
                                    (e.g. .dat). No default value.
                                </td>
                            </tr>
                            <tr>
                                <td>showSignals</td>
                                <td>
                                    <Checkbox
                                        name="showSignals"
                                        checked={state.showSignals}
                                        onChange={handleChange}
                                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Enable/disable display of signals panel on loading.
                                    Default = true.
                                </td>
                            </tr>
                            <tr>
                                <td>showSpikeTrains</td>
                                <td>
                                    <Checkbox
                                        name="showSpikeTrains"
                                        checked={state.showSpikeTrains}
                                        onChange={handleChange}
                                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Enable/disable display of spike train panel on loading.
                                    Default = false.
                                </td>
                            </tr>
                            <tr>
                                <td>disableChoice</td>
                                <td>
                                    <Checkbox
                                        name="disableChoice"
                                        checked={state.disableChoice}
                                        onChange={handleChange}
                                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Hide/show the buttons to toggle signal and spike train panels.
                                    Default = false.
                                </td>
                            </tr>
                            <tr>
                                <td>segmentId</td>
                                <td>
                                    <TextField
                                        name="segmentId"
                                        value={state.segmentId}
                                        onChange={handleChange}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Data segment to display on loading. Default = 0.
                                </td>
                            </tr>
                            <tr>
                                <td>signalId</td>
                                <td>
                                    <TextField
                                        name="signalId"
                                        value={state.signalId}
                                        onChange={handleChange}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                    />
                                </td>
                                <td style={{ color: "rgba(255,255,255,0.75)", textAlign: "left" }}>
                                    Signal to display on loading. Default = 0.
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="source-label" style={{ marginTop: 24 }}>Source Code</div>
                    <SyntaxHighLighter
                        language="javascript"
                        style={atomOneDark}
                        codeTagProps={{ style: { fontSize: 15, lineHeight: 1.6 } }}
                    >
                        {`import Visualizer from 'neural-activity-visualizer-react'
...
<Visualizer
${example_attributes}/>`.replace(/\n +/g, "\n")}
                    </SyntaxHighLighter>

                    <div className="output-label">Output</div>
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
            </main>

            {/* ── Footer ── */}
            <footer className="demo-footer">
                <div className="demo-accent-strip" style={{ margin: "0 0 24px" }} />
                <div className="demo-footer-content">
                    <p>
                        This project has received funding from the European Union's Horizon 2020
                        Framework Programme for Research and Innovation under the Specific Grant
                        Agreements No. 785907 and No. 945539 (Human Brain Project SGA2 and SGA3)
                        and by the European Union's Research and Innovation Program Horizon Europe
                        Grant Agreement No. 101147319 (EBRAINS 2.0).
                    </p>
                    <p>
                        If you encounter any problems,{" "}
                        <a href="https://github.com/NeuralEnsemble/neo-viewer/issues/new"
                           target="_blank" rel="noopener noreferrer">
                            please let us know.
                        </a>
                    </p>
                </div>
            </footer>

        </div>
    );
}

export default App;
