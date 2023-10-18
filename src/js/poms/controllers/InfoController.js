angular.module('poms.media.controllers').controller('InfoController', [
    '$scope',
    '$uibModalInstance',
    'PomsEvents',
    'InfoService',
    'SearchService',
    (function() {

        function InfoController($scope, $uibModalInstance, PomsEvents, InfoService, SearchService) {

            this.pomsEvents = PomsEvents;
            this.infoService = InfoService;
            this.searchService = SearchService;

            this.$scope = $scope;
            this.$uibModalInstance = $uibModalInstance;

            this.init();
        }

        InfoController.prototype = {

            cancel : function() {
                this.$uibModalInstance.dismiss();
            },

            init : function() {
                this.infoService.getInfo().then(
                    function(info) {
                        this.$scope.info = info;
                    }.bind(this),
                    function(error) {
                        this.$scope.$emit(this.pomsEvents.error, error);
                    }.bind(this)
                );
            },

            showUserUpdates : function( displayName ) {
                this.searchService.searchUserUpdates( displayName );
                this.cancel();
            },

            showUserUpdatesLastHour : function( displayName ) {
                const start = new Date();
                const stop = new Date();

                start.setHours(start.getHours() - 1);

                this.searchService.searchUserUpdates( displayName, { start: start, stop : stop } );
                this.cancel();
            },

            showUserUpdatesLastDay : function( displayName ) {
                const start = new Date();
                const stop = new Date();

                start.setDate(start.getDate() - 1);

                this.searchService.searchUserUpdates( displayName, { start: start, stop : stop } );
                this.cancel();
            }
        };

        return InfoController;
    }())
]);
