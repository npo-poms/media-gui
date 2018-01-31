angular.module( 'poms.screen.controllers' ).controller( 'AddScreenController', [
    '$scope',
    '$modalInstance',
    'appConfig',
    'PomsEvents',
    'ScreenService',
    (function () {

        function isValid ( screen ) {
            return screen.title !== undefined &&
                screen.title !== '' &&
                screen.description != undefined &&
                screen.description !== ''
        }

        function AddScreenController ( $scope, $modalInstance, appConfig, PomsEvents, ScreenService ) {

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.screenService = ScreenService;

            this.$scope.required = [
                {'id': 'title', 'text': 'Titel'},
                {'id': 'description', 'text': 'Beschrijving'},
                {'id': 'url', 'text': 'url'}
            ];

            this.$scope.screenFormValid = false;

            this.$scope.$watchCollection( 'screen', function ( newValue ) {
                if ( newValue ) {
                    this.$scope.screenFormValid = isValid( newValue );
                }
            }.bind( this ) );

        }

        AddScreenController.prototype = {


            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            },


            save: function () {

                this.screenService.create( this.$scope.screen ).then(
                    function ( result ) {
                        this.$modalInstance.close();
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );

            }

        };

        return AddScreenController;
    }())
] );