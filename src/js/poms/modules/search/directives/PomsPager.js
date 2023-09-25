angular.module( 'poms.search.directives' ).directive( 'pomsPager', function ( $log ) {
    return {
        restrict: 'E',
        templateUrl: 'search/pager.html',
        scope: {
            searchResults: '=searchresults',  // allows data to be passed into directive from controller scope
            submit: '&onsearch'
        },

        link: function ( $scope ) {

            $scope.max = 0;
            $scope.total = 0;
            $scope.offset = 0;
            $scope.currentPage = 0;
            $scope.waiting = true;

            $scope.$watch( 'searchResults', function ( newValue, oldValue ) {

                if ( ! angular.equals( newValue, oldValue ) ) {
                    // two modes. Either the backend returns with offset, or with previous/next pages
                    $scope.total = newValue.total;                    
                    if ( newValue.previousPages === null) {
                        $scope.max = newValue.max;
                        $scope.offset = newValue.offset;
                        $scope.currentPage = ($scope.offset / $scope.max) + 1;
                        $scope.totalPages = Math.floor($scope.total / $scope.max) + 1;
                    } else {
                        $scope.max = newValue.pageSize;
                        $scope.offset = newValue.offset;
                        $scope.currentPage = newValue.page + 1;
                        $scope.totalPages = newValue.previousPages.length  + newValue.nextPages.length + 1;
                    }
                }
                $scope.waiting = false;

            });

            $scope.previous = function () {
                $scope.offset = $scope.offset - $scope.max;

                if ( $scope.offset >= 0 ) {
                    $scope.update();
                } else {
                    $log.error( 'Offset: ' + $scope.offset + ' smaller then zero' );
                }
            };

            $scope.to = function () {
                $scope.offset = ( $scope.currentPage - 1 ) * $scope.max;

                if ( $scope.currentPage ) {
                    if ( $scope.offset >= 0 && $scope.offset < $scope.total ) {
                        $scope.update();
                    } else {
                        $log.error( 'Offset: ' + $scope.offset + ' not within bounds' );
                    }
                }
            };

            $scope.next = function () {
                $scope.offset = $scope.offset + $scope.max;

                if ( $scope.offset < $scope.total ) {
                    $scope.update();
                } else {
                    $log.error( 'Offset: ' + $scope.offset + ' larger then ' + $scope.total - 1 );
                }
            };

            $scope.first = function () {
                $scope.offset = 0;
                $scope.update();
            };


            $scope.last = function () {
                $scope.offset = $scope.total - ( $scope.total % $scope.max);
                if ( $scope.offset < $scope.total ) {
                    $scope.update();
                } else {
                    $log.error( 'Offset: ' + $scope.offset + ' larger then ' + $scope.total - 1 );
                }
            };

            $scope.update = function () {
                $scope.waiting = true;
                $scope.submit( {offset: $scope.offset, page: $scope.offset / $scope.max} );
            };

        }
    };
} );