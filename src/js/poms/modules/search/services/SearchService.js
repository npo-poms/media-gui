angular.module('poms.search.services').factory('SearchService', [
    '$rootScope',
    '$q',
    '$http',
    '$filter',
    '$uibModal',
    'appConfig',
    'GuiService',
    'MediaService',
    'PomsEvents',
    'SearchFactory',
    function($rootScope, $q, $http, $filter, $uibModal, appConfig, guiService, mediaService, pomsEvents, searchFactory) {

        const baseUrl = appConfig.apiHost + '/gui/search';

        function post(path, body, config) {

            const deferred = $q.defer();
            const url = baseUrl + path;

            $http.post(url, body, config).then(
                function(response) {
                    deferred.resolve(response.data);
                },
                function(error) {
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
                const config = {
                    params: options
                };

                return post('', queryData, config);
            },

            download : function(queryData, options) {
                const config = {
                    params: options
                };

                return post('/csv', queryData, config);
            },

            loadEpisodes : function(queryData, options) {
                const config = {
                    params: options
                };

                return post('/episodes', queryData, config);
            },

            loadEpisodeOfs : function(queryData, options) {
                const config = {
                    params: options
                };

                return post('/episodeOfs', queryData, config);
            },

            suggest : function(queryData) {
                const queryDataCopy = this.setStopDates(queryData);
                return $http.post(appConfig.apiHost + '/gui/search/titles', queryDataCopy);
            },

            setStopDates: function(queryData) {
                const queryDateCopy = angular.copy(queryData);
                for (f in this.mediaService.dateConstraintTypes) {
                    const range = queryDateCopy[f];
                    if (range.stop) {
                        const d = new Date(range.stop);
                        d.setDate(d.getDate() + 1);
                        range.stop = d.toISOString();
                    }
                }
                return queryDateCopy;
            },

            editResult : function(result) {
                console.log("Editing  search result item", result);
                guiService.editMid(result.mid, result.title, result.type);
            },

            editSelection : function(selection) {
                guiService.editSelection(selection);
            },

            previewResultsInModal : function(results, index) {
                const modal = $uibModal.open({
                    controller: 'PreviewController',
                    controllerAs: 'controller',
                    templateUrl: '/views/gui/modal-preview-media.html',
                    windowClass: 'modal-preview',

                    resolve: {
                        items: function () {
                            return results;
                        }.bind(this),
                        step: function () {
                            return index ? index : 0;
                        }.bind(this)
                    }
                });

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
                const deferred = $q.defer();

                const modal = $uibModal.open({
                    templateUrl: '/views/search/modal-search.html',
                    controller: 'ModalSearchController',
                    controllerAs: 'modalSearchController',
                    windowClass: 'modal-search',
                    resolve: {
                        search: function () {
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
