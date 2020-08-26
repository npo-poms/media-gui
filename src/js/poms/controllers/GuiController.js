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
    (function () {

        function GuiController ( $rootScope,
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
                                 NotificationService) {

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

            this.$scope = $scope;
            this.$document = $document;
            this.$timeout = $timeout;

            this.currentTab = undefined;

            this.$scope.adminDropdown = {isopen: false};
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
                        this.editor = this.editorService.getCurrentEditor();

                        this.initTabs();

                        this.handleEdits();

                        this.handleErrors();

                        this.subscribeToPublicationMessages();

                        this.handleRemove();

                        this.handleRouteChange();

                        this.bindUploadListener();

                    }.bind( this )
                );
            },

            addTab: function ( tab ) {
                this.tabs.push( tab );
                this.$timeout( function () {
                    tab.active = true;

                    this.setScrolling( tab );
                    if ( this.tabs.length > 1){
                        this.scrlTabsApi.scrollTabIntoView( this.tabs.length );
                    }
                    this.scrlTabsApi.doRecalculate();


                }.bind( this ) );
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

            closeAllTabs: function( e ){
                e.preventDefault();
                e.stopPropagation();

                this.tabs = [];
                this.newSearch();

                this.localStorageService.set( this.editor.hashId , []);

            },

            editAccount: function () {
                this.editorService.editAccount();
            },

            editMedia: function ( media ) {
                if ( this.setActive( this.tabs, media.mid ) ) {
                    return;
                }

                this.addTab( {
                    active: true,
                    id: media.mid,
                    item: media,
                    type: 'edit'
                } );
            },

            editSelection: function ( selection ) {
                var tabs = this.tabs;
                angular.forEach( selection, function ( item, index ) {
                    // Add a tab with a media placeholder to reload. Should reload on tab activation
                    if ( ! this.setActive( tabs, item.mid ) ) {
                        if(!item.mid || !item.type || !item.permissions || !item.title) {
                            throw new Error('Invalid item');
                        }
                        var tab = {
                            active: false,
                            id: item.mid,
                            item: {
                                mid: item.mid,
                                type: item.type,
                                permissions: item.permissions,
                                mainTitle: {text: item.title}
                            },
                            type: 'edit'
                        };
                        this.addTab( tab);
                        this.mediaService.load( item.mid ).then(
                            function ( media ) {
                                tab.item = media;
                            }.bind( this ),
                            function ( error ) {
                                if(error.status === 404) {
                                    this.removeTab(_.findIndex(this.tabs, function(t) {
                                        return t.id === tab.id;
                                    }));
                                }
                            }.bind( this ))
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
                    if ( this.setActive( this.tabs, tabId ) ) {
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
                        if ( ! this.setActive( this.tabs, mid ) ) {
                            this.newEditTab( mid );
                        }
                    }

                    var qid = this.$route.current.params.qid;
                    if ( qid ) {
                        if ( this.setActive( this.tabs, qid ) ) {
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

                        this.mediaService.load( tab.id ).then(
                            function ( media ) {

                                angular.copy( media, tab.item );


                            }.bind( this ),
                            function ( error ) {
                                if(error.status === 404) {
                                    this.removeTab(_.findIndex(this.tabs, function(t) {
                                        return t.id === tab.id;
                                    }));
                                }
                            }.bind( this )
                        );

                    }
                }
                else {
                    document.title = 'POMS - Zoek';
                }
            },

            initTabs: function () {

                var entryMid = this.$route.current.params.mid;
                var openNewMedia = true;

                if ( this.tabs.length === 0 ) {
                    this.newSearch();
                } else {

                    for ( var i = 0; i < this.tabs.length; i ++ ) {
                        var tab = this.tabs[i];
                        if ( tab.type === 'edit' ) {
                            tab.reload = true;
                        }

                        if ( tab.mid === entryMid ) {
                            openNewMedia = false;
                        }
                    }

                    if ( openNewMedia ) {
                        if ( ! this.setActive( this.tabs, entryMid ) ) {
                            this.newEditTab( entryMid );
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

            newEditTab: function ( mid ) {
                this.mediaService.load( mid ).then(
                    function ( media ) {
                        this.editMedia(media);
                    }.bind( this ),
                    function ( error ) {
                        console.error(error)
                        this.$rootScope.$emit( pomsEvents.error, error );
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
                        media: function () {
                            return {};
                        }
                    }
                } );

                modal.result.then(
                    function ( source ) {
                        this.editMedia( source );
                    }.bind( this )
                );
            },


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
                var modal = this.$modal.open( {
                    controller: 'InfoController',
                    controllerAs: 'infoController',
                    templateUrl: 'gui/modal-info.html',
                    windowClass: 'modal-info'
                } );
            },

            openOwnerInfo: function(){

                var modal = this.$modal.open( {
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
                        this.newEditTab( mid );

                    }.bind( this )
                );
            },

            openSearchTab: function ( search ) {
                if ( this.setActive( this.tabs, search.id ) ) {
                    return;
                }

                this.addTab( {
                    active: true,
                    id: search.id,
                    item: search,
                    type: 'search'
                } );
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
                        this.newEditTab( mid );
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
                this.tabs.splice( index, 1 );
                if ( this.tabs.length === 0 ) {
                    this.newSearch();
                }
                this.setScrolling( this.tabs[ index - 1 ] );
                this.scrlTabsApi.doRecalculate();
            },

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

            setActive: function ( tabs, id ) {
                for ( var i = 0; i < tabs.length; i ++ ) {
                    var tab = tabs[i];
                    if ( tab.id === id ) {
                        tab.active = true;
                        if (this.scrlTabsApi && tabs.length > 1){
                            this.scrlTabsApi.scrollTabIntoView(i);
                        }
                        this.setScrolling( tab );
                        return true;
                    }
                }
                return false;
            },

            showAdmin: function () {
                return this.editorService.currentEditorHasRoles( ['SUPERADMIN'] );
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

            toggleAdminDropdown: function ( $event ) {

                $event.preventDefault();
                $event.stopPropagation();
                this.$scope.adminDropdown.isopen = ! this.$scope.adminDropdown.isopen;
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
