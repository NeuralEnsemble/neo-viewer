import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import TimelineIcon from "@material-ui/icons/Timeline";
import ScatterPlotIcon from "@material-ui/icons/ScatterPlot";
import Tooltip from "@material-ui/core/Tooltip";

import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import InfoPanel from "./InfoPanel";
import GetAppIcon from "@material-ui/icons/GetApp";

import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
    controlBar: {
        margin: theme.spacing(2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    controlButtons: {
        margin: theme.spacing(1),
        verticalAlign: "middle",
    },
    roundButtons: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        verticalAlign: "middle",
    },
    loadingIndicator: {
        margin: theme.spacing(1),
        verticalAlign: "middle",
    },
}));

function SegmentSelect(props) {
    const classes = useStyles();

    let menuItemAll = "";
    if (props.consistent) {
        menuItemAll = <MenuItem value={"all"}>All</MenuItem>;
    }
    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="select-segment-label">Segment</InputLabel>
            <Select
                labelId="select-segment-label"
                id="select-segment"
                value={props.labels[props.segmentId] ? props.segmentId : 0}
                onChange={props.onChange}
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
    const classes = useStyles();

    let segmentId = props.segmentId;
    if (props.segmentId === "all") {
        segmentId = 0; // if plotting signals from all segments, the segments
        // have been checked for consistency, so we can take
        // the labels only from the first segment
    }
    if (props.show && props.labels[segmentId]) {
        return (
            <FormControl className={classes.formControl}>
                <InputLabel id="select-signal-label">Signal</InputLabel>
                <Select
                    labelId="select-signal-label"
                    id="select-signal"
                    value={props.signalId}
                    onChange={props.onChange}
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
    const classes = useStyles();

    if (props.loading) {
        return (
            <CircularProgress
                className={classes.loadingIndicator}
                color="secondary"
            />
        );
    } else {
        return "";
    }
}

export default function HeaderPanel(props) {
    const classes = useStyles();
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
        <div className={classes.controlBar}>
            {!props.disableChoice && (
                <ButtonGroup
                    color="primary"
                    aria-label="outlined primary button group"
                    className={classes.controlButtons}
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
                    className={classes.roundButtons}
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
                    className={classes.roundButtons}
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
        </div>
    );
}
