angular.module( 'poms.media.controllers' ).controller( 'PersonsController', [
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


        function PersonsController ( $scope, $q, $modal, pomsEvents, mediaService, editorService,  PomsEvents) {

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

        PersonsController.prototype = {

            addPerson: function(item){

                var personController;
                var personTemplate;
                if (! this.useGtaa) {
                    personController = 'PersonEditController';
                    personTemplate = 'edit/modal-person.html';
                } else {
                    personController = 'GtaaPersonEditController';
                    personTemplate = 'edit/modal-gtaa-person.html';
                }

                this.$scope.modalNew = this.$modal.open( {
                    controllerAs: 'controller',
                    controller:  personController,
                    templateUrl: personTemplate,
                    windowClass: 'modal-person',
                    resolve:{
                        personRoles: function () {
                            return this.options;
                        }.bind( this ),
                        media: function () {
                            return this.media;
                        }.bind( this ),
                        linkedPerson: function(){
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

            editPerson: function( item ){
                this.addPerson( item);
            },

            removePerson: function ( person ) {

                return this.mediaService.removePerson(  this.$scope.media, person ).then(
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

        return PersonsController;
    }())
] );
