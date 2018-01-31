angular.module( 'poms.media.controllers' ).controller( 'ConfirmController', [
    '$scope',
    '$modalInstance',
    'title',
    'message',
    'submit',
    'cancel',
    (function () {

        function ConfirmController ( $scope, $modalInstance, title, message, submit, cancel ) {

            $scope.title = title;
            $scope.message = message;
            $scope.submit = submit;
            $scope.cancel = cancel;

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;

        }

        ConfirmController.prototype = {

            cancel: function () {
                this.$modalInstance.dismiss();
            },

            submit: function () {
                this.$modalInstance.close();
            }

        };

        return ConfirmController;
    }())
] );