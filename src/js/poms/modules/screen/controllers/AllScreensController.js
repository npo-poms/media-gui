angular.module( 'poms.screen.controllers' ).controller( 'AllScreensController', [
    '$scope',
    '$modal',
    'appConfig',
    'PomsEvents',
    'ScreenService',
    (function () {

        function AllScreensController ( $scope, $modal, appConfig, PomsEvents, ScreenService ) {
            this.$scope = $scope;
            this.$modal = $modal;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.screenService = ScreenService;

            this.screenService.loadAll().then(
                function ( screens ) {
                    $scope.screens = screens;
                },
                function ( error ) {
                    $scope.$emit( this.pomsEvents.error, error );
                }.bind( this )
            );

            this.load();

        }

        AllScreensController.prototype = {

            load: function () {

                this.screenService.loadAll().then(
                    function ( screens ) {
                        this.$scope.screens = screens;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );

            },


            addScreen: function () {

                var modal = this.$modal.open( {
                    controller: 'AddScreenController',
                    controllerAs: 'addScreenController',
                    templateUrl: 'screen/modal-screen.html',
                    windowClass: 'modal-screen'
                } );

                modal.result.then(
                    function () {
                        this.load();
                    }.bind( this )
                );
            },

            editScreen: function ( screen ) {
                return '#/screen/' + screen.sid;
            },


            removeScreen: function ( screen ) {

                this.screenService.remove( screen ).then(
                    function ( result ) {
                        angular.copy( result, screen );
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );
            }

        };

        return AllScreensController;
    }())
] );