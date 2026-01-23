import React from "react";
import TextField from "@material-ui/core/TextField";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from "@material-ui/core/Checkbox";
import Visualizer from "neural-activity-visualizer-react";
import SyntaxHighLighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import "./App.css";

const source1 =
    "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf";
// const source2 =
    // "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-test/spiketrainsx2a.nix";

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
        // console.log(evt.target.name);
        // console.log(evt.target.value);
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
                // set source input text field to empty when 'Other' radio selected
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
        <div className="container">
            <br />
            <div className="box rounded centered"
                style={{ marginTop: "5px", paddingTop: "0.75em", paddingBottom: "0.75em" }}>
                <a
                    href="https://ebrains.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="waves-effect waves-light"
                    style={{ textAlign: "center", color: "black" }}
                >
                    <table>
                        <tbody>
                            <tr>
                                <td style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                                    <img
                                        className="ebrains-icon-small"
                                        src="./imgs/ebrains_logo.svg"
                                        alt="EBRAINS logo"
                                        style={{ height: "60px" }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </a>
                <h5 className="title-style">Neural Activity Visualizer</h5>
            </div>

            <h5 style={{textAlign:"center", lineHeight: "2", fontWeight: "bolder"}}>ReactJS Component</h5>

            <div className="text" style={{margin: "15px 35px 15px 35px"}}>
                The neural-activity-visualizer Javascript app, enables
                web-browser visualisation of electrophysiology datafiles in any
                format supported by the Neo library. It makes use of the{" "}
                <a
                    href="/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Neo Viewer REST API
                </a>
                .
            </div>
            <hr />
            <h5 style={{ marginLeft: 0, lineHeight: 2 }}>
                Installation
            </h5>
            <div
                className="text"
                style={{ marginLeft: 10, marginTop: 25 }}
            >
                The <code>neural-activity-visualizer-react</code> app can be
                installed via <code>npm</code> as follows:
                <br />
                <div>
                <SyntaxHighLighter
                    language="javascript"
                    style={docco}
                    codeTagProps={{ style: { fontSize: 16, lineHeight: 2 } }}
                >
                    npm install --save neural-activity-visualizer-react
                </SyntaxHighLighter>
            </div>
            </div>
            <br />
            <hr />
            <h5 style={{ marginLeft: 0, lineHeight: 2 }}>
                Example: Basic usage
            </h5>
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

            <h5 style={{ marginLeft: 0, lineHeight: 2 }}>
                Demo: Multiple file types
            </h5>
            <p>
                NeoViewer supports a variety of filetypes.
                The dropdown below provides examples of several such file formats that can be visualized.
            </p>

            <div>
                <form>
                    <b>Choose a filetype:</b>
                    <select id="dataFileURLselect" style={{display:"block", width:"500px"}}  name="dataFileURLselect" onChange={handleChange}>
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
                    <br />
                    <b>Sample file URL:</b>
                    <input id="showSelectURL" type="text" value={state.selectedFileTypeURL === "" ? "<< select a file from above dropdown >>" : state.selectedFileTypeURL} disabled />
                </form>
                {
                    state.selectedFileTypeURL
                    &&
                    <Visualizer
                        key={JSON.stringify(state)}
                        source={state.selectedFileTypeURL}
                    />
                }
            </div>

            <br />
            <br />
            <hr />

            <h5 style={{ marginLeft: 0, lineHeight: 2 }}>
                Example: Interactive Demo
            </h5>
            <div
                className="text"
                style={{ marginLeft: 10, marginTop: 25, fontWeight: "bold" }}
            >
                Attributes:
            </div>
            <br />

            <FormControl style={{ marginLeft: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: 18, marginBottom: 5 }}>source</span>
                <RadioGroup
                    row
                    defaultValue="sampleAnalogSignal"
                    name="sourceRadio"
                    onChange={handleChange}
                >
                    <FormControlLabel value="sampleAnalogSignal" control={<Radio />} label={(<span style={{color: "black"}}>Sample Analog Signal <a href="https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf">(source)</a></span>)} />
                    <FormControlLabel value="sampleSpikeTrain" control={<Radio />} label={(<span style={{color: "black"}}>Sample Spike Train <a href="https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-test/spiketrainsx2a.nix">(source)</a></span>)} />
                    <FormControlLabel value="other" control={<Radio />} label={(<span style={{color: "black"}}>Other</span>)} />
                </RadioGroup>
            </FormControl>
            <br /><br />
            <div style={{ marginBottom: "20px" }}>
                <TextField
                    disabled={state.sourceRadio!=="other"}
                    name="source"
                    value={state.source}
                    onChange={handleChange}
                    // defaultValue={this.state.name}
                    // onBlur={this.handleFieldChange}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        style: {
                            fontSize: 18,
                            // fontWeight: "bold",
                            color: "#000000",
                            fontFamily: "monospace",
                            padding: "5px 10px 5px 10px",
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
                            <div style={{ width: "15ch" }}>
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
                                panel on loading. Default is true (i.e.
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
                                panel on loading. Default is false (i.e.
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
                                hide/unhide signal and spiketrain panel. Default
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
                                Data segment to be displayed on loading. Default value = 0, i.e. loads segment #0.
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
                                Signal to be displayed on loading. Default value = 0, i.e. loads signal #0.
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
            {/* < div id='divVisualizer' style={{position: 'fixed', bottom: '0px', left: 'auto', right: 'auto', width: '800px', height:'250px', border: '3px solid #73AD21', backgroundColor: 'white'}} > */}
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
                (Human Brain Project SGA2 and SGA3)
                and by the European Union's Research and Innovation Program Horizon Europe Grant Agreement No. 101147319 (EBRAINS 2.0).
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
