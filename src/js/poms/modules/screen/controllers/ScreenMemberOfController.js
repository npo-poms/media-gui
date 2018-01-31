angular.module('poms.media.controllers').controller('ScreenMemberController', [
    '$scope',
    '$modal',
    'PomsEvents',
    'EditorService',
    'ScreenService',
    'SearchFactory',
    'SearchService',
    (function() {

        function ScreenMemberController($scope, $modal, PomsEvents, EditorService, ScreenService, SearchFactory, SearchService) {

            if(!ScreenMemberController.$modal) {
                ScreenMemberController.$modal = $modal;
                ScreenMemberController.pomsEvents = PomsEvents;
                ScreenMemberController.editorService = EditorService;
                ScreenMemberController.screenService = ScreenService;
                ScreenMemberController.searchFactory = SearchFactory;
                ScreenMemberController.searchService = SearchService;
            }

            this.$scope = $scope;
            this.mayWrite = true;

            this.$scope.waiting = false;
            this.$scope.displayQuantity = 10;

            this.load();
        }


        ScreenMemberController.prototype = {


            load : function() {

                this.$scope.waiting = true;
                this.$scope.$emit(ScreenMemberController.pomsEvents.loaded, {'section' : 'members', 'waiting' : true });

                ScreenMemberController.screenService.getScreenOf(this.$scope.screen)
                        .then(function(members) {
                            this.$scope.members = members;
                        }.bind(this), function(error) {
                            this.$scope.$emit('error', error)
                        }.bind(this))
                        .finally(function() {
                            this.$scope.waiting = false;
                            this.$scope.$emit(ScreenMemberController.pomsEvents.loaded, {'section' : 'members', 'waiting' : false });
                        }.bind(this));

            },

            remove : function(member) {

                return ScreenMemberController.screenService.removeScreenOf(this.$scope.screen, member).then(
                        function() {
                            this.load();
                        }.bind(this),
                        function(error) {
                            this.$scope.$emit(ScreenMemberController.pomsEvents.error, error);
                            return false;
                        }.bind(this));
            },

            edit : function(rowform) {
                if(!rowform.$visible) {
                    rowform.$show();
                }
            },

            cancel : function(index, rowform) {
                rowform.$cancel();
            },

            editRef : function(mid) {
                return '#/edit/' + mid;
            },

            openInEditor : function(e, mid, rowform) {
                e.preventDefault();
                e.stopPropagation();
                if(!rowform.$visible) {
                    window.location.href = this.editRef(mid);
                }
            },


            addMember : function() {
                // for now these types are not restricted
                var search = ScreenMemberController.searchFactory.newSearch({
                    form : {
                        types : {
                            value : [
                                {
                                    id : 'BROADCAST',
                                    text : 'Uizending'
                                },
                                {
                                    id : 'SEASON',
                                    text : 'Seizoen'
                                },
                                {
                                    id : 'SERIES',
                                    text : 'Serie'
                                }
                            ]
                        }
                    }
                });

                ScreenMemberController.searchService.searchMediaInModal(search).then(
                        function(results) {
                            if(results) {
                                this.$scope.waiting = true;

                                this.$scope.$emit(ScreenMemberController.pomsEvents.loaded, {'section' : 'members', 'waiting' : true });

                                ScreenMemberController.screenService.addScreenOf(this.$scope.screen, _.map(results, function(result) {
                                    return result.mid;
                                })).then(
                                        function(media) {
                                        }.bind(this),
                                        function(error) {
                                            this.$scope.$emit(ScreenMemberController.pomsEvents.error, error)
                                        }.bind(this)
                                ).finally(
                                        function() {
                                            this.load();
                                            this.$scope.waiting = false;
                                            this.$scope.$emit(ScreenMemberController.pomsEvents.loaded, {'section' : this.$scope.type, 'waiting' : false });
                                        }.bind(this)
                                );
                            }
                        }.bind(this));

            },

            showAllMembers : function() {
                this.$scope.displayQuantity = this.$scope.members.length;
            },

            locationTypes : function(locations) {
                var uniqueLocations = [];
                for(var i = 0; i < locations.length; i++) {
                    if(uniqueLocations.indexOf(locations[i].format) == -1) {
                        uniqueLocations.push(locations[i].format);
                    }

                }
                return uniqueLocations;

            }

        };

        return ScreenMemberController;
    }())
]);