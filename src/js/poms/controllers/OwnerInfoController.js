angular.module( 'poms.media.controllers' ).controller( 'OwnerInfoController', [
    '$scope',
    '$uibModalInstance',
    (function () {
        function OwnerInfoController ( $scope, $uibModalInstance ) {
            this.$uibModalInstance = $uibModalInstance;
        }

        OwnerInfoController.prototype = {

            close : function () {
                this.$uibModalInstance.dismiss();
            }
        };

        return OwnerInfoController;
    }())
] );
