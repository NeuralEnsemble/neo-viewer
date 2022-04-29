
angular.module('neo-visualizer', ['ng', 'ngResource'])

.controller('MainCtrl', function($scope, BlockData, SegmentData, AnalogSignalData, SpikeTrainData, Graphics, $q) {
    var cache = [];
    var cache_seg = [];
    var cache_block = [];
    var cache_spiketrains = [];
    $scope.segmentCheck = false;
    $scope.blockCheck = false;
    $scope.segmentSignals = null;
    $scope.blockSignals = null;
    $scope.channelSignals = null;
    $scope.graphType = "spiketrains";
    $scope.downsamplefactor = '';

    $scope.showMultiChannelSignal = function()
    {
        $scope.channelSignals = true;
        AnalogSignalData.get({url: $scope.source,
                                      segment_id: $scope.currentSegmentId,
                                      analog_signal_id: $scope.currentAnalogSignalId,
                                      type: $scope.iotype,
                                      down_sample_factor: $scope.downsamplefactor
                                     }).$promise.then(
            function(data) {
                $scope.signal = data;
                $scope.signal.id = $scope.currentAnalogSignalId;
                if ($scope.segment.analogsignals.length > 0) {
                    $scope.block.segments[$scope.currentSegmentId].analogsignals[$scope.currentAnalogSignalId] = $scope.signal;
                    }
                else if ($scope.segment.irregularlysampledsignals.length > 0) {
                    $scope.block.segments[$scope.currentSegmentId].irregularlysampledsignals[$scope.currentAnalogSignalId] = $scope.signal;
                }
                console.log("** channel size " + data.values.length);
                var graph_data = [];
		var xs = data.times_dimensionality;
                var ys = data.values_units;    
                if (typeof data.times === "undefined") {
                    data.times = Graphics.get_graph_times(data);
                }
                data.values.forEach(
                    function(value, j) {
                        var t_start = data.times[0];
			var xi = [];
                        var yi = [];
                        value.forEach(
                            function(val, i){
                                xi.push(1000 * (data.times[i] - t_start));
                                yi.push(val);
                            }
                        );
                        var channel = {
                            x: xi,
                            y: yi,
                            name: 'Channel #' + j,
                            type: 'scatter'
                        }
                        graph_data.push(channel);
                    }
                );
		var layout = {
                    xaxis: {
                            title: {
                                text: xs,
                                }
                            },
                    yaxis: {
                            title: {
                                text: ys,
                            }
                        },
                };
                Plotly.newPlot($scope.divid, graph_data, layout, {displaylogo: false});    
                $scope.channel_data = graph_data;
                cache[$scope.currentSegmentId][$scope.currentAnalogSignalId]['graph'] = graph_data;
		cache[$scope.currentSegmentId][$scope.currentAnalogSignalId]['layout'] = layout;
            }
        ).finally(function () {
            $scope.dataLoading = false;
          });
    };

    $scope.showSelectedSignals = function(id)
    {
        if (cache_block[id] == undefined)  {
            cache_block[id] = [];
        }
        if (cache_block[id]['graph'] == undefined)  {
            $scope.dataLoading = true;
            console.log("Signal id: " + id);
            var sig_promises = [];
	    var xs = null;
            var ys = null;
            $scope.block.segments.forEach(
                function(seg, i) {
                    var sigdata = AnalogSignalData.get({url: $scope.source,
                                    segment_id: i,
                                    analog_signal_id: id,
                                    type: $scope.iotype,
                                    down_sample_factor: $scope.downsamplefactor
                                    });
                    sigdata.id = id;
                    sig_promises.push(sigdata.$promise);
                    }
                );

            $q.all(sig_promises).then(
                function(signals) {
                    console.log("* SIGNALS count " + signals.length);
                    var graph_data = [];
		    xs = signals[0].times_dimensionality;
                    ys = signals[0].values_units;
                    signals.forEach(
                        function(signal, j) {
                            if (typeof signal.times === "undefined") {
                                signal.times = Graphics.get_graph_times(signal);
                            }
                            var t_start = signal.times[0];
			    var xi = [];
                            var yi = [];
			    signal.values.forEach(
                                function(val, i){
                                    xi.push(1000 * (signal.times[i] - t_start));
                                    yi.push(val);
                                }
                            );
                            var trace = {
                                x: xi,
                                y: yi,
                                type: 'scatter'
                            }
                            graph_data.push(trace);	
                        }
                    );
	            var layout = {
                        xaxis: {
                                title: {
                                    text: xs,
                                }
                            },
                        yaxis: {
                                title: {
                                    text: ys,
                                }
                            },
                    };
                    Plotly.newPlot($scope.divid, graph_data, layout, {displaylogo: false});
                    $scope.block_data = graph_data;
                    cache_block[id]["graph"] = graph_data;
	            cache_block["layout"] = layout;
                },
                function(error) {
                    console.log(error);
                }
            ).finally(function () {
                $scope.dataLoading = false;
                });
            }
            else
            {
                console.log("Switching to cached block signals of signal #" + id);
                $scope.block_data = cache_block[id]['graph'];
		var layout = cache_block["layout"];
                Plotly.newPlot($scope.divid, $scope.block_data, layout, {displaylogo: false});
                $scope.dataLoading = false;
            }
    };

    $scope.showBlockSignals = function(name)
    {
        if (name == true) {
            $scope.blockSignals = true;
            $scope.signal = null;
            $scope.segmentSignals = null;
            }
        else {
            $scope.blockSignals = null;
            $scope.dataLoading = false;
        }
        $scope.currentAnalogSignalId = null
    };

    $scope.showSegmentSignals = function(name)
    {
        if (name == true) {
            if (cache_seg[$scope.currentSegmentId] == undefined)  {
                cache_seg[$scope.currentSegmentId] = [];
            }
            if (cache_seg[$scope.currentSegmentId]['graph'] == undefined)  {
                $scope.signal = null;
                $scope.blockSignals = null;
                $scope.dataLoading = true;
                $scope.segmentSignals = true;
		var xs = null;
                var ys = null;
                var promises = [];

                $scope.segment.analogsignals.forEach(
                    function(sig, i) {
                        var sigdata = AnalogSignalData.get({url: $scope.source,
                                        segment_id: $scope.currentSegmentId,
                                        analog_signal_id: i,
                                        type: $scope.iotype,
                                        down_sample_factor: $scope.downsamplefactor
                                        });
                        sigdata.id = i;
                        promises.push(sigdata.$promise);
                        }
                    );

                $q.all(promises).then(
                    function(signals) {
                        console.log("SIGNALS count " + signals.length);
                        var graph_data = [];
			xs = signals[0].times_dimensionality;
                        ys = signals[0].values_units;    
                        signals.forEach(
                            function(signal, j) {
                                if (typeof signal.times === "undefined") {
                                    signal.times = Graphics.get_graph_times(signal);
                                }
                                var t_start = signal.times[0];
				var xi = [];
                                var yi = [];
                                signal.values.forEach(
                                    function(val, i){
                                        xi.push(1000 * (signal.times[i] - t_start));
                                        yi.push(val);
                                    }
                                );
                                var trace = {
                                    x: xi,
                                    y: yi,
                                    type: 'scatter'
                                }
                                graph_data.push(trace);
                            }
                        );
			var layout = {
                            xaxis: {
                                title: {
                                    text: xs,
                                }
                            },
                            yaxis: {
                                    title: {
                                        text: ys,
                                    }
                                },
                        };
                        Plotly.newPlot($scope.divid, graph_data, layout, {displaylogo: false});    
                        $scope.segment_data = graph_data;
                        cache_seg[$scope.currentSegmentId]['graph'] = graph_data;
			cache_seg[$scope.currentSegmentId]['layout'] = layout;
                    },
                    function(error) {
                        console.log(error);
                    }
                ).finally(function () {
                    $scope.dataLoading = false;
                  });
              }
              else {
                    console.log("Switching to cached signals in segment #" + $scope.currentSegmentId);
                    $scope.segment_data = cache_seg[$scope.currentSegmentId]['graph'];
                    var layout = cache_seg[$scope.currentSegmentId]['layout'];
                    Plotly.newPlot($scope.divid, $scope.segment_data, layout, {displaylogo: false});
		    $scope.signal = null;
                    $scope.blockSignals = null;
                    $scope.segmentSignals = true;
                    $scope.dataLoading = false;
              }
        }
        else {
            $scope.dataLoading = false;
            $scope.segmentSignals = null;
        }
        $scope.currentAnalogSignalId = null
    };

    console.log($scope.source);
    if (!$scope.height) {
        $scope.height = 600;
    }
    $scope.block = null;
    $scope.showAnnotations = false;

    var init = function() {
        console.log("Loading data from " + $scope.source);
        $scope.block = null;
        $scope.segment = null;
	$scope.divid = "graph-" + Math.round(Math.random() * 1000);    
        //$scope.label = $scope.source.substring($scope.source.lastIndexOf('/') + 1);
        BlockData.get({url: $scope.source, type: $scope.iotype }).$promise.then(
            function(data) {
                $scope.error = null;
                $scope.block = data.block[0];
                $scope.file_name = $scope.block.file_name;
                console.log(data.block[0]);
                if($scope.segmentid){
                    console.log("segment id: " + $scope.segmentid);
                    $scope.currentSegmentId = $scope.segmentid;
                }
                else {
                    $scope.currentSegmentId = "0";
                }
                $scope.switchSegment();
            },
            function(err) {
                console.log("Error in getting block");
                $scope.error = err;
            }
        );
    }

    $scope.$watch("source", function() {
        init();
    });

    $scope.changeGraph = function(value) {
        if($scope.graphType == "spiketrains"){
            $scope.spiketrains = {};
            $scope.switchSpikeTrain();
        }
    };

    $scope.switchSegment = function() {
        $scope.signal = null;
        $scope.spiketrains = null;
        $scope.segmentSignals = null;
        $scope.segmentCheck = false;
        if ($scope.block.segments[$scope.currentSegmentId].analogsignals[0] == undefined ||
            $scope.block.segments[$scope.currentSegmentId].spiketrains[0] == undefined) {
            console.log("Fetching data for segment #" + $scope.currentSegmentId + " in file " + $scope.source);
            cache[$scope.currentSegmentId] = [];
            SegmentData.get({url: $scope.source,
                             segment_id: $scope.currentSegmentId,
                             type: $scope.iotype
                            }).$promise.then(
                function(data) {
                    $scope.segment = data;
                    $scope.block.segments[$scope.currentSegmentId] = $scope.segment;
                    console.log(data);
                    if($scope.segment.spiketrains.length > 0 && (!$scope.signalid || $scope.spiketrainselect)) {
                        console.log("length of spike trains " + $scope.segment.spiketrains.length);
                        $scope.spiketrains = {};
                        $scope.switchSpikeTrain();
                    }
                    if($scope.signalid && ($scope.segment.analogsignals[$scope.signalid] !== undefined)){
                        console.log("signal id: " +  $scope.signalid);
                        $scope.currentAnalogSignalId = $scope.signalid;
                        $scope.switchAnalogSignal();
                    }
                },
                function(err) {
                    console.log("Error in getting segment");
                    console.log(err);
                }
            );
        }
        else {
            console.log("Switching to cached segment #" + $scope.currentSegmentId);
            $scope.segment = $scope.block.segments[$scope.currentSegmentId];
            if($scope.segment.spiketrains[0] !== undefined) {
                $scope.switchSpikeTrain();
                }
        }
        $scope.currentAnalogSignalId = null;
    }

    $scope.switchAnalogSignal = function() {
        $scope.dataLoading = true;
        $scope.segmentSignals = null;
        $scope.segmentCheck = false;
        $scope.graphType = "analogsignals";
        $scope.signalid = null;
        if (($scope.segment.analogsignals.length > 0 && $scope.segment.analogsignals[$scope.currentAnalogSignalId].values == undefined) ||
            ($scope.segment.irregularlysampledsignals.length > 0 && $scope.segment.irregularlysampledsignals[$scope.currentAnalogSignalId].values == undefined)) {
            console.log("Fetching data for analog signal #" + $scope.currentAnalogSignalId + " in segment #" + $scope.currentSegmentId + " in file " + $scope.source);
            cache[$scope.currentSegmentId][$scope.currentAnalogSignalId] = [];
            if ($scope.block.channels == 'multi'){
                console.log("Signal has multiple channels");
                $scope.showMultiChannelSignal();
            }
            else {
                AnalogSignalData.get({url: $scope.source,
                                      segment_id: $scope.currentSegmentId,
                                      analog_signal_id: $scope.currentAnalogSignalId,
                                      type: $scope.iotype,
                                      down_sample_factor: $scope.downsamplefactor
                                     }).$promise.then(
                    function(data) {
                        $scope.signal = data;
                        $scope.signal.id = $scope.currentAnalogSignalId;
                        if ($scope.segment.analogsignals.length > 0) {
                            $scope.block.segments[$scope.currentSegmentId].analogsignals[$scope.currentAnalogSignalId] = $scope.signal;
                            }
                        else if ($scope.segment.irregularlysampledsignals.length > 0) {
                            console.log("Segment has irregularly sampled signals");
                            $scope.block.segments[$scope.currentSegmentId].irregularlysampledsignals[$scope.currentAnalogSignalId] = $scope.signal;
                        }
                        //console.log(data);
                        Graphics.initGraph($scope.signal).then(function(graph_data) {
                            $scope.graph_data = graph_data;
                            var layout = {
                                xaxis: {
                                    title: {
                                        text: $scope.signal.times_dimensionality,
                                    }
                                },
                                yaxis: {
                                    title: {
                                        text: $scope.signal.values_units,
                                    }
                                }
                            };
                            //Plotly.newPlot($scope.divid, graph_data.values, layout, {displaylogo: false});
			    if($scope.spiketrainselect) {
                                var graph_div = document.createElement("div");
                                document.getElementById($scope.divid).appendChild(graph_div)
                                Plotly.newPlot(graph_div, graph_data.values, layout, {displaylogo: false});
                            }
                            else {
                                Plotly.newPlot($scope.divid, graph_data.values, layout, {displaylogo: false});

                            }

			    //$scope.$apply();
                            cache[$scope.currentSegmentId][$scope.currentAnalogSignalId]['graph'] = graph_data;
		            cache[$scope.currentSegmentId][$scope.currentAnalogSignalId]['layout'] = layout;
                        });
                    },
                    function(err) {
                        console.log("Error in getting signal");
                        console.log(err);
                    }
                ).finally(function () {
                     $scope.dataLoading = false;
                    });
            }

        } else {
            console.log("Switching to cached signal #" + $scope.currentAnalogSignalId + " in segment #" + $scope.currentSegmentId);
            if ($scope.segment.analogsignals.length > 0) {
                $scope.signal = $scope.block.segments[$scope.currentSegmentId].analogsignals[$scope.currentAnalogSignalId];
                }
            else if ($scope.segment.irregularlysampledsignals.length > 0) {
                $scope.signal = $scope.block.segments[$scope.currentSegmentId].irregularlysampledsignals[$scope.currentAnalogSignalId];
            }
            $scope.graph_data = cache[$scope.currentSegmentId][$scope.currentAnalogSignalId]['graph'];
	    var layout = cache[$scope.currentSegmentId][$scope.currentAnalogSignalId]['layout'];
            Plotly.newPlot($scope.divid, $scope.graph_data.values, layout, {displaylogo: false});	
            $scope.dataLoading = false;
        }
    }

    $scope.switchSpikeTrain = function() {
        $scope.dataLoading = true;
        $scope.graphType = "spiketrains";
        if ($scope.block.segments[$scope.currentSegmentId].spiketrains[0].times == undefined) {
            console.log("Fetching data for spike trains in segment #" + $scope.currentSegmentId + " in file " + $scope.source);
            cache_spiketrains[$scope.currentSegmentId] = [];
            SpikeTrainData.get({url: $scope.source,
                                  segment_id: $scope.currentSegmentId,
                                  type: $scope.iotype
                                 }).$promise.then(
                function(data) {
                    $scope.spiketrains = data;
                    $scope.block.segments[$scope.currentSegmentId].spiketrains = $scope.spiketrains;
                    //console.log(data);
                    //$scope.spiketrains_options = getScatterChartOptions();
                    //cache_spiketrains[$scope.currentSegmentId]['options'] = $scope.spiketrains_options;
                    var graph_data = [];
                    Object.keys(data).forEach(function(key, i) {
                        if (typeof data[key]['times'] !== 'undefined') {
			    var xi = [];
                            var yi = [];
                            data[key]['times'].forEach(
                                function(val, j){
                                    xi.push(val);
                                    yi.push(i);
                                }
                            );
                            var st = {
                                x: xi,
                                y: yi,
                                name: 'Spike Train #' + i,
                                mode: 'markers'
                            }
                            graph_data.push(st);     
                        }
                    });
		    var layout = {
                                xaxis: {
                                    title: {
                                        text: "Time",
                                    }
                                },
                                yaxis: {
                                    title: {
                                        text: "Spike Trains",
                                    }
                                }
                            };
                    Plotly.newPlot($scope.divid, graph_data, layout, {displaylogo: false});	
                    $scope.spiketrains_data = graph_data;
                    cache_spiketrains[$scope.currentSegmentId]['graph'] = graph_data;
	            cache_spiketrains[$scope.currentSegmentId]['layout'] = layout;		
                },
                function(err) {
                    console.log("Error in getting spike trains");
                    console.log(err);
                }
            ).finally(function () {
                 $scope.dataLoading = false;
                });
        } else {
            console.log("Switching to cached spike train  in segment #" + $scope.currentSegmentId);
            $scope.spiketrains = $scope.block.segments[$scope.currentSegmentId].spiketrains;
            $scope.spiketrains_data = cache_spiketrains[$scope.currentSegmentId]['graph'];
            var layout = cache_spiketrains[$scope.currentSegmentId]['layout'];
            Plotly.newPlot($scope.divid, $scope.spiketrains_data, layout, {displaylogo: false});
            $scope.dataLoading = false;
        }
    }

    $scope.getSignalLabel = function(signal) {
        var label = "Signal #" + signal.id;
        if (signal.name) {
            label += " (" + signal.name + ")";
        }
        return label
    }
})


