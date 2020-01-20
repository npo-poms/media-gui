angular.module( 'poms.admin.controllers' ).controller( 'AdminController', [
    '$scope',
    '$modal',
    'PomsEvents',
    'EditorService',
    'AdminService',
    (function () {

        function AdminController ( $scope, $modal, PomsEvents, EditorService, AdminService ) {

            this.$modal = $modal;
            this.pomsEvents = PomsEvents;
            this.editorService = EditorService;
            this.adminService = AdminService;

            this.$scope = $scope;

        }

        AdminController.prototype = {


            indexMedia: function () {
                this.adminService.index();
            },

            republishMedia: function () {
                var modal = this.$modal.open( {
                    controller: 'RepublishController',
                    controllerAs: 'republishController',
                    templateUrl: 'admin/modal-republish.html',
                    windowClass: 'modal-republish'
                } );
            }

        };

        return AdminController;
    }())
] );
