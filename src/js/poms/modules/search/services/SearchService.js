angular.module('poms.search.services').factory('SearchService', [
    '$rootScope',
    '$q',
    '$http',
    '$filter',
    '$modal',
    'appConfig',
    'GuiService',
    'MediaService',
    'PomsEvents',
    'SearchFactory',
    function($rootScope, $q, $http, $filter, $modal, appConfig, guiService, mediaService, pomsEvents, searchFactory) {

        var baseUrl = appConfig.apihost + '/gui/search';

        function post(path, body, config) {

            var deferred = $q.defer();
            var url = baseUrl + path;

            $http.post(url, body, config)
                .success(function(results) {
                    deferred.resolve(results);
                })
                .error(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        function SearchService() {
            this.mediaService = mediaService;
        }

        SearchService.prototype = {

            newForm : function(config) {
                return searchFactory.newForm(config)
            },

            newSearch : function(config) {
                return searchFactory.newSearch(config)
            },

            load : function(queryData, options) {
                var config = {
                    params : options
                };

                return post('', queryData, config);
            },

            download : function(queryData, options) {
                var config = {
                    params : options
                };

                return post('/csv', queryData, config);
            },

            loadEpisodes : function(queryData, options) {
                var config = {
                    params : options
                };

                return post('/episodes', queryData, config);
            },

            loadEpisodeOfs : function(queryData, options) {
                var config = {
                    params : options
                };

                return post('/episodeOfs', queryData, config);
            },

            suggest : function(queryData) {
                var queryDataCopy = this.setStopDates(queryData);
                return $http.post(appConfig.apihost + '/gui/search/titles', queryDataCopy);
            },

            setStopDates: function(queryData) {
                var queryDateCopy  = angular.copy(queryData);
                for (f in this.mediaService.dateConstraintTypes) {
                    var range = queryDateCopy[f];
                    if (range.stop) {
                        var d = new Date(range.stop);
                        d.setDate(d.getDate() + 1);
                        range.stop = d.toISOString();
                    }
                }
                return queryDateCopy;
            },

            editResult : function(result) {
                guiService.editMid(result.mid);
            },

            editSelection : function(selection) {
                guiService.editSelection(selection);
            },

            previewResultsInModal : function(results, index) {
                var modal = $modal.open( {
                    controller: 'PreviewController',
                    controllerAs: 'controller',
                    templateUrl: 'gui/modal-preview-media.html',
                    windowClass: 'modal-preview',

                    resolve: {
                        items: function () {
                            return results;
                        }.bind(this),
                        step: function () {
                            return index ? index : 0;
                        }.bind(this)
                    }
                } );

                modal.result.then(
                        function ( source ) {
                            this.edit( source )
                        }.bind( this ),
                        function ( error ) {
                        } );
            },

            searchUserUpdates : function( displayName, lastModified ) {
                lastModified = lastModified || {};

                guiService.openSearchTab(searchFactory.newSearch({
                    form : {
                        lastModifiedBy : displayName,
                        lastModifiedDate : lastModified
                    }
                }));
            },

            searchMediaInModal : function( search ) {
                var deferred = $q.defer();

                var modal = $modal.open({
                    templateUrl : 'search/modal-search.html',
                    controller : 'ModalSearchController',
                    controllerAs : 'modalSearchController',
                    windowClass : 'modal-search',
                    resolve : {
                        search : function() {
                            return search;
                        }
                    }
                });

                modal.result.then(
                        function(results) {
                            deferred.resolve( results );
                        },
                        function(error) {
                            deferred.reject( error );
                        }
                );

                return deferred.promise;
            }
        };

        return new SearchService();
    }
]);
