angular.module('poms.search.controllers').controller('SearchTabController', [
    '$scope',
    'BulkUpdateService',
    'SearchService',
    (function() {

        function SearchTabController($scope, BulkUpdateService, SearchService) {
            this.$scope = $scope;
            this.bulkUpdateService = BulkUpdateService;
            this.searchService = SearchService;

            this.search = $scope.search;

            $scope.$on('selected', function(event, result) {
                event.preventDefault();
                this.searchService.editResult(result);
            }.bind(this));
        }

        SearchTabController.prototype = {

            bulkUpdateSelection : function() {
                this.bulkUpdateService.start(this.search.selection);
            },

            editSelection : function() {
                this.searchService.editSelection(this.search.selection);
            },

            previewSelection : function() {
                this.searchService.previewResultsInModal(this.search.selection);
            }
        };

        return SearchTabController;
    }())
]);