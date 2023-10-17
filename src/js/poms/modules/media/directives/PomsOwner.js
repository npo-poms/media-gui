angular.module( 'poms.media.directives' )
.directive( 'pomsOwner', ['$uibModal', 'MediaService', function ( $uibModal, mediaService) {
    return {
        restrict: 'E',
        replace: true,

        templateUrl: '/views/util/poms-owner.html',

        scope: {
            owner: '@',
            media: "="
        },

        controller: function ( $scope ) {

            $scope.viewOwnerData = function( owner, e ){

                e.preventDefault();
                e.stopPropagation();

                var modal = $uibModal.open( {
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
                    templateUrl: '/views/edit/modal-owner.html',
                    windowClass: "modal-owner"

                } );
            }

        }
    };
}] );
