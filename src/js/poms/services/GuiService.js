angular.module('poms.services').factory('GuiService', [
    '$rootScope',
    '$q',
    'localStorageService',
    'EditorService',
    'FavoritesService',
    'MediaService',
    'PomsEvents',
    'SearchFactory',
    function( $rootScope, $q, localStorageService, editorService, favoritesService, mediaService, pomsEvents, searchFactory ) {

        function GuiService() {
        }

        GuiService.prototype = {

            tabs : undefined,

            guiController : undefined,

            boot : function(guiController) {
                this.guiController = guiController;

                var deferred = $q.defer();

                editorService.init().then(
                        function(editor) {
                            this.migrateTabs(editor.hashId);

                            localStorageService.bind($rootScope, editor.hashId, []);


                            this.tabs = $rootScope[editor.hashId];

                            this.initTabs();

                            favoritesService.init();

                            deferred.resolve(this.tabs);
                        }.bind(this),
                        function(error) {
                            deferred.reject(error);
                        }
                );

                return deferred.promise;
            },

            initTabs : function() {
                for(var i = 0; i < this.tabs.length; i++) {
                    var tab = this.tabs[i];

                    if(tab.type === 'search') {
                        this.tabs[i].item = searchFactory.newSearch(tab.item);
                    }

                }
            },

            openMediaTab : function(media) {
                this.guiController.editMedia(media);
            },

            openSearchTab : function(search) {
                this.guiController.openSearchTab(search);
            },

            removeSearchTab : function(search) {
                this.guiController.removeSearchTab(search);
            },

            editMid : function(mid) {
                mediaService.load( mid ).then(
                        function ( media ) {
                            this.openMediaTab(media);
                        }.bind( this ),
                        function ( error ) {
                            $rootScope.$emit( pomsEvents.error, error );
                        }.bind( this ));
            },

            editSelection : function(selection) {
                this.guiController.editSelection(selection);
            },

            getActiveMid : function() {
                for(var i = 0; i < this.tabs.length; i++) {
                    var tab = this.tabs[i];
                    if(tab.type === 'edit' && tab.active) {
                        return tab.item.mid;
                    }
                }

                return undefined;
            },

            getGuiMedia : function() {
                var answer = [];

                for(var i = 0; i < this.tabs.length; i++) {
                    var tab = this.tabs[i];
                    if(tab.type === 'edit') {
                        answer.push(tab.item);
                    }
                }

                return answer;
            },

            deleted : function(mid) {
                $rootScope.$broadcast(pomsEvents.deleted, mid);
            },

            addedSegment : function(ownerMid) {
                $rootScope.$broadcast(pomsEvents.segmentAdded, ownerMid);
            },

            removedSegment : function(ownerMid) {
                $rootScope.$broadcast(pomsEvents.segmentRemoved, ownerMid);
            },

            addedMember : function(ownerMid) {
                $rootScope.$broadcast(pomsEvents.memberAdded, ownerMid);
            },

            removedMember : function(ownerMid) {
                $rootScope.$broadcast(pomsEvents.memberRemoved, ownerMid);
            },

            addedMemberOf : function(memberMid) {
                $rootScope.$broadcast(pomsEvents.memberOfAdded, memberMid);
            },

            removedMemberOf : function(memberMid) {
                $rootScope.$broadcast(pomsEvents.memberOfRemoved, memberMid);
            },

            addedEpisode : function(ownerMid) {
                $rootScope.$broadcast(pomsEvents.episodeAdded, ownerMid);
            },

            removedEpisode : function(ownerMid) {
                $rootScope.$broadcast(pomsEvents.episodeRemoved, ownerMid);
            },

            addedEpisodeOf : function(episodeMid) {
                $rootScope.$broadcast(pomsEvents.episodeOfAdded, episodeMid);
            },

            removedEpisodeOf : function(episodeMid) {
                $rootScope.$broadcast(pomsEvents.episodeOfRemoved, episodeMid);
            },

            addedImage : function(ownerMid) {
                $rootScope.$broadcast(pomsEvents.imageAdded, ownerMid);
            },

            removedImage : function(ownerMid) {
                $rootScope.$broadcast(pomsEvents.imageRemoved, ownerMid);
            },

            migrateTabs : function(key) {
                var mKey = key + '.migratedSearchTabs'
                if(localStorageService.get(mKey)) {
                    return;
                }

                var tabs = localStorageService.get(key);

                if(tabs) {
                    for(var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i];
                        if(tab.type === 'search') {
                            tabs[i].item = searchFactory.migrateQuery({id : tab.item.tab, form : tab.item});
                        }
                    }
                    localStorageService.set(this.mediaKey, tabs);
                }

                localStorageService.set(mKey, true);
            }
        };

        return new GuiService();
    }
]);
