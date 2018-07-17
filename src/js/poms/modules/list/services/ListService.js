angular.module('poms.list.services').factory('ListService', [
    '$q',
    '$http',
    'appConfig',
    function($q, $http, appConfig) {

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

        function getMediaTypes(create) {
            return get('/types', {params : {create : create}, cache : true});
        }

        function ListService() {
        }

        ListService.prototype = {

            getAgeRatings : function() {
                return get('/ageRatings', {cache : true});
            },

            getAVFileFormats : function() {
                return get('/avFileFormats', {cache : true});
            },

            getAvTypes : function() {
                return get('/avTypes', {cache : true});
            },

            getOwnerTypes : function() {
                return get('/ownerTypes', {cache : true});
            },

            getBroadcasters : function() {
                return get('/broadcasters', {cache : true});
            },

            getChannels : function() {
                return get('/channels', {cache : true});
            },
            getNets: function() {
                return get('/nets', {cache : true});
            },

            getContentRatings : function() {
                return get('/contentRatings', {cache : true});
            },

            getCountries : function() {
                return get('/countries', {cache : true});
            },

            getEncryptionTypes : function() {
                return get('/encryptionTypes', {cache : true});
            },

            getGenres : function() {
                return get('/genres', {cache : true});
            },

            getImagesTypes : function() {
                return get('/images', {cache : true});
            },

            getLanguages : function() {
                return get('/languages', {cache : true});
            },

            getLicenses : function() {
                return get('/licenses', {cache : true});
            },

            getLivestreams : function() {
                return get('/livestreams', {cache : true});
            },

            getMediaTypes : function() {
                return getMediaTypes(false);
            },

            getMediaCreateTypes : function() {
                return getMediaTypes(true);
            },

            getPortals : function() {
                return get('/portals', {cache : true});
            },

            getPlatforms : function() {
                return get('/platforms', {cache : true});
            },

            getPriorityTypes : function() {
                return get('/priorityTypes', {cache : true});
            },

            getRegions : function() {
                return get('/regions', {cache : true});
            },

            getRelations : function() {
                return get('/relations', {cache : true});
            },

            getRoles : function() {
                return get('/roles', {cache : true});
            },

            getTags : function(text, max) {
                return get('/tags', {params : {text : text, max : max || 10}});
            },

            getUsers : function(text, max) {
                return get('/users', {params : {text : text, max : max || 10}});
            }
        };

        return new ListService();
    }
]);
