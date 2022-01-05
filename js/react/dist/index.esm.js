import React from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import TimelineIcon from '@material-ui/icons/Timeline';
import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import GetAppIcon from '@material-ui/icons/GetApp';
import CircularProgress from '@material-ui/core/CircularProgress';
import Plot from 'react-plotly.js';
import Alert from '@material-ui/lab/Alert';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

function range(n) {
  return _toConsumableArray(Array(n).keys());
}

var DataStore = /*#__PURE__*/function () {
  function DataStore(datafileUrl, baseUrl) {
    _classCallCheck(this, DataStore);

    this.baseUrl = baseUrl;
    this.datafileUrl = datafileUrl;
    this.blocks = [];
    this.initialized = false;
  }

  _createClass(DataStore, [{
    key: "initialize",
    value: function initialize() {
      var _this = this;

      if (!this.initialized) {
        var url = "".concat(this.baseUrl, "/blockdata/?url=").concat(this.datafileUrl);
        var config = {};
        console.log("Initialising datastore for ".concat(url));
        return axios.get(url, config).then(function (res) {
          _this.blocks = res.data.block;
          _this.initialized = true;
          console.log("Initialized datastore for ".concat(_this.datafileUrl));
          console.log(_this.blocks);
        });
      }
    }
  }, {
    key: "segmentIsLoaded",
    value: function segmentIsLoaded(blockId, segmentId) {
      var segmentArray = this.blocks[blockId].segments;

      if (segmentArray.length > segmentId) {
        return segmentArray[segmentId].analogsignals.length > 0;
      } else {
        return false;
      }
    }
  }, {
    key: "signalIsLoaded",
    value: function signalIsLoaded(blockId, segmentId, signalId) {
      if (this.segmentIsLoaded(blockId, segmentId)) {
        var signalArray = this.blocks[blockId].segments[segmentId].analogsignals;

        if (signalArray.length > signalId) {
          if (signalArray[signalId].values) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }, {
    key: "spikeTrainsAreLoaded",
    value: function spikeTrainsAreLoaded(blockId, segmentId) {
      if (this.segmentIsLoaded(blockId, segmentId)) {
        var stArray = this.blocks[blockId].segments[segmentId].spiketrains;

        if (stArray.length > 0 && stArray[0].t_stop) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }, {
    key: "loadSegment",
    value: function loadSegment(blockId, segmentId) {
      var url = "".concat(this.baseUrl, "/segmentdata/?url=").concat(this.datafileUrl, "&segment_id=").concat(segmentId);
      var config = {};
      console.log("Trying to load segment #".concat(segmentId));
      return axios.get(url, config).catch(function (err) {
        return Promise.reject("Error loading segment #".concat(segmentId, ": ").concat(err.message));
      });
    }
  }, {
    key: "loadSignal",
    value: function loadSignal(blockId, segmentId, signalId, downSampleFactor) {
      var url = "".concat(this.baseUrl, "/analogsignaldata/?url=").concat(this.datafileUrl, "&segment_id=").concat(segmentId, "&analog_signal_id=").concat(signalId, "&down_sample_factor=").concat(downSampleFactor || 1);
      var config = {};
      console.log("Trying to load signal #".concat(signalId, " in segment #").concat(segmentId));
      return axios.get(url, config).catch(function (err) {
        return Promise.reject("Error loading signal #".concat(signalId, " in segment #").concat(segmentId, ": ").concat(err.message));
      });
    }
  }, {
    key: "loadSpikeTrains",
    value: function loadSpikeTrains(blockId, segmentId) {
      var url = "".concat(this.baseUrl, "/spiketraindata/?url=").concat(this.datafileUrl, "&segment_id=").concat(segmentId);
      var config = {};
      console.log("Trying to load spiketrains for #".concat(segmentId));
      return axios.get(url, config).catch(function (err) {
        return Promise.reject("Error loading spiketrain data from segment #".concat(segmentId, ": ").concat(err.message));
      });
    }
  }, {
    key: "getSignal",
    value: function getSignal(blockId, segmentId, signalId, downSampleFactor) {
      var _this2 = this;

      if (this.segmentIsLoaded(blockId, segmentId)) {
        if (this.signalIsLoaded(blockId, segmentId, signalId)) {
          console.log("1. Returning already-loaded signal #".concat(signalId, " in segment #").concat(segmentId));
          return new Promise(function (resolve, reject) {
            resolve(_this2.blocks[blockId].segments[segmentId].analogsignals[signalId]);
            reject();
          });
        } else {
          return this.loadSignal(blockId, segmentId, signalId, downSampleFactor).then(function (res) {
            console.log("2. Loaded signal for signal #".concat(signalId, " in segment #").concat(segmentId));
            _this2.blocks[blockId].segments[segmentId].analogsignals[signalId] = res.data;
            return res.data;
          });
        }
      } else {
        return this.loadSegment(blockId, segmentId).then(function (res) {
          console.log("3a. Loaded data for segment #".concat(segmentId));
          _this2.blocks[blockId].segments[segmentId] = res.data;
          return _this2.loadSignal(blockId, segmentId, signalId, downSampleFactor);
        }).then(function (res) {
          console.log("3b. Loaded signal for signal #".concat(signalId, " in segment #").concat(segmentId));
          _this2.blocks[blockId].segments[segmentId].analogsignals[signalId] = res.data;
          return res.data;
        });
      }
    }
  }, {
    key: "getSignalsFromAllSegments",
    value: function getSignalsFromAllSegments(blockId, signalId, downSampleFactor) {
      var _this3 = this;

      var promises = range(this.blocks[blockId].segments.length).map(function (segmentId) {
        return _this3.getSignal(blockId, segmentId, signalId, downSampleFactor);
      });
      return Promise.all(promises);
    }
  }, {
    key: "getSpikeTrains",
    value: function getSpikeTrains(blockId, segmentId) {
      var _this4 = this;

      if (this.segmentIsLoaded(blockId, segmentId)) {
        if (this.spikeTrainsAreLoaded(blockId, segmentId)) {
          console.log("1. Returning already-loaded spiketrains in segment #".concat(segmentId));
          return new Promise(function (resolve, reject) {
            resolve(_this4.blocks[blockId].segments[segmentId].spiketrains);
            reject();
          });
        } else {
          return this.loadSpikeTrains(blockId, segmentId).then(function (res) {
            console.log("2. Loaded spiketrains in segment #".concat(segmentId));
            _this4.blocks[blockId].segments[segmentId].spiketrains = res.data;
            return res.data;
          });
        }
      } else {
        return this.loadSegment(blockId, segmentId).then(function (res) {
          console.log("3a. Loaded data for segment #".concat(segmentId));
          _this4.blocks[blockId].segments[segmentId] = res.data;
          return _this4.loadSpikeTrains(blockId, segmentId);
        }).then(function (res) {
          console.log("3b. Loaded spiketrains in segment #".concat(segmentId));
          _this4.blocks[blockId].segments[segmentId].spiketrains = res.data;
          return res.data;
        });
      }
    }
  }, {
    key: "getLabels",
    value: function getLabels(blockId) {
      console.log("Getting labels for block #".concat(blockId));
      console.log(this);
      var labels = [{
        label: "Segment #0",
        signalLabels: ["Signal #0"]
      }];

      if (this.initialized) {
        labels = this.blocks[blockId].segments.map(function (seg, iSeg) {
          //console.log(seg);
          var signals = seg.analogsignals;

          if (seg.as_prop) {
            signals = seg.as_prop;
          } //console.log(signals);


          var signalLabels = signals.map(function (sig, iSig) {
            return sig.name || "Signal #".concat(iSig);
          });

          if (signalLabels.length === 0) {
            signalLabels = ["Signal #0"];
          }

          return {
            label: seg.name || "Segment #".concat(iSeg),
            signalLabels: signalLabels
          };
        });
      }

      console.log(labels);
      return labels;
    }
  }, {
    key: "isConsistentAcrossSegments",
    value: function isConsistentAcrossSegments(blockId) {
      console.log("Consistency: ".concat(this.blocks[blockId].consistency));
      return this.blocks[blockId].consistency === "consistent";
    }
  }, {
    key: "metadata",
    value: function metadata(blockId) {
      if (this.initialized) {
        return this.blocks[blockId];
      } else {
        return {};
      }
    }
  }]);

  return DataStore;
}();

var useStyles$2 = makeStyles(function (theme) {
  return {
    infoPanel: {
      padding: theme.spacing(2)
    },
    list: {
      width: '100%'
    }
  };
});

function ListItemNonEmpty(props) {
  if (props.value) {
    return /*#__PURE__*/React.createElement(ListItem, null, /*#__PURE__*/React.createElement(ListItemText, {
      primary: props.value,
      secondary: props.label
    }));
  } else {
    return "";
  }
}

function InfoPanel(props) {
  var classes = useStyles$2();
  return /*#__PURE__*/React.createElement(Popover, {
    id: props.id,
    open: props.open,
    anchorEl: props.anchor,
    onClose: props.onClose,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'right'
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'center'
    }
  }, /*#__PURE__*/React.createElement(Paper, {
    className: classes.infoPanel
  }, /*#__PURE__*/React.createElement(List, {
    className: classes.list,
    dense: true
  }, /*#__PURE__*/React.createElement(ListItemNonEmpty, {
    label: "Name",
    value: props.info.name
  }), /*#__PURE__*/React.createElement(ListItemNonEmpty, {
    label: "Description",
    value: props.info.description
  }), /*#__PURE__*/React.createElement(ListItemNonEmpty, {
    label: "Recording date",
    value: props.info.rec_datetime
  }), /*#__PURE__*/React.createElement(ListItemNonEmpty, {
    label: "Source",
    value: props.source
  }), Object.entries(props.info.annotations || {}).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        label = _ref2[0],
        value = _ref2[1];

    return /*#__PURE__*/React.createElement(ListItemNonEmpty, {
      key: value,
      label: label,
      value: value
    });
  }))));
}

var useStyles$1 = makeStyles(function (theme) {
  return {
    controlBar: {
      margin: theme.spacing(2)
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120
    },
    controlButtons: {
      margin: theme.spacing(1),
      verticalAlign: "middle"
    },
    roundButtons: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      verticalAlign: "middle"
    },
    loadingIndicator: {
      margin: theme.spacing(1),
      verticalAlign: "middle"
    }
  };
});

function SegmentSelect(props) {
  var classes = useStyles$1();
  var menuItemAll = "";

  if (props.consistent) {
    menuItemAll = /*#__PURE__*/React.createElement(MenuItem, {
      value: "all"
    }, "All");
  }

  return /*#__PURE__*/React.createElement(FormControl, {
    className: classes.formControl
  }, /*#__PURE__*/React.createElement(InputLabel, {
    id: "select-segment-label"
  }, "Segment"), /*#__PURE__*/React.createElement(Select, {
    labelId: "select-segment-label",
    id: "select-segment",
    value: props.labels[props.segmentId] ? props.segmentId : 0,
    onChange: props.onChange
  }, menuItemAll, props.labels.map(function (seg, index) {
    return /*#__PURE__*/React.createElement(MenuItem, {
      key: index,
      value: index
    }, seg.label);
  })));
}

function SignalSelect(props) {
  var classes = useStyles$1();
  var segmentId = props.segmentId;

  if (props.segmentId === "all") {
    segmentId = 0; // if plotting signals from all segments, the segments
    // have been checked for consistency, so we can take
    // the labels only from the first segment
  }

  if (props.show && props.labels[segmentId]) {
    return /*#__PURE__*/React.createElement(FormControl, {
      className: classes.formControl
    }, /*#__PURE__*/React.createElement(InputLabel, {
      id: "select-signal-label"
    }, "Signal"), /*#__PURE__*/React.createElement(Select, {
      labelId: "select-signal-label",
      id: "select-signal",
      value: props.signalId,
      onChange: props.onChange
    }, props.labels[segmentId].signalLabels.map(function (label, index) {
      return /*#__PURE__*/React.createElement(MenuItem, {
        key: index,
        value: index
      }, label);
    })));
  } else {
    return "";
  }
}

function LoadingAnimation(props) {
  var classes = useStyles$1();

  if (props.loading) {
    return /*#__PURE__*/React.createElement(CircularProgress, {
      className: classes.loadingIndicator,
      color: "secondary"
    });
  } else {
    return "";
  }
}

function HeaderPanel(props) {
  var classes = useStyles$1();

  var _React$useState = React.useState(null),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      popoverAnchor = _React$useState2[0],
      setPopoverAnchor = _React$useState2[1];

  React.useEffect(function () {
    console.log(props);
  }, []);

  var handleChangeSegment = function handleChangeSegment(event) {
    props.updateGraphData(event.target.value, props.signalId, props.showSignals, props.showSpikeTrains);
  };

  var handleChangeSignal = function handleChangeSignal(event) {
    props.updateGraphData(props.segmentId, event.target.value, props.showSignals, props.showSpikeTrains);
  };

  var handleChangeVisibility = function handleChangeVisibility(dataType) {
    if (dataType === "signals") {
      props.updateGraphData(props.segmentId, props.signalId, !props.showSignals, props.showSpikeTrains);
    }

    if (dataType === "spiketrains") {
      props.updateGraphData(props.segmentId, props.signalId, props.showSignals, !props.showSpikeTrains);
    }
  };

  var handleShowInfo = function handleShowInfo(event) {
    setPopoverAnchor(event.currentTarget);
  };

  var handleHideInfo = function handleHideInfo() {
    setPopoverAnchor(null);
  };

  var infoOpen = Boolean(popoverAnchor);
  var id = infoOpen ? "info-panel" : undefined;
  return /*#__PURE__*/React.createElement("div", {
    className: classes.controlBar
  }, !props.disableChoice && /*#__PURE__*/React.createElement(ButtonGroup, {
    color: "primary",
    "aria-label": "outlined primary button group",
    className: classes.controlButtons
  }, /*#__PURE__*/React.createElement(Tooltip, {
    title: "".concat(props.showSignals ? "Hide" : "Show", " signals")
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: function onClick() {
      return handleChangeVisibility("signals");
    },
    variant: "".concat(props.showSignals ? "contained" : "outlined")
  }, /*#__PURE__*/React.createElement(TimelineIcon, null))), /*#__PURE__*/React.createElement(Tooltip, {
    title: "".concat(props.showSpikeTrains ? "Hide" : "Show", " spiketrains")
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: function onClick() {
      return handleChangeVisibility("spiketrains");
    },
    variant: "".concat(props.showSpikeTrains ? "contained" : "outlined")
  }, /*#__PURE__*/React.createElement(ScatterPlotIcon, null)))), /*#__PURE__*/React.createElement(SegmentSelect, {
    segmentId: props.segmentId,
    consistent: props.consistent,
    onChange: handleChangeSegment,
    labels: props.labels
  }), /*#__PURE__*/React.createElement(SignalSelect, {
    segmentId: props.segmentId,
    signalId: props.signalId,
    onChange: handleChangeSignal,
    labels: props.labels,
    show: props.showSignals
  }), /*#__PURE__*/React.createElement(Tooltip, {
    title: "File metadata"
  }, /*#__PURE__*/React.createElement(IconButton, {
    onClick: handleShowInfo,
    "aria-label": "info",
    className: classes.roundButtons
  }, /*#__PURE__*/React.createElement(InfoIcon, {
    fontSize: "medium",
    color: "primary"
  }))), /*#__PURE__*/React.createElement(InfoPanel, {
    id: id,
    source: props.source,
    info: props.metadata,
    open: infoOpen,
    anchor: popoverAnchor,
    onClose: handleHideInfo
  }), /*#__PURE__*/React.createElement(Tooltip, {
    title: "Download data file"
  }, /*#__PURE__*/React.createElement(IconButton, {
    target: "_blank",
    rel: "noopener noreferrer",
    href: props.source,
    "aria-label": "download",
    className: classes.roundButtons
  }, /*#__PURE__*/React.createElement(GetAppIcon, {
    fontSize: "medium",
    color: "primary"
  }))), /*#__PURE__*/React.createElement(LoadingAnimation, {
    loading: props.loading
  }), !props.disableChoice && !props.showSignals && !props.showSpikeTrains && /*#__PURE__*/React.createElement("span", null, "Click signals (", /*#__PURE__*/React.createElement(TimelineIcon, {
    fontSize: "small",
    style: {
      verticalAlign: "sub"
    }
  }), ") and/or spike trains (", /*#__PURE__*/React.createElement(ScatterPlotIcon, {
    fontSize: "small",
    style: {
      verticalAlign: "sub"
    }
  }), ")"));
}

