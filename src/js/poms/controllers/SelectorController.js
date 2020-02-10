angular.module( 'poms.controllers' ).controller( 'SelectorController', [
    '$rootScope',
    '$scope',
    '$route',
    '$routeParams',
    '$location',
    '$modal',
    '$document',
    '$window',
    '$timeout',
    'localStorageService',
    'appConfig',
    'PomsEvents',
    'GuiService',
    'ListService',
    'EditorService',
    'FavoritesService',
    'SearchService',
    'SearchFactory',
    'MessageService',
    'MediaService',
    'UploadService',
    (function () {

        function SelectorController ( $rootScope,
                                 $scope,
                                 $route,
                                 $routeParams,
                                 $location,
                                 $modal,
                                 $document,
                                 $window,
                                 $timeout,
                                 localStorageService,
                                 appConfig,
                                 pomsEvents,
                                 guiService,
                                 listService,
                                 editorService,
                                 favoritesService,
                                 searchService,
                                 searchFactory,
                                 messageService,
                                 mediaService,
                                 UploadService ) {

            this.$rootScope = $rootScope;
            this.$route = $route;
            this.$routeParams = $routeParams;
            this.$location = $location;
            this.$modal = $modal;
            this.localStorageService = localStorageService;
            this.appConfig = appConfig;
            this.pomsEvents = pomsEvents;
            this.guiService = guiService;
            this.listService = listService;
            this.editorService = editorService;
            this.favoritesService = favoritesService;
            this.searchService = searchService;
            this.searchFactory = searchFactory;
            this.messageService = messageService;
            this.mediaService = mediaService;
            this.uploadService = UploadService;

            this.$scope = $scope;
            this.$document = $document;
            this.$window = $window;
            this.$timeout = $timeout;

            $scope.errors = [];

            this.init();
        }

        SelectorController.prototype = {

            loaded: false,

            editMedia: function ( media ) {

                this.$window.open( this.appConfig.apiHost +'/#/edit/'+ media.mid );
            },

            init: function () {
                this.guiService.boot( this ).then(
                    function () {

                        this.initSearch();

                        this.handleRouteChange();

                        this.handleErrors();

                    }.bind( this )
                );
            },

            handleErrors: function () {
                this.$rootScope.$on( this.pomsEvents.error, function ( e, error ) {
                    this.$scope.errors.push( error );
                }.bind( this ) );
            },

            handleRouteChange: function () {
                this.$scope.$on( '$routeChangeSuccess', function () {

                    var mid = this.$route.current.params.mid;
                    if ( mid ) {
                        this.$window.open( this.appConfig.apiHost +'/#/edit/'+ mid );
                    }
                }.bind( this ) );
            },

            initSearch: function () {

                var searchConfig = {
                    multiSelect: false
                };

                var mediaTypeFilter = /mediaType=([^&#]+)/.exec( this.$window.location.search );
                if ( mediaTypeFilter && mediaTypeFilter.length > 0 ) {

                    this.listService.getMediaTypes().then(

                        function ( types ) {

                            var restrictedTypes = [];

                            searchConfig.form = {
                                types: {
                                    restriction: mediaTypeFilter[ 1 ].split(',')
                                }
                            };

                            types.forEach( function ( type ) {
                                if ( searchConfig.form.types.restriction.indexOf( type.id ) > -1 ) {
                                    restrictedTypes.push( type );
                                }
                            } );

                            searchConfig.form.types.restriction = restrictedTypes;

                            this.$scope.search = this.searchService.newSearch( searchConfig );
                            this.loaded = true;

                        }.bind( this )
                    );

                } else {

                    this.$scope.search = this.searchService.newSearch( searchConfig );
                    this.loaded = true;
                }

                this.$scope.$on('selected', function( event, result ) {

                    var returnKey = /returnValue=([^&#]+)/.exec( this.$window.location.search );

                    if ( returnKey && returnKey.length > 0 ) {
                        returnKey = returnKey[ 1 ];
                    } else {
                        returnKey = 'mid';
                    }

                    if ( returnKey === 'data' ) {
                        result = result;
                    } else {
                        result = result[ returnKey ];
                    }

                    if ( this.$window.opener ) {

                        if ( ! document.all ) {
                            this.$window.opener.postMessage( result, '*' );
                        } else {
                            if ( this.$window.opener.postIEMessage ) {
                                this.$window.opener.postIEMessage( result, '*' );
                            }
                        }
                    } else {
                        console.log( 'Result: ', result );
                    }

                }.bind( this ) );
            }
        };

        return SelectorController;
    }())
] );
