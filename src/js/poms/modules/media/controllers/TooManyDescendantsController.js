angular.module( 'poms.media.controllers' ).controller( 'TooManyDescendantsController', [
    '$modalInstance',
    'type',
    'message',
    'max',
    'count',
    (function () {

        function TooManyDescendantsController ( $modalInstance, type, message, max, count ) {

            this.$modalInstance = $modalInstance;
            this.type = type;
            this.message = message;
            this.max = max;
            this.count = count;

        }

        TooManyDescendantsController.prototype = {

            close: function () {
                this.$modalInstance.dismiss();
            }

        };

        return TooManyDescendantsController;
    }())
] );