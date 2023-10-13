angular.module( 'poms.media.services' ).factory( 'BulkUpdateService', [
    '$q',
    '$http',
    '$uibModal',
    'appConfig',
    function ($q, $http, $uibModal, appConfig ) {
        var baseUrl = appConfig.apiHost + '/gui/bulk';

        function BulkUpdateService () {
        }

        BulkUpdateService.prototype = {

            start: function ( selection ) {
                $uibModal.open( {
                    controller: 'BulkUpdateController',
                    controllerAs: 'bulkUpdateController',
                    templateUrl: 'views/media/modal-bulk-update.html',
                    windowClass: 'modal-form',
                    resolve: {
                        media: function () {
                            return selection;
                        }.bind(this)
                    }
                } );            },

            update: function ( update , validate) {
                var deferred = $q.defer();

                $http.post( baseUrl, update, {params: {validate: validate || false}} ).then(
                    function ( answer ) {
                        deferred.resolve( answer );
                    },
                    function ( error ) {
                        deferred.reject( error );
                    }
                );

                return deferred.promise;
            }

        };

        return new BulkUpdateService();
    }
] );
