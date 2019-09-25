angular.module( 'poms.media.controllers' ).controller( 'ModalIFrameController', [
    '$scope',
    '$modalInstance',
    "title",
    "callback",
    (function () {

        function ModalIFrameController( $scope, $modalInstance, title, callback) {
            this.$scope = $scope;
            this.$scope.title = title;
            this.$modalInstance = $modalInstance;
            this.inited = false;
            this.callbacks = [];
            if (callback) {
                this.callbacks.push(callback);
            }
        }

        ModalIFrameController.prototype = {
            mayClose : true,
            init : function () {
                console.log("Initiing with {}", this.callbacks);
                this.inited = true;
                this.callbacks.forEach(function (cb) { cb() });
            },

            onInit: function(callback) {
                if (this.inited) {
                    callback();
                } else {
                    callbacks.push(callback);
                }
            },

            cancel : function () {
                if ( this.mayClose ) {
                    this.$modalInstance.dismiss( 'canceled' );
                }
            }

        };

        return ModalIFrameController;
    }())
] );