.factory('Graphics', function($rootScope) {

        //graphs functions
        var initGraph = function(raw_data) {
            console.log("initGraph");
            return new Promise(function(resolve, reject) {
                if (typeof raw_data.times === "undefined") {
                    raw_data.times = get_graph_times(raw_data);
                }
                var data = []
                get_graph_values(raw_data).then(function(data_graph) {
                    data.push(data_graph)
                })
                resolve({ 'values': data });
            });
        }

	var get_graph_values = function(raw_data) {
            return new Promise(function(resolve, reject) {
                var temp = {
                        x: raw_data.times,
                        y: raw_data.values,
                        type: 'scatter'
                    };
                resolve(temp);
            })
        }
      
        var get_graph_times = function(raw_data) {
            var times = [];
            var t = 0;
            var x = 0;
            var start = raw_data.t_start;
            var end = raw_data.t_stop;
            var p = raw_data.sampling_period;
            while (t <= end) {
                t = start + (x * p);
                times.push(t);
                x++;
            }
            return times;
        }

        //utility functions
        var _get_color_array = function(data_row) {
            list_ids = [];
            for (var i in data_row) {
                list_ids.push(i);
            }

            var colorMap = palette('tol-rainbow', list_ids.length);

            var res = new Object();
            for (var j in list_ids) {
                res[list_ids[j]] = colorMap[j];
            }
            return res;
        }

        var _pickRandomColor = function() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            var i = 0;
            for (i; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };

        var _get_min_max_values = function(array) {
            if (array != undefined) {
                var min_value = arrayMin(array);
                var max_value = arrayMax(array);
                min_value = min_value - 0.1 * Math.abs(min_value);
                max_value = max_value + 0.1 * Math.abs(max_value);
                return [min_value, max_value];
            } else {
                return [null, null];
            }
        }

        function arrayMin(arr) {
            return arr.reduce(function(p, v) {
                return (p < v ? p : v);
            });
        }

        function arrayMax(arr) {
            return arr.reduce(function(p, v) {
                return (p > v ? p : v);
            });
        }
        return {
            initGraph: initGraph,
            get_graph_values: get_graph_values,		
            get_graph_times: get_graph_times
        };

    }
)


