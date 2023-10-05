angular.module( 'poms.search.controllers' ).controller( 'ModalSearchController', [
    '$scope',
    '$uibModalInstance',
    '$uibModal',
    'search',
    (function () {

        function ModalSearchController ( $scope, modalInstance, modal, search ) {
            this.$scope = $scope;
            this.modalInstance = modalInstance;
            this.$uibModal = modal;
            this.search = search;
            this.$scope.search = search;

            $scope.$on('selected', function(event, result) {
                modalInstance.close( [ result ] );
            });
        }

        ModalSearchController.prototype = {

            select: function () {
                this.modalInstance.close( this.search.selection);
            },

            cancel: function () {
                this.modalInstance.close();
            }
        };

        return ModalSearchController;
    }())
] );