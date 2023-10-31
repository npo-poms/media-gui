angular.module( 'poms.controllers' ).controller( 'GuiController', [
    '$rootScope',
    '$scope',
    '$route',
    '$location',
    '$uibModal',
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
            $uibModal,
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
            InfoService
            ) {

            this.$rootScope = $rootScope;
            this.$route = $route;
            this.$location = $location;
            this.$uibModal = $uibModal;
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
            this.infoService = InfoService;

            this.$scope = $scope;
            this.$document = $document;
            this.$timeout = $timeout;

            this.currentTab = undefined;
            this.currentTabIndex = -1;
            this.tabs = [];

            this.$scope.userDropdown = {isopen: false};

            $scope.errors = [];

            this.init();
        }

        GuiController.prototype = {

            loaded: false,

            init: function () {
                this.guiService.boot(this).then(
                    function (tabs) {
                        this.tabs = tabs;
                        this.editor = this.editorService.getCurrentEditor();

                        this.handleEdits();

                        this.handleErrors();

                        this.subscribeToPublicationMessages();

                        this.handleRemove();

                        this.handleRouteChange();

                        this.bindUploadListener();

                        this.loaded = true;
                        this.initTabs();

                    }.bind( this )
                );
            },


            /**
             * Just add a tab to the end.
             */
            addTab: function (tab) {
                tab.index = this.tabs.length;
                this.tabs.push(tab);
                return tab.index;
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
                }
                if (this.currentTabIndex > this.tabs.length) {
                    this.setActive(this.tabs[this.tabs.length - 1].id);
                }
                this.localStorageService.set(this.editor.hashId , []);
            },

            editAccount: function () {
                this.editorService.editAccount();
            },

            editMedia: function (mid, title, type) {
                console.log("Editing media", mid, title, type);
                if ( this.setActive(mid) ) {
                    console.log("Already active");
                    return;
                }
                const newTab = {
                    reload: true,
                    id: mid,
                    item: {
                        mid: mid,
                        mainTitle: {
                            text: title,
                        },
                        type: type
                    },
                    type: 'edit'
                };
                console.log("tab", newTab);
                this.addTab(newTab);
                this.$timeout(function() {
                    this.setActive(mid)
                }.bind(this));
            },

            editSelection: function ( selection ) {
                angular.forEach( selection, function ( item, index ) {
                    // Add a tab with a media placeholder to reload. Should reload on tab activation
                    if ( ! this.setActive(item.mid ) ) {
                        if(!item.mid || !item.type || !item.permissions || !item.title) {
                            throw new Error('Invalid item');
                        }
                        const tab = {
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
                        this.addTab(tab);
                    }
                }.bind(this) );

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


            handleRemove: function () {
                this.$scope.$on( this.pomsEvents.deleted, function ( e, mid ) {
                    for (let i = 0; i < this.tabs.length; i ++ ) {
                        const tab = this.tabs[i];
                        if ( tab.id === mid ) {
                            this.removeTab(i);
                        }
                    }
                }.bind( this ) );
            },

            handleRouteChange: function () {
                this.$scope.$on( '$routeChangeSuccess', function () {
                    console.log("Route changed", this.$route.current);
                    const mid = this.$route.current.params.mid;
                    if (mid) {
                        if ( ! this.setActive(mid ) ) {
                            console.log("Creating new tab for mid");
                            this.newEditTab( mid );
                        }
                    }

                    const qid = this.$route.current.params.qid;
                    if ( qid ) {
                        if (!this.setActive(qid )) {
                            console.log("Could not set to", qid);
                        }
                    }
                }.bind( this ) );
            },

            leaveTab: function() {
                console.log("leaveTab", arguments);
            },

            /**
             * @param tab The tab (an object) to init
             */
            initTab: function (tab) {

                if (tab == null) {
                    console.log("initTab called with null tab!");
                    return;
                }
                console.log("Initing tab", tab);

                if (tab.type === 'edit' ) {
                    if (tab.reload) {
                        tab.reload = false;
                        this.mediaService.load(tab.id).then(
                            function (media) {
                                angular.copy(media, tab.item);
                                //          this.doRecalculate();
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
                }
                return true;
            },

            initTabs: function () {

                const entryMid = this.$route.current.params.mid;
                let openNewMedia = true;

                if ( this.tabs.length === 0 ) {
                    this.newSearch();
                } else {
                    console.log("initTab length ", this.tabs.length);
                    for (let i = 0; i < this.tabs.length; i ++ ) {
                        const tab = this.tabs[i];
                        if ( tab.type === 'edit' ) {
                            tab.reload = true;
                        }
                        tab.index = i;

                        if ( tab.mid === entryMid ) {
                            openNewMedia = false;
                        }
                    }

                    if ( openNewMedia ) {
                        if ( !this.setActive( entryMid ) ) {
                            this.newEditTab( entryMid );
                        }
                    }
                }
                const foundIndex = this.tabs.findIndex(function (tab) {
                    return tab.active;
                });
                if (foundIndex !== -1) {
                    // TODO, wth
                    console.log("Found active tab. Initing and making active.", foundIndex, this.tabs[foundIndex]);
                    this.setActive(this.tabs[foundIndex].id);
                    this.$timeout(function () {
                        this.initTab(this.tabs[foundIndex]);
                    }.bind(this), 1000);
                }
            },

            isActive: function ( tab ) {
                return tab.active;
            },

            logOut: function () {
                this.editorService.logOut();
            },

            /**
             * New editTab for mid (or opens the existing one if there is one)
             */
            newEditTab: function (mid, title, type) {
                if ( this.setActive(mid )) {
                    return;
                }
                this.editMedia(mid, title, type);
            },

            newMedia: function () {
                const modal = this.$uibModal.open( {
                    controller: 'CreateController',
                    controllerAs: 'controller',
                    templateUrl: '/views/edit/modal-create.html',
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
                this.$uibModal.open( {
                    controller: 'InfoController',
                    controllerAs: 'infoController',
                    templateUrl: '/views/gui/modal-info.html',
                    windowClass: 'modal-info'
                } );
            },

            openOwnerInfo: function(){
                this.$uibModal.open( {
                    controller: 'OwnerInfoController',
                    controllerAs: 'controller',
                    templateUrl: '/views/gui/modal-owner-info.html',
                    windowClass: 'modal-owner-info'
                } );

            },

            openTranscodings: function () {
                const modal = this.$uibModal.open({
                    controller: 'TranscodingsController',
                    controllerAs: 'transcodingsController',
                    templateUrl: '/views/gui/modal-transcodings.html',
                    windowClass: 'modal-transcodings'
                });

                modal.result.then(
                    function ( mid ) {
                        this.newEditTab( mid );

                    }.bind( this )
                );
            },

            openSearchTab: function ( search ) {
                if (this.setActive( search.id ) ) {
                    return;
                }
                const newTab = {
                    id: search.id,
                    item: search,
                    type: 'search'
                }
                this.addTab(newTab);
                this.setActive(newTab.id);
            },

            openLiveEditor : function(){

                const modal = this.$uibModal.open({
                    controller: 'LiveEditorController',
                    controllerAs: 'liveEditorController',
                    templateUrl: '/views/gui/modal-live-editor.html',
                    windowClass: 'modal-live-editor'
                });

                modal.result.then(
                    function ( mid ) {
                        this.newEditTab( mid );
                    }.bind( this )
                );
            },

            removeSearchTab: function ( search ) {
                for (let i = 0; i < this.tabs.length; i ++ ) {
                    const tab = this.tabs[i];
                    if ( tab.id === search.id ) {
                        this.removeTab(i);
                        break;
                    }
                }
            },

            removeTab: function (index) {
                this.tabs.splice(index, 1);
                if ( this.tabs.length === 0 ) {
                    this.newSearch();
                }
                this.setActive( this.tabs[Math.max(index - 1, 0)].id );
                this.scrlTabsApi.doRecalculate();
            },

            /**
             * Set the current tab and scroll to the last known position
             */
            setScrolling : function ( tab ) {
                const currentScrollPosition = this.$document.scrollTop();
                if (this.currentTab) {
                    this.currentTab.scrollPosition = currentScrollPosition;
                }
                if ( tab && tab.scrollPosition) {
                    this.$document.scrollTop(tab.scrollPosition)
                } else {
                    this.$document.scrollTop(0);
                }
            },

            /**
             * @param id The id (mid or search hash) of the tab to set active
             */
            setActive: function (id) {
                let found = false;
                for (let i = 0; i < this.tabs.length; i ++ ) {
                    const tab = this.tabs[i];
                    if ( tab.id === id ) {
                        let changed = this.currentTabIndex !== i;
                        if (changed) {
                            this.currentTabIndex = i;
                            this.currentTab = tab;
                            tab.active = true;
                            this.$location.path('/' + tab.type + '/' + tab.id);
                            if (tab.type === 'edit') {
                                document.title = 'POMS - ' + (tab.item.mainTitle ? tab.item.mainTitle.text : "(no title)");
                            } else {
                                document.title = 'POMS - Zoek - ' + tab.item.form.summary;
                            }
                            if (this.scrlTabsApi && this.tabs.length > 1) {
                                this.scrlTabsApi.scrollTabIntoView(i);
                            }
                            this.initTab(tab);
                            this.setScrolling(tab);
                            this.$rootScope.$emit(this.pomsEvents.tabChanged, tab);
                        } else if (tab.reload) {
                            this.initTab(tab);
                        } else {
                            console.log("Nothing to do (" +  id + "is already active)");
                        }
                        found = true;
                    } else {
                        tab.active = false;
                    }
                }

                //console.log("setActive", id, found, this.currentTabIndex);
                return found;
            },

            doRecalculate: function() {
                console.log("doRecalculate", this.scrlTabsApi);
                this.scrlTabsApi && this.scrlTabsApi.doRecalculate();
            },
            showOwnerMis: function () {
                return this.editorService.currentEditorHasRoles( ['MIS'] ) && this.editorService.getCurrentOwnerType() !== 'BROADCASTER';
            },
            currentOwnerTypeToShow: function() {
                const currentOwnerType = this.editorService.getCurrentOwnerType();
                return currentOwnerType === 'NPO' ? '' : currentOwnerType;
            },

            subscribeToPublicationMessages: function () {
                try {
                    this.messageService.receivePublicationMessage()
                        .then( null, null, function ( message ) {
                            this.$rootScope.$broadcast( this.pomsEvents.publication, message );
                        }.bind( this ) );
                } catch ( e ) {
                    console.log('Can\'t setup a /topic/publications websocket, see root cause: ', e );
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
