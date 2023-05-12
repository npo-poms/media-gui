/**
 * This is the implementation of the CMS Selector.
 */

angular.module( 'poms.controllers' ).controller( 'SelectorController', [
    '$q',
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
    'MediaService',
    (function () {

        function SelectorController (
            $q,
            $rootScope,
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
            mediaService  ) {
            
            this.$q = $q;
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
            this.mediaService = mediaService;
           

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
                    multiSelect: false,
                    form: {
                        properties: {
                            strict: true,
                            restriction: []
                            
                        }
                    }
                    
                };

                var urlSearchParams = new URLSearchParams(window.location.search);
                if (urlSearchParams.get('writable') === 'true') {
                    searchConfig.form.properties.restriction.push(
                        {
                            id : 'writable',
                            text : 'Mag schrijven'
                        }
                    );
                }
                var promises = [];
                if (urlSearchParams.get('avType')) {
                    promises.push(this.listService.getAvTypes().then(function(t) {
                        searchConfig.form.avType = t.find(av => av.id === urlSearchParams.get('avType'));
                    }.bind(this)));
                }
                var mediaTypeFilter = urlSearchParams.get('mediaType');
                if ( mediaTypeFilter && mediaTypeFilter.length > 0 ) {
                    promises.push(this.listService.getMediaTypes().then(
                        function ( types ) {
                            this.types = types;
                            var restrictedTypes = [];
                            searchConfig.form.types =  {
                                restriction: mediaTypeFilter.split(',')
                            }
                            types.forEach( function ( type ) {
                                if ( searchConfig.form.types.restriction.indexOf( type.id ) > -1 ) {
                                    restrictedTypes.push( type );
                                }
                            } );
                            searchConfig.form.types.restriction = restrictedTypes;
                        }.bind(this)
                    ));
                }
                /// cant use Promise.all. Angularjs has its own promises!
                this.$q.all(promises).then(function() {
                    this.$scope.search = this.searchService.newSearch(searchConfig);
                    this.loaded= true;
                }.bind(this));

                this.$scope.$on('selected', function( event, result ) {
                    var urlSearchParams = new URLSearchParams(window.location.search);
                    var returnKey = urlSearchParams.get("returnValue");
                    
                    if ( returnKey && returnKey.length > 0 ) {
                        returnKey = returnKey[ 1 ];
                    } else {
                        returnKey = 'mid';
                    }
                    
                    if ( returnKey !== 'data' ) {
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
