angular.module( 'poms.media.controllers' ).controller( 'FavoritesController', [
    '$scope',
    '$modalInstance',
    'FavoritesService',
    'GuiService',
    'MediaService',
    'PomsEvents',
    (function () {

        function FavoritesController ( $scope, $modalInstance, favoritesService , guiService , mediaService , pomsEvents) {

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.favoritesService = favoritesService;
            this.guiService = guiService;
            this.mediaService = mediaService;
            this.pomsEvents = pomsEvents;

            this.$scope.media = [];
        }

        FavoritesController.prototype = {

            cancel: function () {
                this.$modalInstance.dismiss();
            },

            init : function(){
                this.$scope.searches = this.favoritesService.getFavoriteSearches();
                this.$scope.media = this.favoritesService.getFavoriteMedia();
            },

            openSearch : function( search ){
                // MSE-3701
                this.guiService.removeSearchTab( search );
                search.reset();
                this.guiService.openSearchTab( search );
                this.cancel();
            },

            openMediaItem : function( mid ){
                window.location.href = '#/edit/' + mid ;
                this.cancel();
            },

            removeSearch : function( search ){
                this.$scope.searches = this.favoritesService.removeSearch( search );
            },

            removeMediaItem : function( mid ){
                this.$scope.mids = this.favoritesService.removeMediaItem( mid );

                for ( var i = 0; i < this.$scope.media.length; i ++ ) {
                    if ( this.$scope.media[i].mid === mid ){
                        this.$scope.media.splice(i, 1);
                        break;
                    }
                }
            }


        };

        return FavoritesController;
    }())
] );
