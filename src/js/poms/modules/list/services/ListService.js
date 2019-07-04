angular.module('poms.list.services').factory('ListService', [
    '$q',
    '$http',
    'appConfig',
    function($q, $http, appConfig) {

        var GET_CONFIG = {
            cache: true
        };

        function get(path, config) {
            var deferred = $q.defer();

            $http.get(appConfig.apihost + '/gui/select' + path, config)
                    .success(function(data) {
                        deferred.resolve(data);
                    }.bind(this))
                    .error(function(error) {
                        deferred.reject(error);
                    });

            return deferred.promise;
        }


        function ListService() {
        }

        ListService.prototype = {

            getAgeRatings : function() {
                return get('/ageRatings', GET_CONFIG);
            },

            getAVFileFormats : function() {
                return get('/avFileFormats', GET_CONFIG);
            },

            getAvTypes : function() {
                return get('/avTypes', GET_CONFIG);
            },

            getOwnerTypes : function() {
                return get('/ownerTypes', GET_CONFIG);
            },

            getBroadcasters : function() {
                return get('/broadcasters', GET_CONFIG);
            },

            getChannels : function() {
                return get('/channels', GET_CONFIG);
            },
            getNets: function() {
                return get('/nets', GET_CONFIG);
            },

            getContentRatings : function() {
                return get('/contentRatings', GET_CONFIG);
            },

            getCountries : function() {
                return get('/countries', GET_CONFIG);
            },

            getEncryptionTypes : function() {
                return get('/encryptionTypes', GET_CONFIG);
            },

            getGenres : function() {
                return get('/genres', GET_CONFIG);
            },

            getIntentions: function() {
                return get('/intentions', GET_CONFIG);
            },

            getTargetGroups: function() {
                return get('/targetGroups', GET_CONFIG);
            },

            getImagesTypes : function() {
                return get('/images', GET_CONFIG);
            },

            getLanguages : function() {
                return get('/languages', GET_CONFIG);
            },

            getLicenses : function() {
                return get('/licenses', GET_CONFIG);
            },

            getLivestreams : function() {
                return get('/livestreams', GET_CONFIG);
            },

            getMediaTypes : function() {
                return get("/types", GET_CONFIG);
            },

            getMediaCreateTypes : function() {
                var promise = get("/types", GET_CONFIG);
                return promise.then(function(data) {
                    return data.filter(function(element) { return element.mayCreate; });
                });

            },

            getPortals : function() {
                return get('/portals', GET_CONFIG);
            },

            getPlatforms : function() {
                return get('/platforms', GET_CONFIG);
            },

            getPriorityTypes : function() {
                return get('/priorityTypes', GET_CONFIG);
            },

            getRegions : function() {
                return get('/regions', GET_CONFIG);
            },

            getRelations : function() {
                return get('/relations', GET_CONFIG);
            },

            getPersonRoles : function() {
                return get('/personRoles', GET_CONFIG);
            },

            getGeoRelations : function() {
                return get('/geoRelations', GET_CONFIG);
            },

            getTags : function(text, max) {
                return get('/tags', {params : {text : text, max : max || 10}});
            },

            getUsers : function(text, max) {
                return get('/users', {params : {text : text, max : max || 10}});
            },

            getSubtitlesTypes : function(text, max) {
                return get('/subtitlesTypes', {params : {text : text, max : max || 10}});
            }
        };

        return new ListService();
    }
]);
