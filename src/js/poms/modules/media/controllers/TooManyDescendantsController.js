angular.module( 'poms.media.controllers' ).controller( 'TooManyDescendantsController', [
    '$uibModalInstance',
    'type',
    'message',
    'max',
    'count',
    (function () {

        function TooManyDescendantsController ( $uibModalInstance, type, message, max, count ) {

            this.$uibModalInstance = $uibModalInstance;
            this.type = type;
            this.message = message;
            this.max = max;
            this.count = count;

        }

        TooManyDescendantsController.prototype = {

            close: function () {
                this.$uibModalInstance.dismiss();
            }

        };

        return TooManyDescendantsController;
    }())
] );