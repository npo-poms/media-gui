angular.module('poms.media.services').factory('MergeService', [
    '$rootScope',
    '$http',
    '$q',
    '$uibModal',
    'appConfig',
    'GuiService',
    'PomsEvents',
    'SearchFactory',
    'SearchService',
    function($rootScope, $http, $q, $uibModal, appConfig, guiService, pomsEvents, searchFactory, searchService) {

        var baseUrl = appConfig.apiHost + '/gui/merge',
                url, source;

        function MergeService() {
        }

        MergeService.prototype = {

            merge : function(media) {
                source = media;
                this._findDestination(media);
            },

            _findDestination : function(media) {
                var search = searchFactory.newMergeSearch(media.type, { parentMid : media.mid }),
                        promise = searchService.searchMediaInModal(search);

                promise.then(function(destinations) {
                    if(destinations) {
                        this._requestMerge(media.mid, destinations[0].mid);
                    }
                }.bind(this));
            },

            _requestMerge : function(sMid, dMid) {
                // is later on used on put as well!!
                url = baseUrl + '/' + sMid + '/to/' + dMid;

                $http.get(url)
                        .success(function(merge) {
                            this._showMergeView(merge)
                        }.bind(this))
                        .error(function(error) {
                            $rootScope.$emit(pomsEvents.error, error)
                        });
            },

            _showMergeView : function(merge) {

                var modal = $uibModal.open({
                    templateUrl : 'edit/modal-merge.html',
                    controller : 'ModalMergeController',
                    controllerAs : 'controller',
                    windowClass : 'modal-merge',
                    resolve : {
                        config : function() {
                            return {};
                        },
                        merge : function() {
                            return merge;
                        },
                        submitMerge : function() {
                            return this._merge;
                        }.bind(this)
                    }
                });
            },

            _merge : function(config) {
                var deferred = $q.defer();

                $http.put(url, config)
                        .success(function(result) {
                            guiService.addedEpisode(result.mid);
                            guiService.addedEpisodeOf(result.mid);
                            guiService.addedMember(result.mid);
                            guiService.addedMemberOf(result.mid);

                            guiService.addedSegment(result.mid);

                            guiService.addedImage(result.mid);

                            guiService.editMid(result.mid);

                            guiService.deleted(source.mid);

                            deferred.resolve(result);
                        })
                        .error(function(error) {
                            deferred.reject(error);
                        });

                return deferred.promise;
            }
        };

        return new MergeService();
    }
]);
