angular.module( 'poms.media.controllers' ).controller( 'GeoLocationsController', [
    '$scope',
    '$q',
    '$modal',
    'PomsEvents',
    'MediaService',
    'EditorService',
    'PomsEvents',
    (function () {

        function load ( scope, pomsEvents, dest ) {
            scope.load().then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    scope.$emit( pomsEvents.error, error )
                }
            )
        }


        function GeoLocationsController ( $scope, $q, $modal, pomsEvents, mediaService, editorService,  PomsEvents) {

            this.items = [];

            this.options = [];

            this.$scope = $scope;
            this.$q = $q;
            this.$modal = $modal;

            this.media = $scope.media;
            this.pomsEvents = pomsEvents;

            this.mediaService = mediaService;
            this.editorService = editorService;

            this.mayWrite = mediaService.hasWritePermission( $scope.media, $scope.permission );
            this.mayRead = mediaService.hasReadPermission( $scope.media, $scope.permission );

            this.maySkipGtaa = this.editorService.currentEditorHasRoles(['SUPERADMIN', 'ADMIN']);
            this.useGtaa = true;

            load( $scope, this.pomsEvents, this.items );

            $scope.options().then(
                function ( data ) {
                    if ( data.length < 1 ) {
                        this.mayWrite = false;
                    } else {
                        angular.copy( data, this.options );
                    }
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( this.pomsEvents.error, error )
                }.bind( this )
            );

            $scope.$on(PomsEvents.externalChange, function(e, mid) {
                 if(mid === $scope.media.mid) {
                    this.load();
                }
            }.bind(this));

        }

        GeoLocationsController.prototype = {

            addGeoLocation: function(item){

                var geoLocationController;
                var geoLocationTemplate;
                geoLocationController = 'GtaaGeoLocationEditController';
                geoLocationTemplate = 'edit/modal-gtaa-geolocation2.html';

                this.$scope.modalNew = this.$modal.open( {
                    controllerAs: 'controller',
                    controller:  geoLocationController,
                    templateUrl: geoLocationTemplate,
                    windowClass: 'modal-geolocation',
                    resolve:{
                        roles: function () {
                            return this.options;
                        }.bind( this ),
                        media: function () {
                            return this.media;
                        }.bind( this ),
                        linkedGeoLocation: function(){
                            return angular.copy( item );
                        },
                        create: function(){
                            return ( item ? false : true)
                        }
                    }
                } );

                this.$scope.modalNew.result.then(
                    function ( result ) {
                        load( this.$scope, this.pomsEvents, this.items );
                    }.bind( this ),
                    function ( ) {
                        load( this.$scope, this.pomsEvents, this.items );
                    }.bind( this ) );

            },

            editGeoLocation: function( item ){
                this.addGeoLocation( item);
            },

            removeGeoLocation: function ( geoLocation ) {

                return this.mediaService.removeGeoLocation(  this.$scope.media, geoLocation ).then(
                    function (  ) {
                        load( this.$scope, this.pomsEvents, this.items );
                        return true
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) ).finally(
                    function(){
                        load( this.$scope, this.pomsEvents, this.items );
                        return true;
                    }.bind(this)
                );
            }

        };

        return GeoLocationsController;
    }())
] );
