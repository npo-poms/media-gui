angular.module( 'poms.gtaa.controllers' ).controller( 'GtaaConnectorController', [
    '$rootScope',
    '$scope',
    '$route',
    '$location',
    '$document',
    '$window',
    '$timeout',
    'localStorageService',
    'appConfig',
    'PomsEvents',
    'GuiService',
    'ListService',
    'EditorService',
    'MessageService',
    'GtaaService',
    (function () {

        function GtaaConnectorController ( $rootScope,
                                 $scope,
                                 $route,
                                 $location,
                                 $document,
                                 $window,
                                 $timeout,
                                 localStorageService,
                                 appConfig,
                                 pomsEvents,
                                 guiService,
                                 listService,
                                 editorService,
                                 messageService,
                                 gtaaService ) {

            this.$rootScope = $rootScope;
            this.$route = $route;
            this.$location = $location;
            this.localStorageService = localStorageService;
            this.appConfig = appConfig;
            this.pomsEvents = pomsEvents;
            this.guiService = guiService;
            this.listService = listService;
            this.editorService = editorService;
            this.messageService = messageService;

            this.gtaaService = gtaaService;

            // TODO remove unnecessary dependencies


            this.$scope = $scope;
            this.$scope.loaded = false;
            this.$document = $document;
            this.$window = $window;

            this.$timeout = $timeout;
            $scope.errors = [];

            this.init();
        }

        GtaaConnectorController.prototype = {

            handleErrors: function () {
                this.$rootScope.$on( this.pomsEvents.error, function ( e, error ) {
                    this.$scope.errors.push( error );
                }.bind( this ) );
            },

            handleRouteChange: function () {
                this.$scope.$on( '$routeChangeSuccess', function () {

                }.bind( this ) );
            },

            init: function () {

                this.guiService.boot( this ).then(
                    function () {

                        this.initConnector();

                        this.handleRouteChange();

                        this.handleErrors();

                    }.bind( this )
                );
            },

            initConnector: function () {

                var givenName;
                var familyName;
                var gtaaId;
                var linkedPerson;
                var origin;

                var givenNameParam = /givenName=([^&#]+)/.exec( this.$window.location.search );
                if ( givenNameParam && givenNameParam.length > 0 ) {
                    givenName = decodeURIComponent( givenNameParam.pop() );

                    if ( ! this.isValidInput( givenName ) ) {
                        delete givenName;
                    }
                }

                var familyNameParam = /familyName=([^&#]+)/.exec( this.$window.location.search );
                if ( familyNameParam && familyNameParam.length > 0 ) {
                    familyName = decodeURIComponent( familyNameParam.pop() );

                    if ( ! this.isValidInput( familyName ) ) {
                        delete familyName;
                    }
                }

                var gtaaIdParam = /gtaaId=([^&#]+)/.exec( this.$window.location.search );
                if ( gtaaIdParam && gtaaIdParam.length > 0 ) {
                    gtaaId = decodeURIComponent( gtaaIdParam.pop() );

                    if ( ! this.isValidInput( gtaaId ) ) {
                        delete gtaaId;
                    }
                }

                var originParam = /origin=([^&#]+)/.exec( this.$window.location.search );
                if ( originParam && originParam.length > 0 ) {
                    origin = decodeURIComponent( originParam.pop() );

                    if ( ! this.isValidInput( origin ) ) {
                        delete origin;
                    }
                }

                // TODO if only a GTAA ID is given we should have some functionality to get
                // the accompanying name data.

                if ( givenName || familyName ) {
                    linkedPerson = {
                        givenName: givenName || '',
                        familyName: familyName || ''
                    };

                    this.$scope.linkedPerson = linkedPerson;
                }

                if ( gtaaId ) {
                    this.$scope.gtaaId = gtaaId;
                }

                if ( origin ) {
                    this.$scope.origin = origin;
                }

                this.$scope.loaded = true;

                this.$scope.$on('selected', function( event, result ) {

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

                this.$scope.$on('cancel', function( event, result ) {

                    if ( this.$window.opener ) {

                        if ( ! document.all ) {
                            this.$window.opener.postMessage( result, '*' );
                        } else {
                            if ( this.$window.opener.postIEMessage ) {
                                this.$window.opener.postIEMessage( result, '*' );
                            }
                        }
                    } else {
                        console.log( 'Cancelled: ', result );
                    }

                }.bind( this ) );
            },

            isValidInput: function ( input ) {
                return /^[\w\s'&:\/\.]+$/i.test( decodeURIComponent( input ) );
            }
        };

        return GtaaConnectorController;
    }())
] );
