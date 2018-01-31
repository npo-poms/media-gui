angular.module('poms.media.controllers').controller('InfoController', [
    '$scope',
    '$modalInstance',
    'PomsEvents',
    'InfoService',
    'SearchService',
    (function() {

        function InfoController($scope, $modalInstance, PomsEvents, InfoService, SearchService) {

            this.pomsEvents = PomsEvents;
            this.infoService = InfoService;
            this.searchService = SearchService;

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;

            this.init();
        }

        InfoController.prototype = {

            cancel : function() {
                this.$modalInstance.dismiss();
            },

            init : function() {

                this.infoService.getInfo().then(
                        function(info) {
                            this.$scope.info = info;
                        }.bind(this),
                        function(error) {
                            $scope.$emit(this.pomsEvents.error, error);
                        }.bind(this)
                );
            },

            showUserUpdates : function( displayName ) {
                this.searchService.searchUserUpdates( displayName );
                this.cancel();
            },

            showUserUpdatesLastHour : function( displayName ) {
                var start = new Date(),
                        stop = new Date();

                start.setHours(start.getHours() - 1);

                this.searchService.searchUserUpdates( displayName, { start: start, stop : stop } );
                this.cancel();
            },

            showUserUpdatesLastDay : function( displayName ) {
                var start = new Date(),
                        stop = new Date();

                start.setDate(start.getDate() - 1);

                this.searchService.searchUserUpdates( displayName, { start: start, stop : stop } );
                this.cancel();
            }
        };

        return InfoController;
    }())
]);