function GraphPanel(props) {
  var lineProperties = {
    type: "scatter",
    mode: "lines" //,
    //marker: {color: 'green'},

  };

  if (props.show) {
    var data = props.data.map(function (trace) {
      return _objectSpread2(_objectSpread2({}, lineProperties), trace);
    });
    return /*#__PURE__*/React.createElement(Plot, {
      data: data,
      layout: {
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 50,
          pad: 4
        },
        xaxis: {
          title: {
            text: props.axisLabels.x
          }
        },
        yaxis: {
          title: {
            text: props.axisLabels.y
          }
        }
      },
      useResizeHandler: !Boolean(props.width && props.height),
      style: {
        width: parseInt(props.width) || "100%",
        height: parseInt(props.height) || "100%"
      }
    });
  } else {
    return /*#__PURE__*/React.createElement("div", null);
  }
}

function SpikeTrainPanel(props) {
  var lineProperties = {
    type: 'scatter',
    mode: 'markers' //marker: {color: 'green'},

  };

  if (props.show) {
    var data = props.data.map(function (spikes) {
      return _objectSpread2(_objectSpread2({}, lineProperties), spikes);
    });
    return /*#__PURE__*/React.createElement(Plot, {
      data: data,
      layout: {
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 50,
          pad: 4
        },
        xaxis: {
          title: {
            text: "Time (".concat(props.axisLabels.x, ")")
          }
        },
        yaxis: {
          title: {
            text: "Spike Trains"
          }
        }
      },
      useResizeHandler: !Boolean(props.width && props.height),
      style: {
        width: props.width || "100%",
        height: props.height || "100%"
      }
    });
  } else {
    return /*#__PURE__*/React.createElement("div", null);
  }
}

