angular.module( 'poms.media.controllers' ).controller( 'ModalIFrameController', [
    '$scope',
    '$uibModalInstance',
    "title",
    "callback",
    (function () {

        function ModalIFrameController( $scope, $uibModalInstance, title, callback) {
            this.$scope = $scope;
            this.$scope.title = title;
            this.$uibModalInstance = $uibModalInstance;
            this.inited = false;
            this.callbacks = [];
            if (callback) {
                this.callbacks.push(callback);
            }
        }

        ModalIFrameController.prototype = {
            mayClose : true,
            init : function () {
                this.inited = true;
                this.callbacks.forEach(function (cb) { cb() });
            },

            onInit: function(callback) {
                if (this.inited) {
                    callback();
                } else {
                    this.callbacks.push(callback);
                }
            },

            cancel : function () {
                if ( this.mayClose ) {
                    this.$uibModalInstance.dismiss( 'canceled' );
                }
            }

        };

        return ModalIFrameController;
    }())
] );
