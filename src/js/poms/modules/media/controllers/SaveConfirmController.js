angular.module('poms.media.controllers').controller('SaveConfirmController', [
    '$scope',
    '$uibModalInstance',
    'FavoritesService',
    (function () {

        function SaveConfirmController ( $scope, modalInstance, favoritesService) {
            this.$scope = $scope;
            this.modalInstance = modalInstance;
            this.favoritesService = favoritesService;
            this.$scope.saveconfirm = {};
        }

        SaveConfirmController.prototype = {

            save: function () {
                this.favoritesService.setSaveConfirm( this.$scope.saveconfirm.selected );
                this.modalInstance.close( true );
            },

            cancel: function () {
                this.favoritesService.setSaveConfirm( this.$scope.saveconfirm.selected );
                this.modalInstance.close( false );
            }
        };

        return SaveConfirmController;
    }())
]);