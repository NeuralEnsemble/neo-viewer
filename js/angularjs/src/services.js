

angular.module('neo-visualizer')

.value('baseURL', 'https://neoviewer.apps.ebrains.eu/api/')

.factory('BlockData', ['$resource', 'baseURL',
    function($resource, baseURL) {
        return $resource(baseURL + 'blockdata/', {}, {
            get: { method: 'GET', isArray: false },
        })
    }
])

.factory('SegmentData', ['$resource', 'baseURL',
    function($resource, baseURL) {
        return $resource(baseURL + 'segmentdata/', {}, {
            get: { method: 'GET', isArray: false },
        })
    }
])

.factory('AnalogSignalData', ['$resource', 'baseURL',
    function($resource, baseURL) {
        return $resource(baseURL + 'analogsignaldata/', {}, {
            get: { method: 'GET', isArray: false },
        })
    }
])

.factory('SpikeTrainData', ['$resource', 'baseURL',
    function($resource, baseURL) {
        return $resource(baseURL + 'spiketraindata/', {}, {
            get: { method: 'GET', isArray: false },
        })
    }
])

.config(function($resourceProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
});
