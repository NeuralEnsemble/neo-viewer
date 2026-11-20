import React from "react";
import TextField from "@mui/material/TextField";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from "@mui/material/Checkbox";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Visualizer from "neural-activity-visualizer-react";
import "neural-activity-visualizer-react/style.css";
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

const THEME_KEY = "neo-viewer-theme";

// Shared with the static pages (homepage/js/theme.js): same storage key,
// light by default. index.html sets data-theme before first paint.
function useTheme() {
    const [theme, setTheme] = React.useState(
        () => document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"
    );
    React.useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
    }, [theme]);
    const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
    return [theme, toggle];
}

function ThemeToggle({ theme, onToggle }) {
    const next = theme === "dark" ? "light" : "dark";
    return (
        <button type="button" slot="actions" className="theme-toggle" onClick={onToggle}
            aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
            {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
            )}
        </button>
    );
}

const CODE_STYLE = { borderRadius: 8, padding: "16px 20px", margin: 0 };
const CODE_TAG_PROPS = { style: { fontSize: 14, lineHeight: 1.6 } };

function App() {
    const [theme, toggleTheme] = useTheme();
    const muiTheme = React.useMemo(() => createTheme({
        palette: {
            mode: theme,
            primary: { main: theme === "dark" ? "#00FF9D" : "#007734" },
        },
        typography: { fontFamily: "inherit" },
    }), [theme]);

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
        <ThemeProvider theme={muiTheme}>
        <div className="site">

            <eds-header variant={theme === "dark" ? "strong" : "inverse"} url="/" links={NAV_LINKS}>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </eds-header>

            <main className="site-main">
                <div className="page">

                    <div className="page-intro">
                        <h1 className="f-heading-03 page-title">React Component</h1>
                        <p className="f-body-01 lead">
                            The <code className="inline-code">neural-activity-visualizer-react</code> component
                            enables web-browser visualisation of electrophysiology data.
                            It uses the{" "}
                            <a href="/api/docs" target="_blank" rel="noopener noreferrer">Neo Viewer REST API</a>.
                        </p>
                    </div>

                    {/* ── Installation ── */}
                    <section className="section">
                        <h2 className="f-heading-05 section-title">Installation</h2>
                        <p className="muted">Install via npm:</p>
                        <p className="eyebrow">Shell</p>
                        <SyntaxHighLighter language="bash" style={atomOneDark}
                            customStyle={CODE_STYLE} codeTagProps={CODE_TAG_PROPS}>
                            npm install --save neural-activity-visualizer-react
                        </SyntaxHighLighter>
                    </section>

                    {/* ── Basic Usage ── */}
                    <section className="section">
                        <h2 className="f-heading-05 section-title">Example: Basic Usage</h2>
                        <p className="eyebrow">Source code</p>
                        <SyntaxHighLighter language="javascript" style={atomOneDark}
                            customStyle={CODE_STYLE} codeTagProps={CODE_TAG_PROPS}>
                            {`import Visualizer from 'neural-activity-visualizer-react'\n...\nlet source_url = "${source1}"\n<Visualizer source={source_url} />`}
                        </SyntaxHighLighter>
                        <p className="eyebrow">Output</p>
                        <div className="output-surface">
                            <Visualizer source={source1} />
                        </div>
                    </section>

                    {/* ── Multiple File Types ── */}
                    <section className="section">
                        <h2 className="f-heading-05 section-title">Demo: Multiple File Types</h2>
                        <p className="muted">
                            NeoViewer supports a variety of file types. Select one below:
                        </p>
                        <form>
                            <label className="field-label" htmlFor="dataFileURLselect">Choose a file type:</label>
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
                            <label className="field-label" htmlFor="showSelectURL">Sample file URL:</label>
                            <input
                                id="showSelectURL"
                                className="demo-input-readonly"
                                type="text"
                                value={state.selectedFileTypeURL === "" ? "<< select a file from above dropdown >>" : state.selectedFileTypeURL}
                                disabled
                            />
                        </form>
                        {state.selectedFileTypeURL && (
                            <>
                                <p className="eyebrow">Output</p>
                                <div className="output-surface">
                                    <Visualizer key={JSON.stringify(state)} source={state.selectedFileTypeURL} />
                                </div>
                            </>
                        )}
                    </section>

                    {/* ── Interactive Demo ── */}
                    <section className="section">
                        <h2 className="f-heading-05 section-title">Example: Interactive Demo</h2>

                        <span className="attr-name">source</span>
                        <FormControl sx={{ display: "flex", mt: 1, mb: 2 }}>
                            <RadioGroup row defaultValue="sampleAnalogSignal" name="sourceRadio" onChange={handleChange}>
                                <FormControlLabel value="sampleAnalogSignal" control={<Radio />}
                                    label={<span>Sample Analog Signal <a href={source1}>(source)</a></span>} />
                                <FormControlLabel value="sampleSpikeTrain" control={<Radio />}
                                    label={<span>Sample Spike Train <a href="https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-test/spiketrainsx2a.nix">(source)</a></span>} />
                                <FormControlLabel value="other" control={<Radio />} label="Other" />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            disabled={state.sourceRadio !== "other"}
                            name="source"
                            value={state.source}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            InputProps={{ style: { fontSize: 14, fontFamily: "'IBM Plex Mono', monospace" } }}
                            helperText="URL of source data file"
                        />

                        <table className="attr-table">
                            <thead>
                                <tr>
                                    <th>Attribute</th>
                                    <th className="value-cell">Value</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: "width", type: "number", desc: "Width of visualisation panel (absolute, not %). Inherits from parent by default." },
                                    { name: "height", type: "number", desc: "Height of visualisation panel (absolute, not %). Inherits from parent (up to 450 px)." },
                                    { name: "downSampleFactor", type: "number", desc: "Downsample data before loading. Useful for large files. Default = 1 (no downsampling)." },
                                    { name: "ioType", type: "text", desc: "Manually specify the file type — useful for generic extensions (e.g. .dat)." },
                                ].map(({ name, type, desc }) => (
                                    <tr key={name}>
                                        <td className="attr-name">{name}</td>
                                        <td className="value-cell">
                                            <TextField
                                                name={name} value={state[name]} onChange={handleChange}
                                                type={type} variant="outlined" size="small"
                                                InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                            />
                                        </td>
                                        <td className="desc-cell">{desc}</td>
                                    </tr>
                                ))}
                                {[
                                    { name: "showSignals", desc: "Show/hide signals panel on load. Default = true." },
                                    { name: "showSpikeTrains", desc: "Show/hide spike train panel on load. Default = false." },
                                    { name: "disableChoice", desc: "Hide the toggle buttons for signal/spike train panels. Default = false." },
                                ].map(({ name, desc }) => (
                                    <tr key={name}>
                                        <td className="attr-name">{name}</td>
                                        <td className="value-cell">
                                            <Checkbox name={name} checked={state[name]} onChange={handleChange} />
                                        </td>
                                        <td className="desc-cell">{desc}</td>
                                    </tr>
                                ))}
                                {[
                                    { name: "segmentId", desc: "Data segment to display on load. Default = 0." },
                                    { name: "signalId", desc: "Signal to display on load. Default = 0." },
                                ].map(({ name, desc }) => (
                                    <tr key={name}>
                                        <td className="attr-name">{name}</td>
                                        <td className="value-cell">
                                            <TextField
                                                name={name} value={state[name]} onChange={handleChange}
                                                type="number" variant="outlined" size="small"
                                                InputProps={{ inputProps: { min: 0, max: 9999, style: { textAlign: "center" } } }}
                                            />
                                        </td>
                                        <td className="desc-cell">{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p className="eyebrow">Source code</p>
                        <SyntaxHighLighter language="javascript" style={atomOneDark}
                            customStyle={CODE_STYLE} codeTagProps={CODE_TAG_PROPS}>
                            {`import Visualizer from 'neural-activity-visualizer-react'\n...\n<Visualizer\n${example_attributes}/>`}
                        </SyntaxHighLighter>

                        <p className="eyebrow">Output</p>
                        <div className="output-surface">
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
                    </section>

                </div>
            </main>

            <eds-footer
                variant={theme === "dark" ? "inverse" : "default"}
                funded-by="This project has received funding from the European Union's Horizon 2020 Framework Programme for Research and Innovation under the Specific Grant Agreements No. 785907 and No. 945539 (Human Brain Project SGA2 and SGA3) and by the European Union's Research and Innovation Program Horizon Europe Grant Agreement No. 101147319 (EBRAINS 2.0)."
                rights-reserved="If you encounter any problems, please open an issue on GitHub.">
            </eds-footer>

        </div>
        </ThemeProvider>
    );
}

export default App;
