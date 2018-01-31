angular.module( 'poms.media.controllers' ).controller( 'EditHistoryController', [
    '$scope',
    '$modalInstance',
    'title',
    'media',
    'MediaService',
    (function () {

        function EditHistoryController(  $scope, $modalInstance,  title, media, mediaService  ){

            this.$scope = $scope;
            this.$scope.title = title;
            this.$scope.media = media;
            this.$modalInstance = $modalInstance;
            this.mediaService = mediaService;

            this.init();


        }

        EditHistoryController.prototype = {

            close: function(){
                this.$modalInstance.dismiss();
            },

            init: function(){
                this.mediaService.getHistory( this.$scope.media ).then(
                    function ( data ) {
                        this.$scope.editHistory = data;
                    }.bind( this ),
                    function () {
                        this.$scope.editHistory = {};
                    }.bind( this )
                )
            }

        };

        return EditHistoryController;

    }())
] );
