
angular.module( 'poms.media.controllers' ).controller( 'AccountController', [
    '$scope',
    '$modalInstance',
    '$sce',
    '$window',
    'appConfig',
    'PomsEvents',
    'EditorService',
    'FavoritesService',
    'ListService',
    'localStorageService',
    'editor',
    (function () {

        function AccountController ( $scope, $modalInstance, $sce, $window, appConfig, PomsEvents, EditorService, FavoritesService, ListService, LocalStorageService, editor ) {

            $scope.editor = angular.copy( editor );
            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$sce = $sce;
            this.$window = $window;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.editorService = EditorService;
            this.localStorageService = LocalStorageService;
            this.favoritesService = FavoritesService;
            this.listService = ListService;

            this.$scope.saveconfirm = {};

            // we can only store a string in localStorage, no booleans
            this.$scope.saveconfirm.value = ( this.favoritesService.getSaveConfirm() === 'true' );

            this.ownerType = this.localStorageService.get("currentOwner") || "";
            this.init();
        }

        AccountController.prototype = {

            storeOwnerType: function() {
                this.localStorageService.set('currentOwner', this.ownerType);
            },

            cancel: function () {
                this.$modalInstance.dismiss();
            },

            init: function () {

                this.listService.getOwnerTypes().then(
                    function ( data ) {
                        data.unshift({'id': "", 'text': 'Geen keuze'});
                        this.allowedOwnerTypes = data;
                    }.bind( this ),
                    function ( error ) {
                        $scope.$emit( pomsEvents.error, error )
                    }.bind( this )
                );

                this.editorService.getAllowedBroadcasters().then(
                    function ( broadcasters ) {
                        this.allowedBroadcasters = broadcasters;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );

                this.editorService.getAllowedPortals().then(
                    function ( portals ) {
                        this.allowedPortals = portals;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );
            },

            remove: function ( collection, item ) {
                collection.some( function ( someItem, index ) {
                    if ( angular.equals( someItem, item ) ) {
                        collection.splice( index, 1 );
                        return true;
                    }
                } );
            },

            submit: function () {

                if ( this.$scope.accountForm.saveconfirm.$touched ) {
                    this.favoritesService.setSaveConfirm( this.$scope.saveconfirm.selected );
                }
                if (this.$scope.accountForm.radios && this.$scope.accountForm.radios.$dirty) {
                    this.$window.location.reload();
                }

                this.editorService.setAccount( this.$scope.editor ).then(
                    function ( editor ) {
                        this.$modalInstance.close( editor );
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );
            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }

        };

        return AccountController;
    }())
] );