var useStyles = makeStyles(function (theme) {
  return {
    errorMessage: {
      margin: theme.spacing(2)
    }
  };
});
function ErrorPanel(props) {
  var classes = useStyles();

  if (props.message) {
    return /*#__PURE__*/React.createElement(Alert, {
      className: classes.errorMessage,
      severity: "error"
    }, props.message);
  } else {
    return "";
  }
}

var defaultBaseUrl = "https://neo-viewer.brainsimulation.eu";

function generateTimes(n, tStart, samplingPeriod) {
  var times = Array(n);

  for (var i = 0; i < n; i++) {
    times[i] = i * samplingPeriod + tStart;
  }

  return times;
}

function transformSpikeData(inputData) {
  console.log(inputData);
  return Object.entries(inputData).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return {
      x: value.times,
      // todo: scale by units?
      y: Array(value.times.length).fill(key)
    };
  });
}

function isMultiChannel(signal) {
  if (signal.values.length > 0) {
    return signal.values[0].constructor === Array;
  } else {
    return false;
  }
}

function formatSignalData(signal) {
  var formattedData = [];

  if (isMultiChannel(signal)) {
    for (var i = 0; i < signal.values.length; i++) {
      formattedData.push({
        x: generateTimes(signal.values[i].length, 0.0, signal.sampling_period),
        y: signal.values[i]
      });
    }
  } else {
    formattedData.push({
      x: generateTimes(signal.values.length, 0.0, signal.sampling_period),
      y: signal.values
    });
  }

  console.log(formattedData);
  return formattedData;
}

