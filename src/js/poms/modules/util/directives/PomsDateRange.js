angular.module( 'poms.util.directives' ).directive( 'daterangepicker',
    function () {
        return {
            restrict: 'A',
            controller: function ( $scope ) {
                $scope.openStartDate = function ( $event ) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    if ( typeof($scope.startdate) === 'undefined' ) {
                        $scope.startdate = {};
                    }

                    $scope.specialDate = undefined;
                    return $scope.startdate.open = true;
                };

                $scope.openStopDate = function ( $event ) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    if ( typeof($scope.stopdate) === 'undefined' ) {
                        $scope.stopdate = {};
                    }

                    $scope.specialDate = undefined;
                    return $scope.stopdate.open = true;

                };

                $scope.confirm = function ( data ) {
                    $scope.maxStart = data;
                };

                $scope.setMaxStart = function ( data ) {
                    $scope.maxStart = data;
                };

                $scope.setMinStop = function ( data ) {
                    $scope.minStop = data;
                };

            }
        };
    }
);