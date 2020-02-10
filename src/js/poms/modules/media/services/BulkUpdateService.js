angular.module( 'poms.media.services' ).factory( 'BulkUpdateService', [
    '$q',
    '$http',
    '$modal',
    'appConfig',
    function ($q, $http, $modal, appConfig ) {
        var baseUrl = appConfig.apiHost + '/gui/bulk';

        function BulkUpdateService () {
        }

        BulkUpdateService.prototype = {

            start: function ( selection ) {
                $modal.open( {
                    controller: 'BulkUpdateController',
                    controllerAs: 'bulkUpdateController',
                    templateUrl: 'media/modal-bulk-update.html',
                    windowClass: 'modal-form',
                    resolve: {
                        media: function () {
                            return selection;
                        }.bind(this)
                    }
                } );            },

            update: function ( update , validate) {
                var deferred = $q.defer();

                $http.post( baseUrl, update, {params: {validate: validate || false}} )
                        .success( function ( answer ) {
                            deferred.resolve( answer );
                        } )
                        .error( function ( error ) {
                            deferred.reject( error );
                        } );

                return deferred.promise;
            }

        };

        return new BulkUpdateService();
    }
] );