.directive("visualizerView", function() {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        //templateUrl: '/src/visualizer.tpl.html',
        template: `
            <div>
            <style>
                .loader {
                  border: 16px solid #f3f3f3;
                  border-radius: 50%;
                  border-top: 16px solid #3498db;
                  width: 50px;
                  height: 50px;
                  -webkit-animation: spin 2s linear infinite; /* Safari */
                  animation: spin 2s linear infinite;
                }
                /* Safari */
                @-webkit-keyframes spin {
                  0% { -webkit-transform: rotate(0deg); }
                  100% { -webkit-transform: rotate(360deg); }
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
            </style>
            <div ng-show="!error" class="panel panel-default">
                <div class="panel-heading">
                    <p>
                    <button type="button" class="btn btn-link" ng-click="showAnnotations = !showAnnotations"><span class="glyphicon glyphicon-info-sign"></span></button>
                    {{source}}
                    <a type="button" class="btn" href="{{source}}"><span class="glyphicon glyphicon-download-alt"></span></a>
                    </p>
                    <div ng-show="showAnnotations">
                        <small>
                        <table class="table table-striped table-condensed">
                            <!--<tr><td>Source:</td><td>{{source}}</td></tr>-->
                            <tr><td>Name:</td><td>{{block.name}}</td></tr>
                            <tr><td>File origin:</td><td>{{block.file_origin}}</td></tr>
                            <tr><td>Recording date:</td><td>{{block.rec_datetime}}</td></tr>
                            <tr><td>Segments:</td><td>{{block.segments.length}}</td></tr>
                        </table>
                        </small>
                    </div>
                    <form class="form-inline">
                    <div ng-show="segment.consistency">
                        <label>
                            <input type="checkbox" ng-model="segmentCheck" ng-change="showSegmentSignals(segmentCheck)">
	    		    <span>Show all signals on the same axes</span>	
                        </label>
                    </div>
                    <div ng-show="block.consistency">
                        <label>
                            <input type="checkbox" ng-model="blockCheck" ng-change="showBlockSignals(blockCheck)">
	    		    <span>Show signals from all segments on the same axes</span>	
                        </label>
                    </div>
                    <div ng-show="!blockSignals && !block.spike_trains">
                        <select class="form-control" ng-change="switchSegment()" ng-model="currentSegmentId">
                            <option ng-repeat="segment in block.segments" value="{{$index}}">
                                Segment #{{$index}}
                            </option>
                        </select>
                        <!--<p>{{segment.name}}</p>
                        <p>Contains {{segment.analogsignals.length}} analog signals</p>-->
                        <select class="form-control" ng-show="segment" ng-change="switchAnalogSignal()" ng-model="currentAnalogSignalId">
                            <option value="">--- Please select signal ---</option> <!-- not selected / blank option -->
                            <option ng-show="segment.analogsignals" ng-repeat="signal in segment.analogsignals" value="{{$index}}">
                                Signal #{{$index}} <span ng-show="signal.name">({{signal.name}})</span>
                            </option>
                            <option ng-show="segment.irregularlysampledsignals" ng-repeat="signal in segment.irregularlysampledsignals" value="{{$index}}">
                                Signal #{{$index}} <span ng-show="signal.name">({{signal.name}})</span>
                            </option>
                        </select>
                    </div>
                    <div ng-show="blockSignals && !block.spike_trains">
                        <select class="form-control" ng-show="segment" ng-change="showSelectedSignals(SignalId)" ng-model="SignalId">
                            <option value="">--- Please select signal ---</option> <!-- not selected / blank option -->
                            <option ng-repeat="signal in segment.analogsignals" value="{{$index}}">Signal #{{$index}}</option>
                        </select>
                    </div>
                    <div ng-show="block.spike_trains">
                        <select class="form-control" ng-change="switchSegment()" ng-model="currentSegmentId">
                            <option ng-repeat="segment in block.segments" value="{{$index}}">
                                Segment #{{$index}}
                            </option>
                        </select>
                        <select class="form-control" ng-show="graphType=='analogsignals'" ng-change="switchAnalogSignal()" ng-model="currentAnalogSignalId">
                            <option value="">--- Please select signal ---</option> <!-- not selected / blank option -->
                            <option ng-show="segment.analogsignals" ng-repeat="signal in segment.analogsignals" value="{{$index}}">
                                Signal #{{$index}} <span ng-show="signal.name">({{signal.name}})</span>
                            </option>
                            <option ng-show="segment.irregularlysampledsignals" ng-repeat="signal in segment.irregularlysampledsignals" value="{{$index}}">
                                Signal #{{$index}} <span ng-show="signal.name">({{signal.name}})</span>
                            </option>
                        </select>
                        <div ng-show="segment.analogsignals.length>0" >
                            <br>
                            Graph type:
                            <input type="radio" ng-model="graphType" value="spiketrains" ng-change="changeGraph(value)"><b>Spike trains</b>
                            <input type="radio" ng-model="graphType" value="analogsignals" ng-change="changeGraph(value)"><b>Analog signals</b>
                        </div>
                    </div>
                    </form>
                </div>
                <div ng-if="dataLoading" class="loader"></div>
                <div id={{divid}}></div> 
            </div>
            <div ng-show="error" class="panel panel-error">
                <div class="panel-heading">
                    <p>Error</p>
                </div>
                <div class="panel-body">
                    {{error}}
                </div>
            </div>
            </div>
        `,
        scope: { source: '@', height: '@', iotype: '@', block: '@', downsamplefactor: '@', segmentid: '@', signalid: '@', spiketrainselect: '@', divid: '@'},
        controller: 'MainCtrl'
    }
})

.controller("URLFormController", function($scope) {
    $scope.dataFileURL = "";
});
