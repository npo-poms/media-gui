angular.module( 'poms.media.services' ).factory( 'BulkUpdateService', [
    '$q',
    '$http',
    '$uibModal',
    'appConfig',
    function ($q, $http, $uibModal, appConfig ) {
        const baseUrl = appConfig.apiHost + '/gui/bulk';

        function BulkUpdateService () {
        }

        BulkUpdateService.prototype = {

            start: function ( selection ) {
                $uibModal.open( {
                    controller: 'BulkUpdateController',
                    controllerAs: 'bulkUpdateController',
                    templateUrl: '/views/media/modal-bulk-update.html',
                    windowClass: 'modal-form',
                    resolve: {
                        media: function () {
                            return selection;
                        }.bind(this)
                    }
                } );            },

            update: function ( update , validate) {
                const deferred = $q.defer();

                $http.post( baseUrl, update, {params: {validate: validate || false}} ).then(
                    function ( response ) {
                        deferred.resolve( response.data );
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
