angular.module( 'poms.controllers' ).controller( 'GuiController', [
    '$rootScope',
    '$scope',
    '$route',
    '$location',
    '$modal',
    '$document',
    '$timeout',
    'localStorageService',
    'appConfig',
    'PomsEvents',
    'GuiService',
    'ListService',
    'EditorService',
    'FavoritesService',
    'SearchService',
    'MessageService',
    'MediaService',
    'UploadService',
    'NotificationService',
    'InfoService',
    (function () {

        function GuiController (
            $rootScope,
            $scope,
            $route,
            $location,
            $modal,
            $document,
            $timeout,
            localStorageService,
            appConfig,
            pomsEvents,
            guiService,
            listService,
            editorService,
            favoritesService,
            searchService,
            messageService,
            mediaService,
            UploadService,
            NotificationService,
            infoService
            ) {

            this.$rootScope = $rootScope;
            this.$route = $route;
            this.$location = $location;
            this.$modal = $modal;
            this.localStorageService = localStorageService;
            this.pomsEvents = pomsEvents;
            this.guiService = guiService;
            this.listService = listService;
            this.editorService = editorService;
            this.favoritesService = favoritesService;
            this.searchService = searchService;
            this.messageService = messageService;
            this.mediaService = mediaService;
            this.uploadService = UploadService;
            this.notificationService = NotificationService;
            this.infoService = infoService;

            this.$scope = $scope;
            this.$document = $document;
            this.$timeout = $timeout;

            this.currentTab = undefined;

            this.$scope.userDropdown = {isopen: false};

            $scope.errors = [];

            this.init();
        }

        GuiController.prototype = {

            loaded: false,

            init: function () {
                this.guiService.boot(this).then(
                    function (tabs) {
                        this.loaded = true;
                        this.tabs = tabs;
                        this.initTabs();
                        //console.log(this.tabs);
                        this.editor = this.editorService.getCurrentEditor();


                        this.handleEdits();

                        this.handleErrors();

                        this.subscribeToPublicationMessages();

                        this.handleRemove();

                        this.handleRouteChange();

                        this.bindUploadListener();

                    }.bind( this )
                );
            },

            addTab: function ( tab, setActive ) {
                this.tabs.push( tab );
                if (setActive) {
                    this.setActive(tab.id);
                }
            },

            bindUploadListener: function () {

                this.$rootScope.$on( this.pomsEvents.emitUploadStatus, function ( e, upload ) {
                    this.$rootScope.$broadcast( this.pomsEvents.uploadStatus, upload );
                }.bind( this ) );

                window.onbeforeunload = function ( e ) {
                    if ( this.uploadService.isUploading() ) {
                        return 'Er is nog een upload bezig. Door dit venster te verlaten zal deze worden afgebroken.';
                    }
                }.bind( this );

            },

            closeAllTabs: function( e, newLength) {
                if (newLength === undefined) {
                    newLength = 0;
                }
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.tabs.length = newLength;
                if (this.tabs.length === 0) {
                    this.newSearch();
                } else {
                    this.setScrolling( this.tabs[ this.tabs.length  - 1 ] );
                    this.scrlTabsApi.doRecalculate();
                }
                this.localStorageService.set( this.editor.hashId , []);
            },

            editAccount: function () {
                this.editorService.editAccount();
            },

            editMedia: function ( media, setActive) {
                var exists = this.tabs.some(function(tab) {
                    return tab.id === media.mid;
                });
                if (exists) {
                    if (setActive) {
                        this.setActive(media.mid)

                    }
                    return;
                }

                this.addTab({
                    id: media.mid,
                    item: media,
                    type: 'edit'
                });
                if (setActive) {
                    this.setActive(media.mid);
                    // seems a hack, but I can't get it working normally
                    this.$timeout(function () {
                        $("#tab-" + mid).addClass("active");
                    });
                }

            },

            editSelection: function ( selection ) {
                var activated = false;
                angular.forEach( selection, function ( item, index ) {
                    // Add a tab with a media placeholder to reload. Should reload on tab activation
                    if ( ! this.setActive( item.mid ) ) {
                        if(!item.mid || !item.type || !item.permissions || !item.title) {
                            throw new Error('Invalid item');
                        }
                        var tab = {
                            active: false,
                            reload: true,
                            id: item.mid,
                            item: {
                                mid: item.mid,
                                type: item.type,
                                permissions: item.permissions,
                                mainTitle: {text: item.title}
                            },
                            type: 'edit'
                        };
                        this.addTab( tab, !activated);
                        activated = true;
                    }
                }.bind( this ) );

            },


            generateId: function () {
                return Math.random().toString( 36 ).substr( 2 );
            },

            handleEdits: function () {
                this.$rootScope.$on( this.pomsEvents.edit, function ( e, mid ) {
                    window.location.href = '#/edit/' + mid ;
                });
            },

            handleErrors: function () {
                this.$rootScope.$on( this.pomsEvents.error, function ( e, error ) {
                    this.$scope.errors.push( error );
                }.bind( this ) );
            },

/*
            handleOpenFavoriteSearch: function () {

                this.$rootScope.$on( 'openSearch', function ( e, query ) {
                    this.newSearch( query );
                }.bind( this ) );

                this.$rootScope.$on( 'activateSearch', function ( e, tabId ) {
                    if ( this.setActive( tabId ) ) {
                        return;
                    }
                }.bind( this ) );

                this.$rootScope.$on( 'favoriteAdded', function ( e, favorite ) {
                    this.$rootScope.$broadcast( 'favorite', favorite );
                }.bind( this ) );
            },
*/

            handleRemove: function () {
                this.$scope.$on( this.pomsEvents.deleted, function ( e, mid ) {
                    for ( var i = 0; i < this.tabs.length; i ++ ) {
                        var tab = this.tabs[i];
                        if ( tab.id === mid ) {
                            this.removeTab( i );
                        }
                    }
                }.bind( this ) );
            },

            handleRouteChange: function () {
                this.$scope.$on( '$routeChangeSuccess', function () {

                    var mid = this.$route.current.params.mid;
                    if ( mid ) {
                        this.newEditTab( mid, true);
                    }

                    var qid = this.$route.current.params.qid;
                    if ( qid ) {
                        if ( this.setActive( qid) ) {
                            return;
                        }
                    }
                }.bind( this ) );
            },

            initTab: function ( tab ) {
                this.$location.path( '/' + tab.type + '/' + tab.id );
                if ( tab.type === 'edit' ) {
                    document.title = 'POMS - ' + (tab.item.mainTitle ? tab.item.mainTitle.text : "(no title)");
                    if ( tab.active && tab.reload ) {
                        tab.reload = false;
                        this.mediaService.load(tab.id).then(
                            function (media) {
                                angular.copy(media, tab.item);
                            }.bind(this),
                            function (error) {
                                if (error.status === 404) {
                                    this.removeTab(_.findIndex(this.tabs, function (t) {
                                        return t.id === tab.id;
                                    }));
                                }
                            }.bind(this)
                        );
                    }
                } else {
                    document.title = 'POMS - Zoek';
                }
            },

            initTabs: function () {

                var entryMid = this.$route.current.params.mid;
                var openNewMedia = entryMid != null;

                if ( this.tabs.length === 0 ) {
                    this.newSearch();
                } else {
                    for ( var i = 0; i < this.tabs.length; i ++ ) {
                        var tab = this.tabs[i];

                        if ( tab.type === 'edit' ) {
                            tab.reload = true;
                        }

                        if ( tab.id === entryMid ) {
                            openNewMedia = false;
                        }
                        tab.active = false;
                    }

                    if ( openNewMedia ) {
                        this.newEditTab( entryMid, true);
                    } else {
                        if (! this.setActive( entryMid)) {
                            this.setActive(  this.tabs[0].id);
                        }

                    }
                }

            },

            isActive: function ( tab ) {
                return tab.active;
            },

            logOut: function () {
                this.editorService.logOut();
            },

            newEditTab: function ( mid, setActive ) {
                this.mediaService.load( mid ).then(
                    function ( media ) {
                        this.editMedia(media, setActive);

                    }.bind( this ),
                    function ( error ) {
                        console.error(error)
                        this.$rootScope.$emit(this.pomsEvents.error, error );
                    }.bind( this ));
            },

            newMedia: function () {
                var modal = this.$modal.open( {
                    controller: 'CreateController',
                    controllerAs: 'controller',
                    templateUrl: 'edit/modal-create.html',
                    windowClass: 'modal-create',
                    resolve: {
                        mediaTypes: this.listService.getMediaCreateTypes,
                        avTypes: this.listService.getAvTypes,
                        broadcasters: this.editorService.getAllowedBroadcasters,
                        portals: this.editorService.getAllowedPortals,
                        genres: this.listService.getGenres,
                        chapterTypes: this.listService.getChapterTypes,
                        media: function () {
                            return {};
                        }
                    }
                } );

                modal.result.then(
                    function ( source ) {
                        this.editMedia( source, true);
                    }.bind( this )
                );
            },


            /**
             * Creates and inserts a new search
             */
            newSearch: function ( ) {
                this.openSearchTab(this.searchService.newSearch());
            },



            openInEditor: function ( media ) {
                if ( angular.isArray( media ) ) {
                    if ( media.length === 1 ) {
                        window.location.href = '#/edit/' + media[0];
                    } else {
                        this.editSelection( media );
                    }
                } else {
                    window.location.href = '#/edit/' + media;
                }
            },

            openFavorites: function () {
                this.favoritesService.openFavorites();
            },

            openInfo: function () {
                this.$modal.open( {
                    controller: 'InfoController',
                    controllerAs: 'infoController',
                    templateUrl: 'gui/modal-info.html',
                    windowClass: 'modal-info'
                } );
            },

            openOwnerInfo: function(){
                this.$modal.open( {
                    controller: 'OwnerInfoController',
                    controllerAs: 'controller',
                    templateUrl: 'gui/modal-owner-info.html',
                    windowClass: 'modal-owner-info'
                } );

            },

            openTranscodings: function () {
                var modal = this.$modal.open( {
                    controller: 'TranscodingsController',
                    controllerAs: 'transcodingsController',
                    templateUrl: 'gui/modal-transcodings.html',
                    windowClass: 'modal-transcodings'
                } );

                modal.result.then(
                    function ( mid ) {
                        this.newEditTab( mid, true);

                    }.bind( this )
                );
            },

            openSearchTab: function ( search ) {
                if ( this.setActive(   search.id ) ) {
                    return;
                }

                this.addTab( {
                    active: true,
                    id: search.id,
                    item: search,
                    type: 'search'
                }, true);
            },

            openLiveEditor : function(){

                var modal = this.$modal.open( {
                    controller: 'LiveEditorController',
                    controllerAs: 'liveEditorController',
                    templateUrl: 'gui/modal-live-editor.html',
                    windowClass: 'modal-live-editor'
                } );

                modal.result.then(
                    function ( mid ) {
                        this.newEditTab( mid, true);
                    }.bind( this )
                );
            },

            removeSearchTab: function ( search ) {
                for ( var i = 0; i < this.tabs.length; i ++ ) {
                    var tab = this.tabs[i];
                    if ( tab.id === search.id ) {
                        this.removeTab( i );
                        break;
                    }
                }
            },

            removeTab: function ( index ) {
                var tabToRemove = this.tabs[index];
                var newActive = null;
                if (tabToRemove.active) {
                    console.log("Closing active tab", index, tabToRemove)
                    if (this.tabs.length > index + 1 ) {
                        console.log("right tab can be active", this.tabs[index + 1]);
                        newActive = index;
                    } else {

                        if (index >= 1) {
                            console.log("left tab can be active", this.tabs[index - 1]);
                            newActive = index - 1;
                        } else {
                            console.log("this was the last tab");
                        }
                    }
                }
                this.tabs.splice( index, 1 );
                if ( this.tabs.length === 0 ) {
                    this.newSearch();
                    this.setScrolling( this.tabs[index - 1] );
                    this.scrlTabsApi.doRecalculate();
                } else {
                    if (newActive != null) {
                        console.log("Activating", this.tabs[newActive]);
                        this.setActive(this.tabs[newActive].id);
                    }

                }


            },

            /**
             * Set the current tab and scroll to the last known position
             */
            setScrolling : function ( tab ) {
                var currentScrollPosition = this.$document.scrollTop();
                if ( this.currentTab ) {
                    this.currentTab.scrollPosition = currentScrollPosition;
                }
                if ( tab && tab.scrollPosition ) {
                    this.$document.scrollTop( tab.scrollPosition )
                }else{
                    this.$document.scrollTop( 0 );
                }
                this.currentTab = tab;
            },

            setActive: function ( id ) {
                //console.log("setting active tab", id);
                var activeId = null;
                for ( var i = 0; i < this.tabs.length; i ++ ) {
                    var tab = this.tabs[i];
                    if ( tab.id === id ) {

                        tab.active = true;
                        if (this.scrlTabsApi && this.tabs.length > 1){
                            this.scrlTabsApi.scrollTabIntoView(i);
                        }
                        this.setScrolling( tab );
                        this.$rootScope.$emit(this.pomsEvents.tabChanged, tab);
                        activeId = id;
                    } else {
                        this.active = false;
                    }
                }
                if (activeId != null) {
                    // seems a hack, but I can't get it working normally
                    this.$timeout(function() {
                        $("#tab-" + activeId).addClass("active");
                    });
                }
                return activeId != null;
            },

            showSecondScreens: function () {
                return this.editorService.currentEditorHasRoles( ['SCREENUSER', 'SUPERADMIN'] );
            },

            showOwnerMis: function () {
                return this.editorService.currentEditorHasRoles( ['MIS'] ) && this.editorService.getCurrentOwnerType() !== 'BROADCASTER';
            },
            currentOwnerTypeToShow: function() {
                var currentOwnerType = this.editorService.getCurrentOwnerType();
                return currentOwnerType === 'NPO' ? '' : currentOwnerType;
            },

            subscribeToPublicationMessages: function () {
                try {
                    this.messageService.receivePublicationMessage()
                        .then( null, null, function ( message ) {
                            this.$rootScope.$broadcast( this.pomsEvents.publication, message );
                        }.bind( this ) );
                } catch ( e ) {
                    console.log( 'Can\'t setup a /topic/publications websocket, see root cause: ', e );
                }
            },

            toggleUserDropdown: function ( $event ) {
                $event.preventDefault();
                $event.stopPropagation();
                this.$scope.userDropdown.isopen = ! this.$scope.userDropdown.isopen;
            }


        };

        return GuiController;
    }())
] );
