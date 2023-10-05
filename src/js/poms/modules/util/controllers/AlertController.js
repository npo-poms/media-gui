angular.module('poms.util.controllers')
        .controller('AlertController', [
            '$scope',
            '$uibModalInstance',
            'GuiService',
            'error',
            (function() {

                function AlertController($scope, $uibModalInstance, GuiService, error) {

                    this.$scope = $scope;
                    this.$uibModalInstance = $uibModalInstance;
                    this.guiService = GuiService;
                    this.error = error;
                    if (! this.error.message) {
                        this.error.message = JSON.stringify(error);
                    }

                    if(error.familyTree) {
                        this.breadCrumbs = [];

                        var crumb = error.familyTree;

                        while(crumb) {
                            this.breadCrumbs.push({
                                mid : crumb.id,
                                type : crumb.type.text,
                                title : crumb.text,
                                number : crumb.number,
                                sequenceInfo : crumb.sequenceInfo
                            });
                            crumb = crumb.child;
                        }
                    }
                }

                AlertController.prototype = {

                    editMid : function(mid) {
                        this.guiService.editMid(mid);
                        this.cancel();
                    },

                    reloadPage : function() {
                        location.reload(true);
                    },

                    cancel : function() {
                        this.$uibModalInstance.close();
                    }
                };

                return AlertController;
            }()
        )
]);
