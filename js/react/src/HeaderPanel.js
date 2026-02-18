import React from "react";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import TimelineIcon from "@mui/icons-material/Timeline";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import Tooltip from "@mui/material/Tooltip";

import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import InfoPanel from "./InfoPanel";
import GetAppIcon from "@mui/icons-material/GetApp";

import CircularProgress from "@mui/material/CircularProgress";

function SegmentSelect(props) {
    let menuItemAll = "";
    if (props.consistent) {
        menuItemAll = <MenuItem value={"all"}>All</MenuItem>;
    }
    return (
        <FormControl sx={{ margin: 1, minWidth: 120 }}>
            <InputLabel id="select-segment-label">Segment</InputLabel>
            <Select
                labelId="select-segment-label"
                id="select-segment"
                value={props.labels[props.segmentId] ? props.segmentId : 0}
                onChange={props.onChange}
                label="Segment"
            >
                {menuItemAll}
                {props.labels.map((seg, index) => {
                    return (
                        <MenuItem key={index} value={index}>
                            {seg.label}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}

function SignalSelect(props) {
    let segmentId = props.segmentId;
    if (props.segmentId === "all") {
        segmentId = 0; // if plotting signals from all segments, the segments
        // have been checked for consistency, so we can take
        // the labels only from the first segment
    }
    if (props.show && props.labels[segmentId]) {
        return (
            <FormControl sx={{ margin: 1, minWidth: 120 }}>
                <InputLabel id="select-signal-label">Signal</InputLabel>
                <Select
                    labelId="select-signal-label"
                    id="select-signal"
                    value={props.signalId}
                    onChange={props.onChange}
                    label="Signal"
                >
                    {props.labels[segmentId].signalLabels.map(
                        (label, index) => {
                            return (
                                <MenuItem key={index} value={index}>
                                    {label}
                                </MenuItem>
                            );
                        }
                    )}
                </Select>
            </FormControl>
        );
    } else {
        return "";
    }
}

function LoadingAnimation(props) {
    if (props.loading) {
        return (
            <CircularProgress
                sx={{ margin: 1, verticalAlign: "middle" }}
                color="secondary"
            />
        );
    } else {
        return "";
    }
}

export default function HeaderPanel(props) {
    const [popoverAnchor, setPopoverAnchor] = React.useState(null);

    React.useEffect(() => {
        console.log(props);
    }, []);

    const handleChangeSegment = (event) => {
        props.updateGraphData(
            event.target.value,
            props.signalId,
            props.showSignals,
            props.showSpikeTrains
        );
    };

    const handleChangeSignal = (event) => {
        props.updateGraphData(
            props.segmentId,
            event.target.value,
            props.showSignals,
            props.showSpikeTrains
        );
    };

    const handleChangeVisibility = (dataType) => {
        if (dataType === "signals") {
            props.updateGraphData(
                props.segmentId,
                props.signalId,
                !props.showSignals,
                props.showSpikeTrains
            );
        }
        if (dataType === "spiketrains") {
            props.updateGraphData(
                props.segmentId,
                props.signalId,
                props.showSignals,
                !props.showSpikeTrains
            );
        }
    };

    const handleShowInfo = (event) => {
        setPopoverAnchor(event.currentTarget);
    };

    const handleHideInfo = () => {
        setPopoverAnchor(null);
    };

    const infoOpen = Boolean(popoverAnchor);
    const id = infoOpen ? "info-panel" : undefined;
    return (
        <Box sx={{ margin: 2 }}>
            {!props.disableChoice && (
                <ButtonGroup
                    color="primary"
                    aria-label="outlined primary button group"
                    sx={{ margin: 1, verticalAlign: "middle" }}
                >
                    <Tooltip
                        title={`${props.showSignals ? "Hide" : "Show"} signals`}
                    >
                        <Button
                            onClick={() => handleChangeVisibility("signals")}
                            variant={`${props.showSignals ? "contained" : "outlined"
                                }`}
                        >
                            <TimelineIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip
                        title={`${props.showSpikeTrains ? "Hide" : "Show"
                            } spiketrains`}
                    >
                        <Button
                            onClick={() =>
                                handleChangeVisibility("spiketrains")
                            }
                            variant={`${props.showSpikeTrains ? "contained" : "outlined"
                                }`}
                        >
                            <ScatterPlotIcon />
                        </Button>
                    </Tooltip>
                </ButtonGroup>
            )}
            <SegmentSelect
                segmentId={props.segmentId}
                consistent={props.consistent}
                onChange={handleChangeSegment}
                labels={props.labels}
            />
            <SignalSelect
                segmentId={props.segmentId}
                signalId={props.signalId}
                onChange={handleChangeSignal}
                labels={props.labels}
                show={props.showSignals}
            />

            <Tooltip title="File metadata">
                <IconButton
                    onClick={handleShowInfo}
                    aria-label="info"
                    sx={{ marginTop: 1, marginBottom: 1, verticalAlign: "middle" }}
                >
                    <InfoIcon fontSize="medium" color="primary" />
                </IconButton>
            </Tooltip>
            <InfoPanel
                id={id}
                source={props.source}
                info={props.metadata}
                open={infoOpen}
                anchor={popoverAnchor}
                onClose={handleHideInfo}
            />

            <Tooltip title="Download data file">
                <IconButton
                    target="_blank"
                    rel="noopener noreferrer"
                    href={props.source}
                    aria-label="download"
                    sx={{ marginTop: 1, marginBottom: 1, verticalAlign: "middle" }}
                >
                    <GetAppIcon fontSize="medium" color="primary" />
                </IconButton>
            </Tooltip>

            <LoadingAnimation loading={props.loading} />
            {!props.disableChoice &&
                !props.showSignals &&
                !props.showSpikeTrains && (
                    <span>
                        Click signals (
                        <TimelineIcon
                            fontSize="small"
                            style={{ verticalAlign: "sub" }}
                        />
                        ) and/or spike trains (
                        <ScatterPlotIcon
                            fontSize="small"
                            style={{ verticalAlign: "sub" }}
                        />
                        )
                    </span>
                )}
        </Box>
    );
}
