angular.module( 'poms.media.services' ).factory( 'EditFieldService', [ '$uibModal', '$q','FavoritesService',
    function ( $uibModal, $q, favoritesService ) {

        function EditFieldService () {
        }

        EditFieldService.prototype = {

            saveConfirm: function ( ) {

                var deferred = $q.defer();
                var confirmSkip = favoritesService.getSaveConfirm();

                // we have to check for a string, since localStorage cannot store booleans
                if ( confirmSkip == 'true' ){
                   deferred.resolve( true );
                }else {
                    var saveConfirmModal = $uibModal.open( {
                        controller: 'SaveConfirmController',
                        controllerAs: 'controller',
                        templateUrl: 'util/saveconfirm.html',
                        windowClass: "modal-confirm-save"
                    } );

                    saveConfirmModal.result.then(
                        function ( result ) {
                            if ( result ) {
                                deferred.resolve( true );
                            }else{
                                deferred.resolve( false  );
                            }
                        }.bind( this )
                    );
                }

                return deferred.promise;
            }

        };

        return new EditFieldService();
    }
] );
