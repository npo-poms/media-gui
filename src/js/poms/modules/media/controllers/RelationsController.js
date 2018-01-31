angular.module( 'poms.media.controllers' ).controller( 'RelationsController', [
    '$scope',
    '$modal',
    'PomsEvents',
    'MediaService',
    'ListService',
    (function () {

        function RelationsController ( $scope, $modal, PomsEvents, MediaService, ListService ) {

            this.$scope = $scope;
            this.$modal = $modal;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.listService = ListService;
            this.mayWrite = MediaService.hasWritePermission( $scope.media, 'relations' );

            this.listService.getRelations().then(
                function ( data ) {
                    this.$scope.types = data;
                }.bind( this ),
                function (error) {
                    this.$scope.types = [];
                    this.$scope.$emit( this.pomsEvents.error, error );
                }.bind( this )
            );

            this.load();
        }

        RelationsController.prototype = {

            load: function () {
                this.waiting = true;
                this.$scope.$emit( this.pomsEvents.loaded, {'section': 'relations', 'value': false } );

                this.mediaService.getRelations( this.$scope.media )
                    .then( function ( relations ) {
                        this.relations = relations;
                    }.bind( this ), function ( error ) {
                        this.$scope.$emit( 'error', error )
                    }.bind( this ) )
                    .finally(
                        function(){
                            this.waiting = false;
                            this.$scope.$emit( this.pomsEvents.loaded, {'section': 'relations', 'value': true } );
                        }.bind(this)
                    );
            },


            editRelation: function( relation ){

                var editMode = true;

                if ( !relation ){
                    relation = {};
                    editMode = false;
                }

                var modal = this.$modal.open( {
                    controller: 'RelationEditController',
                    controllerAs: 'controller',
                    templateUrl: 'edit/modal-edit-relation.html',
                    windowClass: 'modal-form',
                    resolve: {
                        media: function () {
                            return this.$scope.media;
                        }.bind( this ),
                        relation: function () {
                            return relation;
                        },
                        types: function(){
                            return this.$scope.types;
                        }.bind(this),
                        edit: function () {
                            return editMode;
                        }
                    }
                } );

                modal.result.then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media )
                        this.load();
                    }.bind( this )
                );

            },


            remove: function ( index ) {
                var source = this.relations[index];
                return this.mediaService.removeRelation( this.$scope.media, source ).then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media );
                        this.load();
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) )
                    .finally(
                        function(){
                            this.waiting = false;
                            this.$scope.$emit( this.pomsEvents.loaded, {'section': 'relations', 'value': true } );
                        }.bind(this)
                    );

            },

            addRelation: function () {
                this.editRelation();
            }

        };

        return RelationsController;
    }())
] );