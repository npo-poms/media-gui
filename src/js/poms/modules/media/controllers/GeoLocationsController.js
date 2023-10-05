angular.module( 'poms.media.controllers' ).controller( 'GeoLocationsController', [
    '$scope',
    '$q',
    '$uibModal',
    'PomsEvents',
    'MediaService',
    'EditorService',
    'GTAAService',
    ( function () {

        function load ( scope, pomsEvents, mediaService, media, dest ) {
            mediaService.getGeoLocations( media ).then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    scope.$emit( pomsEvents.error, error )
                }
            )
        }
        function GeoLocationsController ( $scope, $q, $uibModal, pomsEvents, mediaService, editorService, gtaaService) {

            this.items = [];
            this.$scope = $scope;
            this.$q = $q;
            this.$uibModal = $uibModal;

            this.media = $scope.media;
            this.pomsEvents = pomsEvents;

            this.mediaService = mediaService;
            this.editorService = editorService;
            this.gtaaService = gtaaService;


            this.mayWrite = function() {
                return mediaService.hasWritePermission( $scope.media, $scope.permission );
            }.bind(this);
            this.mayRead = function() {
                return mediaService.hasReadPermission( $scope.media, $scope.permission );
            }.bind(this);
            this.currentOwnerType = editorService.getCurrentOwnerType();

            load( $scope, this.pomsEvents, this.mediaService, this.media, this.items );

            $scope.$on( pomsEvents.externalChange, function ( e, mid ) {
                if ( mid === $scope.media.mid ) {
                    this.load();
                }
            }.bind( this ) );

        }

        GeoLocationsController.prototype = {

            editGeoLocation: function (item) {
                this.gtaaService.modal(
                    "Zoek een geolocatie in GTAA",
                    "geographicname",
                    item,
                    function ( concept, role ) {
                        var parsedGeoLocation = this.parseGeoLocation(concept, role);
                        parsedGeoLocation.id = item ? item.id : null;
                        this.saveGeoLocation(parsedGeoLocation);
                    }.bind(this));
            },

            addGeoLocation: function ( item ) {
                this.editGeoLocation( item );
            },

            saveGeoLocation: function (parsedGeoLocation) {
                if (parsedGeoLocation.role) {
                    this.mediaService.addGeoLocation(this.media, parsedGeoLocation).then(
                        function ( data ) {
                            angular.copy(data, this.items);
                        }.bind(this),
                        function( error) {
                            this.errorHandler(error);
                        }.bind(this)
                    )
                }
            },

            removeOverride: function () {
                this.mediaService.removeGeoLocations(this.media).then(
                    function (data) {
                        angular.copy(data, this.items);
                    }.bind(this),
                    function( error) {
                        this.errorHandler(error);
                    }.bind(this)
                )
            },

            errorHandler: function(error) {
                if (error.violations) {
                    for (var violation in  error.violations) {
                        this.$scope.errorText = error.violations[violation];
                        break;
                    }
                } else {
                    this.$scope.$emit(this.pomsEvents.error, error);
                }
            },

            parseGeoLocation: function (concept, role) {
                return {
                    name: concept.name || '',
                    scopeNotes: concept.scopeNotes,
                    gtaaStatus: concept.status || '',
                    gtaaUri: concept.id || '',
                    role: role ? role.name : null
                };
            },

            removeGeoLocation: function ( geoLocation ) {
                return this.mediaService.removeGeoLocation( this.$scope.media, geoLocation ).then(
                    function (data) {
                        angular.copy( data, this.items);
                        return true
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) ).finally(
                    function () {
                        load( this.$scope, this.pomsEvents, this.mediaService, this.media, this.items );
                        return true;
                    }.bind( this )
                );
            }


        };

        return GeoLocationsController;
    }() )
] );
