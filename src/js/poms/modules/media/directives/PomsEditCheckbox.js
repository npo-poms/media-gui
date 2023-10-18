angular.module( 'poms.media.directives' )
    .directive( 'pomsEditCheckbox', ['EditService', '$q', function ( editService, $q ) {
        return {
            restrict: 'E',
            templateUrl: '/views/edit/editables/poms-checkbox.html',
            transclude: true,
            scope: {
                header: '@header',
                options: '@options',
                field: '@field',
                helpField : '@'
            },
            link: function ( $scope, element, attrs ) {

                const media = $scope.$parent.media;

                $scope.media = media;
                $scope.resetValue = angular.copy( $scope.media[$scope.field] );

                $scope.mayRead = function() {
                    return editService.hasReadPermission( media, $scope.field );
                }.bind(this);

                $scope.mayWrite = function() {
                    return editService.hasWritePermission( media, $scope.field );
                }.bind(this);

                $scope.keyEvent = function ( event ) {
                    if ( event.keyCode === 27 ) {
                        $scope.cancel();
                    }
                };

                $scope.save = function () {

                    $scope.waiting = true;

                    const deferred = $q.defer();

                    editService[$scope.field]( media, $scope.media[$scope.field] ).then(
                        function ( result ) {

                            angular.copy( result, media );

                            deferred.resolve( false );
                            $scope.waiting = false;

                            $scope.$emit( 'saved' );
                        },
                        function ( error ) {
                            $scope.media[$scope.field] = angular.copy( $scope.resetValue );
                            deferred.reject( error.message );
                            $scope.waiting = false;
                        }
                    );
                    return deferred.promise;

                };


            }
        };
    }] )


;