function Visualizer(props) {
  var _React$useState = React.useState(0),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      segmentId = _React$useState2[0],
      setSegmentId = _React$useState2[1];

  var _React$useState3 = React.useState(0),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      signalId = _React$useState4[0],
      setSignalId = _React$useState4[1];

  var _React$useState5 = React.useState(false),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      consistent = _React$useState6[0],
      setConsistent = _React$useState6[1];

  var _React$useState7 = React.useState(false),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      showSignals = _React$useState8[0],
      setShowSignals = _React$useState8[1];

  var _React$useState9 = React.useState(false),
      _React$useState10 = _slicedToArray(_React$useState9, 2),
      showSpikeTrains = _React$useState10[0],
      setShowSpikeTrains = _React$useState10[1];

  var _React$useState11 = React.useState(false),
      _React$useState12 = _slicedToArray(_React$useState11, 2),
      disableChoice = _React$useState12[0],
      setDisableChoice = _React$useState12[1];

  var _React$useState13 = React.useState(1),
      _React$useState14 = _slicedToArray(_React$useState13, 2);
      _React$useState14[0];
      var setDownSampleFactor = _React$useState14[1];

  var _React$useState15 = React.useState([{
    label: "Segment #0",
    signalLabels: ["Signal #0"]
  }]),
      _React$useState16 = _slicedToArray(_React$useState15, 2),
      labels = _React$useState16[0],
      setLabels = _React$useState16[1];

  var _React$useState17 = React.useState([]),
      _React$useState18 = _slicedToArray(_React$useState17, 2),
      signalData = _React$useState18[0],
      setSignalData = _React$useState18[1];

  var _React$useState19 = React.useState([]),
      _React$useState20 = _slicedToArray(_React$useState19, 2),
      spikeData = _React$useState20[0],
      setSpikeData = _React$useState20[1];

  var _React$useState21 = React.useState({
    x: "",
    y: ""
  }),
      _React$useState22 = _slicedToArray(_React$useState21, 2),
      axisLabels = _React$useState22[0],
      setAxisLabels = _React$useState22[1];

  var _React$useState23 = React.useState({
    x: ""
  }),
      _React$useState24 = _slicedToArray(_React$useState23, 2),
      spikeTrainAxisLabels = _React$useState24[0],
      setSpikeTrainAxisLabels = _React$useState24[1];

  var _React$useState25 = React.useState(""),
      _React$useState26 = _slicedToArray(_React$useState25, 2),
      errorMessage = _React$useState26[0],
      setErrorMessage = _React$useState26[1];

  var _React$useState27 = React.useState(false),
      _React$useState28 = _slicedToArray(_React$useState27, 2),
      loading = _React$useState28[0],
      setLoading = _React$useState28[1];

  var datastore = React.useRef(new DataStore(props.source, props.baseUrl || defaultBaseUrl));
  React.useEffect(function () {
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

    if (props.disableChoice) {
      setDisableChoice(true);
    }

    if (props.downSampleFactor) {
      setDownSampleFactor(props.downSampleFactor);
    } // setSegmentId and setSignalId may not be immediately executed
    // so we can't assume segmentId and signalId have been set by now


    var currentSegmentId = props.segmentId || segmentId;
    var currentSignalId = props.signalId || signalId;
    var currentShowSignals = props.showSignals !== false;
    var currentShowSpikeTrains = props.showSpikeTrains || false;
    datastore.current.initialize().catch(function (err) {
      console.log("Error initializing datastore: ".concat(err));
      setErrorMessage("Unable to read data file (".concat(err, ")"));
    }).then(function (res) {
      setConsistent(datastore.current.isConsistentAcrossSegments(0));
      updateGraphData(currentSegmentId, currentSignalId, currentShowSignals, currentShowSpikeTrains);
    }).catch(function (err) {
      console.log("Error after initializing datastore: ".concat(err));
      setErrorMessage("There was a problem reading data from the data file (".concat(err, ")"));
    });
  }, []);

  function updateGraphData(newSegmentId, newSignalId, showSignals, showSpikeTrains) {
    console.log("segmentId=".concat(newSegmentId, " signalId=").concat(newSignalId, " showSignals=").concat(showSignals, " showSpikeTrains=").concat(showSpikeTrains));
    setLoading(true);
    setSegmentId(newSegmentId);
    setSignalId(newSignalId);
    setShowSignals(showSignals);
    setShowSpikeTrains(showSpikeTrains);
    setErrorMessage("");

    if (!showSignals && !showSpikeTrains || errorMessage) {
      // nothing to show
      setLoading(false);
    } else if (newSegmentId === "all") {
      if (showSignals) {
        datastore.current.getSignalsFromAllSegments(0, newSignalId, props.downSampleFactor).then(function (results) {
          setLabels(datastore.current.getLabels(0));
          var formattedData = [];

          var _iterator = _createForOfIteratorHelper(results),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var res = _step.value;
              formattedData = [].concat(_toConsumableArray(formattedData), _toConsumableArray(formatSignalData(res)));
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          setSignalData(formattedData);
          setAxisLabels({
            x: results[0].times_dimensionality,
            y: results[0].values_units
          });
          setLoading(false);
        }).catch(function (err) {
          setErrorMessage("There was a problem loading signal #".concat(newSignalId, " from all segments (").concat(err, ")"));
          setLoading(false);
        });
      } // todo: handle get spike trains from all segments

    } else {
      if (showSignals) {
        datastore.current.getSignal(0, newSegmentId, newSignalId, props.downSampleFactor).then(function (res) {
          setLabels(datastore.current.getLabels(0));
          setSignalData(formatSignalData(res));
          setAxisLabels({
            x: res.times_dimensionality,
            y: res.values_units
          });
          setLoading(false);
        }).catch(function (err) {
          setErrorMessage("There was a problem loading signal #".concat(newSignalId, " from segment #").concat(newSegmentId, " (").concat(err, ")"));
          setLoading(false);
        });
      }

      if (showSpikeTrains) {
        datastore.current.getSpikeTrains(0, newSegmentId).then(function (res) {
          setSpikeData(transformSpikeData(res));
          setSpikeTrainAxisLabels({
            x: "ms"
          }); // todo: use 'units' from data

          setLoading(false);
        }).catch(function (err) {
          setErrorMessage("There was a problem loading spiketrains from segment #".concat(newSegmentId, " (").concat(err, ")"));
          setLoading(false);
        });
      }
    }
  }

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(HeaderPanel, {
    source: props.source,
    ioType: props.ioType,
    downSampleFactor: props.downSampleFactor,
    segmentId: segmentId,
    signalId: signalId,
    consistent: consistent,
    labels: labels,
    showSignals: showSignals,
    showSpikeTrains: showSpikeTrains,
    disableChoice: disableChoice,
    updateGraphData: updateGraphData,
    metadata: datastore.current.metadata(0),
    loading: loading
  }), /*#__PURE__*/React.createElement(ErrorPanel, {
    message: errorMessage
  }), /*#__PURE__*/React.createElement(GraphPanel, {
    data: signalData,
    axisLabels: axisLabels,
    show: showSignals,
    width: props.width,
    height: props.height
  }), /*#__PURE__*/React.createElement(SpikeTrainPanel, {
    data: spikeData,
    axisLabels: spikeTrainAxisLabels,
    show: showSpikeTrains,
    width: props.width,
    height: props.height
  }));
}

export { Visualizer as default };
