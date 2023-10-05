angular.module( 'poms.media.controllers' ).controller( 'BulkUpdateController', [
    '$scope',
    '$uibModalInstance',
    'PomsEvents',
    'ListService',
    'MediaService',
    'BulkUpdateService',
    'media',
    (function () {

        function BulkUpdateController ( $scope, $uibModalInstance, PomsEvents, ListService, MediaService, BulkUpdateService, media ) {

            this.pomsEvents = PomsEvents;
            this.listService = ListService;
            this.mediaService = MediaService;
            this.bulkUpdateService = BulkUpdateService;
            this.steps = 3;

            this.$uibModalInstance = $uibModalInstance;
            this.$scope = $scope;

            $scope.step = 0;
            $scope.media = media;
            $scope.mayWrite = this.hasWritePermission( 'media' );
            $scope.tags = [];

            var mids = [];
            angular.forEach( media, function ( item, index ) {
                mids.push( item.mid );
            } );
            $scope.update = {mids: mids};

            $scope.erase = {};
        }


        BulkUpdateController.prototype = {

            buildUpdate: function () {

                var update = angular.copy( this.$scope.update ),
                    erase = angular.copy( this.$scope.erase ),
                    hasUpdatedFields = false;

                this.$scope.violations = undefined;

                angular.forEach( update, function ( item, name ) {
                    if ( item === '' ) {
                        if ( ! erase[name] ) {
                            update[name] = undefined;
                        }
                    } else if ( name !== 'mids' && ! hasUpdatedFields ) {
                        hasUpdatedFields = true;
                    }

                } );

                angular.forEach( erase, function ( item, name ) {
                    if ( item === true ) {
                        update[name] = '';
                    }
                } );


                return {'update': update, 'erase': erase, 'hasUpdatedFields': hasUpdatedFields}
            },

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$uibModalInstance.dismiss();
            },

            confirm: function () {
                this.$scope.step = this.steps;
                this.showUpdate();
            },


            getTags: function ( text ) {
                if ( ! text ) {
                    return;
                }

                this.listService.getTags( text ).then(
                    function ( tags ) {
                        this.$scope.tags = tags;
                    }.bind( this )
                );
            },

            hasNext: function () {
                return this.$scope.step < this.steps - 1 && ! this.$scope.violations;
            },

            hasSave: function () {
                var hasUpdate = false;

                angular.forEach( this.$scope.update, function ( item, name ) {
                    if ( name === 'mainTitle' ) {
                        if ( item !== '' ) {
                            hasUpdate = true;
                        }
                    }

                    if ( name !== 'mids' ) {
                        hasUpdate = true;
                    }
                }.bind( this ) );

                return hasUpdate && ! this.$scope.violations && this.$scope.step < this.steps;
            },

            hasPrevious: function () {
                return this.$scope.step > 0 && ! this.$scope.violations;
            },

            hasWritePermission: function ( permission ) {
                for ( var i = 0; i < this.$scope.media.length; i ++ ) {
                    var media = this.$scope.media[i];
                    if ( ! this.mediaService.hasWritePermission( media, permission ) ) {
                        return false;
                    }
                }

                return true;
            },

            next: function () {
                if ( this.hasNext() ) {
                    this.$scope.step ++;
                }
            },

            previous: function () {
                if ( this.hasPrevious() ) {
                    this.$scope.step --;
                }
            },


            showUpdate: function () {
                this.$scope.displayUpdate = this.buildUpdate();
            },

            submit: function ( validate ) {
                var update = this.$scope.update,
                    erase = this.$scope.erase;

                this.$scope.violations = undefined;

                angular.forEach( update, function ( item, name ) {
                    if ( item === '' ) {
                        if ( ! erase[name] ) {
                            update[name] = undefined;
                        }
                    }
                } );

                angular.forEach( erase, function ( item, name ) {
                    if ( item == true ) {
                        update[name] = '';
                    }
                } );

                this.bulkUpdateService.update( update, validate )
                    .then( function ( answer ) {
                        if ( ! validate ) {
                            this.$uibModalInstance.close( answer );
                        }
                    }.bind( this ),
                    function ( error ) {
                        if ( error.status === 400 && error.violations ) {
                            this.$scope.violations = error.violations;
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this )
                );
            },

            validate: function () {
                this.submit( true );
            }

        };

        return BulkUpdateController;
    }())
] );