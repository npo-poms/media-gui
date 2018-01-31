angular.module( 'poms.media.directives' )
.directive( 'pomsOwner', ['$modal', 'MediaService', function ( $modal, mediaService) {
    return {
        restrict: 'E',
        replace: true,

        templateUrl: 'util/poms-owner.html',

        scope: {
            owner: '@',
            media: "="
        },

        controller: function ( $scope ) {

            $scope.viewOwnerData = function( owner, e ){

                e.preventDefault();
                e.stopPropagation();

                var modal = $modal.open( {
                    scope: this.$scope,
                    resolve: {
                        title: function () {
                            return 'Bron: ' + $scope.owner;
                        },
                        ownerData: function () {
                            return mediaService.getOwnerData( $scope.media, $scope.owner )
                        }.bind( this ),
                        owner: function () {
                            return $scope.owner;
                        }
                    },
                    controller: 'OwnersController',
                    controllerAs: 'ownersController',
                    templateUrl: 'edit/modal-owner.html',
                    windowClass: "modal-owner"

                } );
            }

        }
    };
}] );