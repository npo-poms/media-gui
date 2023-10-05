angular.module( 'poms.media.controllers' ).controller( 'ConfirmController', [
    '$scope',
    '$uibModalInstance',
    'title',
    'message',
    'submit',
    'cancel',
    (function () {

        function ConfirmController ( $scope, $uibModalInstance, title, message, submit, cancel ) {

            $scope.title = title;
            $scope.message = message;
            $scope.submit = submit;
            $scope.cancel = cancel;

            this.$scope = $scope;
            this.$uibModalInstance = $uibModalInstance;

        }

        ConfirmController.prototype = {

            cancel: function () {
                this.$uibModalInstance.dismiss();
            },

            submit: function () {
                this.$uibModalInstance.close();
            }

        };

        return ConfirmController;
    }())
] );