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

const NAV_LINKS = JSON.stringify([
    { label: "Home", url: "/" },
    { label: "API Docs", url: "/api/docs", external: true },
    { label: "GitHub", url: "https://github.com/NeuralEnsemble/neo-viewer", external: true },
]);

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
            let urlValue = "";
            let showSignals = false;
            let showSpikeTrains = false;
            if (value === "sampleAnalogSignal") {
                urlValue = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf";
                showSignals = true;
            } else if (value === "sampleSpikeTrain") {
                urlValue = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-test/spiketrainsx2a.nix";
                showSpikeTrains = true;
            } else {
                showSignals = true;
            }
            setState({ ...state, source: urlValue, [name]: value, showSignals, showSpikeTrains });
        } else if (name === "dataFileURLselect") {
            setState({ ...state, selectedFileTypeURL: value });
        } else {
            setState({
                ...state,
                [name]: evt.target.type === "checkbox" ? !state[name] : value,
            });
        }
    }

    let example_attributes = `\tsource = "${state.source}"\n`;
    example_attributes += state.width ? `\twidth = {${state.width}}\n` : "";
    example_attributes += state.height ? `\theight = {${state.height}}\n` : "";
    example_attributes += state.downSampleFactor !== 1 ? `\tdownSampleFactor = {${state.downSampleFactor}}\n` : "";
    example_attributes += state.ioType ? `\tioType = "${state.ioType}"\n` : "";
    example_attributes += !state.showSignals ? `\tshowSignals = {${state.showSignals}}\n` : "";
    example_attributes += state.showSpikeTrains ? `\tshowSpikeTrains = {${state.showSpikeTrains}}\n` : "";
    example_attributes += state.disableChoice ? `\tdisableChoice = {${state.disableChoice}}\n` : "";
    example_attributes += state.segmentId !== 0 ? `\tsegmentId = {${state.segmentId}}\n` : "";
    example_attributes += state.signalId !== 0 ? `\tsignalId = {${state.signalId}}\n` : "";

    return (
        <div className="flex flex-col min-h-screen">

            {/* ── EDS Header ── */}
            <eds-header variant="strong" url="/" links={NAV_LINKS}></eds-header>

            {/* ── Hero ── */}
            <div className="text-center py-16 px-6 border-b border-white/10">
                <h1 className="f-heading-03 mb-4">React Component</h1>
                <p className="f-body-01 text-default-weak max-w-2xl mx-auto">
                    The <code className="bg-white/10 rounded px-2 py-0.5 text-brand-green font-mono text-sm">
                        neural-activity-visualizer-react
                    </code> component enables web-browser visualisation of electrophysiology data.
                    It uses the{" "}
                    <a href="/api/docs" target="_blank" rel="noopener noreferrer"
                       className="text-brand-green">Neo Viewer REST API</a>.
                </p>
            </div>

            {/* ── Main content ── */}
            <main className="flex-1 py-12">
                <div className="container mx-auto px-6 max-w-4xl">

                    {/* ── Installation ── */}
                    <h2 className="f-heading-05 mb-4 pb-3 border-b border-white/10">Installation</h2>
                    <p className="text-default-weak mb-4">
                        Install via npm:
                    </p>
                    <SyntaxHighLighter
                        language="bash"
                        style={atomOneDark}
                        codeTagProps={{ style: { fontSize: 15, lineHeight: 1.6 } }}
                    >
                        npm install --save neural-activity-visualizer-react
                    </SyntaxHighLighter>

                    <hr className="border-white/10 my-10" />

                    {/* ── Basic Usage ── */}
                    <h2 className="f-heading-05 mb-4 pb-3 border-b border-white/10">Example: Basic Usage</h2>
                    <p className="text-default-weak/60 text-xs uppercase tracking-wider mb-2">Source Code</p>
                    <SyntaxHighLighter
                        language="javascript"
                        style={atomOneDark}
                        codeTagProps={{ style: { fontSize: 15, lineHeight: 1.6 } }}
                    >
                        {`import Visualizer from 'neural-activity-visualizer-react'\n...\nlet source_url = "${source1}"\n<Visualizer source={source_url} />`}
                    </SyntaxHighLighter>
                    <p className="text-default-weak/60 text-xs uppercase tracking-wider mt-6 mb-2">Output</p>
                    <Visualizer source={source1} />

                    <hr className="border-white/10 my-10" />

                    {/* ── Multiple File Types ── */}
                    <h2 className="f-heading-05 mb-4 pb-3 border-b border-white/10">Demo: Multiple File Types</h2>
                    <p className="text-default-weak mb-4">
                        NeoViewer supports a variety of file types. Select one below:
                    </p>
                    <form>
                        <label className="block text-sm font-medium text-default-weak mb-2">
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
                        <label className="block text-xs text-default-weak/50 mb-1">Sample file URL:</label>
                        <input
                            id="showSelectURL"
                            className="demo-input-readonly"
                            type="text"
                            value={state.selectedFileTypeURL === "" ? "<< select a file from above dropdown >>" : state.selectedFileTypeURL}
                            disabled
                        />
                    </form>
                    {state.selectedFileTypeURL && (
                        <Visualizer key={JSON.stringify(state)} source={state.selectedFileTypeURL} />
                    )}

                    <hr className="border-white/10 my-10" />

                    {/* ── Interactive Demo ── */}
                    <h2 className="f-heading-05 mb-6 pb-3 border-b border-white/10">Example: Interactive Demo</h2>

                    <div className="mb-6">
                        <span className="block text-brand-green font-mono text-sm mb-2">source</span>
                        <FormControl>
                            <RadioGroup row defaultValue="sampleAnalogSignal" name="sourceRadio" onChange={handleChange}>
                                <FormControlLabel value="sampleAnalogSignal" control={<Radio />}
                                    label={<span>Sample Analog Signal <a href={source1} className="text-brand-green text-sm">(source)</a></span>} />
                                <FormControlLabel value="sampleSpikeTrain" control={<Radio />}
                                    label={<span>Sample Spike Train <a href="https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-test/spiketrainsx2a.nix" className="text-brand-green text-sm">(source)</a></span>} />
                                <FormControlLabel value="other" control={<Radio />} label="Other" />
                            </RadioGroup>
                        </FormControl>
                    </div>

                    <div className="mb-8">
                        <TextField
                            disabled={state.sourceRadio !== "other"}
                            name="source"
                            value={state.source}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            InputProps={{ style: { fontSize: 15, color: "#ffffff", fontFamily: "'IBM Plex Mono', monospace", padding: "5px 10px" } }}
                            helperText="URL of source data file"
                        />
                    </div>

                    <table className="w-full border-collapse text-sm mb-8">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-3 px-4 text-left text-white font-medium w-44">Attribute</th>
                                <th className="py-3 px-4 text-center text-white font-medium w-36">Value</th>
                                <th className="py-3 px-4 text-left text-white font-medium">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {[
                                { name: "width", type: "number", desc: "Width of visualisation panel (absolute, not %). Inherits from parent by default." },
                                { name: "height", type: "number", desc: "Height of visualisation panel (absolute, not %). Inherits from parent (up to 450 px)." },
                                { name: "downSampleFactor", type: "number", desc: "Downsample data before loading. Useful for large files. Default = 1 (no downsampling)." },
                                { name: "ioType", type: "text", desc: "Manually specify the file type — useful for generic extensions (e.g. .dat)." },
                            ].map(({ name, type, desc }) => (
                                <tr key={name}>
                                    <td className="py-3 px-4 font-mono text-brand-green">{name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <TextField
                                            name={name} value={state[name]} onChange={handleChange}
                                            type={type} variant="outlined" size="small"
                                            InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-default-weak">{desc}</td>
                                </tr>
                            ))}
                            {[
                                { name: "showSignals", desc: "Show/hide signals panel on load. Default = true." },
                                { name: "showSpikeTrains", desc: "Show/hide spike train panel on load. Default = false." },
                                { name: "disableChoice", desc: "Hide the toggle buttons for signal/spike train panels. Default = false." },
                            ].map(({ name, desc }) => (
                                <tr key={name}>
                                    <td className="py-3 px-4 font-mono text-brand-green">{name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <Checkbox name={name} checked={state[name]} onChange={handleChange}
                                            sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }} />
                                    </td>
                                    <td className="py-3 px-4 text-default-weak">{desc}</td>
                                </tr>
                            ))}
                            {[
                                { name: "segmentId", desc: "Data segment to display on load. Default = 0." },
                                { name: "signalId", desc: "Signal to display on load. Default = 0." },
                            ].map(({ name, desc }) => (
                                <tr key={name}>
                                    <td className="py-3 px-4 font-mono text-brand-green">{name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <TextField
                                            name={name} value={state[name]} onChange={handleChange}
                                            type="number" variant="outlined" size="small"
                                            InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-default-weak">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p className="text-default-weak/60 text-xs uppercase tracking-wider mb-2">Source Code</p>
                    <SyntaxHighLighter
                        language="javascript"
                        style={atomOneDark}
                        codeTagProps={{ style: { fontSize: 15, lineHeight: 1.6 } }}
                    >
                        {`import Visualizer from 'neural-activity-visualizer-react'\n...\n<Visualizer\n${example_attributes}/>`}
                    </SyntaxHighLighter>

                    <p className="text-default-weak/60 text-xs uppercase tracking-wider mt-6 mb-2">Output</p>
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

            {/* ── EDS Footer ── */}
            <eds-footer
                variant="inverse"
                funded-by="This project has received funding from the European Union's Horizon 2020 Framework Programme for Research and Innovation under the Specific Grant Agreements No. 785907 and No. 945539 (Human Brain Project SGA2 and SGA3) and by the European Union's Research and Innovation Program Horizon Europe Grant Agreement No. 101147319 (EBRAINS 2.0)."
                rights-reserved="If you encounter any problems, please open an issue on GitHub.">
            </eds-footer>

        </div>
    );
}

export default App;
