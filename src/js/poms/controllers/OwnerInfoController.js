angular.module( 'poms.media.controllers' ).controller( 'OwnerInfoController', [
    '$scope',
    '$modalInstance',
    (function () {

        function OwnerInfoController ( $scope, $modalInstance ) {

            this.$modalInstance = $modalInstance;
        }

        OwnerInfoController.prototype = {

            close : function () {
                this.$modalInstance.dismiss();
            }
        };

        return OwnerInfoController;
    }())
] );
