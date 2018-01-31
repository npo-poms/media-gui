angular.module( 'poms.messages.controllers' )
    .controller( 'MessageController', [
        '$scope',
        'MessageService',
        (function () {

            function MessageController ( $scope, MessageService ) {

                this.$scope = $scope;
                this.messageService = MessageService;

            }

            MessageController.prototype = {

                init: function () {
                    this.$scope.messages = [];

                    this.messageService.receive()
                        .then( null, null, function ( message ) {
                            this.$scope.messages.push( message );
                        }.bind( this ) );
                }
            };


            return MessageController;
        }())
    ] );