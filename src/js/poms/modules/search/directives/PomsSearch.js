angular.module('poms.search.directives')
        .directive('pomsSearchTab', [function() {
            return {
                restrict : 'E',
                templateUrl : 'search/search-tab.html',
                controller : 'SearchTabController',
                controllerAs : 'searchTabController',
                scope : {
                    search : '='
                }
            }
        }])
        .directive('pomsSearch', [function() {
            return {
                restrict : 'E',
                templateUrl : 'search/search.html',
                controller : 'SearchFormController',
                controllerAs : 'searchFormController',
                scope : {
                    search : '='
                }
            }
        }])
        .directive('pomsSearchResult', [function() {
            return {
                restrict : 'E',
                templateUrl : 'search/search-results.html',
                controller : 'SearchResultController',
                controllerAs : 'searchResultController',
                scope : {
                    search : '=',
                    query : '='

                }
            }
        }]
);
