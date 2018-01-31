angular.module( 'poms.admin.controllers' ).controller( 'BroadcastersController', [
    '$scope',
    '$modalInstance',
    'PomsEvents',
    'AdminService',
    (function () {

        function BroadcastersController ( $scope, $modalInstance, PomsEvents, AdminService ) {

            this.pomsEvents = PomsEvents;
            this.adminService = AdminService;

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;

            this.init();
        }

        BroadcastersController.prototype = {

            addBroadcaster: function () {
                this.$scope.inserted = {};
                this.$scope.broadcasters.splice( 0, 0 ,this.$scope.inserted );
            },

            cancel: function ( index, rowform ) {
                var broadcaster = this.$scope.broadcasters[index];
                if ( broadcaster == this.$scope.inserted ) {
                    this.$scope.inserted = undefined;
                    this.$scope.broadcasters.splice( index, 1 );
                } else {
                    broadcaster.violations = undefined;
                }

                rowform.$cancel();
            },

            close: function () {
                this.$modalInstance.dismiss();
            },

            edit: function ( rowform ) {
                rowform.$show();
            },

            init: function(){
                this.adminService.getBroadcasters().then(
                    function ( broadcasters ) {
                        this.$scope.broadcasters = broadcasters || [];
                    }.bind(this),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind(this)
                );
            },

            remove : function( broadcaster ){

                return this.adminService.removeBroadcaster( broadcaster ).then(
                    function ( broadcaster ) {
                        this.init();
                        return true;
                    }.bind( this ),
                    function ( error ) {
                        if ( error.status == 400 && error.violations ) {
                            source.violations = error.violations;
                            return 'Errors';
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this ) )
                    .finally( function () {
                        this.waiting = false;
                    }.bind( this ) );
            },



            submit: function ( index, data ) {
                var source = this.$scope.broadcasters[index];
                if ( source ) {
                    source.violations = undefined;

                    if ( source.id ) {
                        angular.extend( data, {id: source.id} )
                    }
                }

                this.waiting = true;

                return this.adminService.saveBroadcaster( data ).then(
                    function ( broadcaster ) {
                        angular.copy( broadcaster, source );
                        return true;
                    },
                    function ( error ) {
                        if ( error.status == 400 && error.violations ) {
                            source.violations = error.violations;
                            return 'Errors';
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this ) )
                    .finally( function () {
                        this.waiting = false;
                    }.bind( this ) );
            }

        };

        return BroadcastersController;
    }())
] );
