

angular.module('neo-visualizer')

.value('baseURL', 'https://neo-viewer.brainsimulation.eu/')

.factory('BlockData', ['$resource', 'baseURL',
    function($resource, baseURL) {
        return $resource(baseURL + 'blockdata/', {}, {
            get: { method: 'GET', params: { format: 'json' }, isArray: false },
        })
    }
])

.factory('SegmentData', ['$resource', 'baseURL',
    function($resource, baseURL) {
        return $resource(baseURL + 'segmentdata/', {}, {
            get: { method: 'GET', params: { format: 'json' }, isArray: false },
        })
    }
])

.factory('AnalogSignalData', ['$resource', 'baseURL',
    function($resource, baseURL) {
        return $resource(baseURL + 'analogsignaldata/', {}, {
            get: { method: 'GET', params: { format: 'json' }, isArray: false },
        })
    }
])

.factory('SpikeTrainData', ['$resource', 'baseURL',
    function($resource, baseURL) {
        return $resource(baseURL + 'spiketraindata/', {}, {
            get: { method: 'GET', params: { format: 'json' }, isArray: false },
        })
    }
])

.config(function($resourceProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
});
