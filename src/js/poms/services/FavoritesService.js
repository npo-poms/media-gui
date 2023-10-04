angular.module( 'poms.services' ).factory( 'FavoritesService', [
    '$rootScope',
    '$uibModal',
    'localStorageService',
    'EditorService',
    'NotificationService',
    'SearchFactory',
    'PomsEvents',
    function ( $rootScope, $modal, localStorageService, EditorService,  NotificationService, SearchFactory, pomsEvents ) {

        function FavoritesService () {

            this.$rootScope = $rootScope;
            this.localStorageService = localStorageService;
            this.notificationService = NotificationService;
            this.editorService = EditorService;
            this.searchFactory = SearchFactory;
            this.editor = {};
            this.pomsEvents = pomsEvents;

            this.searchKey = 'searchFavorites';
            this.mediaKey = 'mediaFavorites';

        }

        FavoritesService.prototype = {

            init : function () {
                this.editor = this.editorService.getCurrentEditor();
                this.searchKey = this.editor.hashId + '.searchFavorites';
                this.mediaKey = this.editor.hashId + '.mediaFavorites';
                this.saveConfirmKey = this.editor.hashId + '.saveconfirm';
                
                // init media
                this.media = localStorageService.get( this.mediaKey ) || [];

                // init searches
                this.searches = this.getFavoriteSearches();
                this.searches = localStorageService.get( this.searchKey ) || [];
                for ( var i = 0; i < this.searches.length; i ++ ) {
                    var favorite = this.searches[ i ];
                    this.searches[ i ] = this.searchFactory.newSearch( favorite );
                }
            },

            broadcast : function ( favorite ) {
                this.notificationService.notify( '<span>' + favorite + '</span><span> is toegvoegd aan je favorieten </span>' );
            },

            openFavorites : function () {
                $modal.open( {
                    controller : 'FavoritesController',
                    controllerAs : 'favoritesController',
                    templateUrl : 'gui/modal-favorites.html',
                    windowClass : 'modal-favorites'
                } );
            },

            addMediaItem : function ( media ) {
                if ( ! this.isFavoriteMedia( media ) ) {
                    this.media.push( media );
                    localStorageService.set( this.mediaKey, this.media );

                    var message;
                    if ( media.mainTitle && media.mainTitle.text ) {
                        message = media.mainTitle.text + " (" + media.mid + ") ";
                    } else if ( $scope.media.title ) {
                        message = media.title + " (" + media.mid + ") ";
                    }

                    this.broadcast( message );
                }
            },

            saveSearch : function ( search ) {
                if ( ! search.allowStore ) {
                    throw new Error( 'Not allowed to store search' + search )
                }

                if (search.form.sort.field !== 'relevance') {
                    search.form.summary += ' (' + (search.form.sort.fieldName || search.form.sort.field);
                    if (search.form.sort.order === 'DESC') {
                        search.form.summary += '↓';
                    }
                    search.form.summary += ')';
                }
                //console.log("Saving search", search);
                search.favorite = true;
                angular.copy( search.form, search._backup );

                for ( var i = 0; i < this.searches.length; i ++ ) {
                    var existing = this.searches[i];
                    if ( search.id === existing.id ) {
                        search.update();
                        this.searches[ i ] = search;
                        localStorageService.set( this.searchKey, this.searches );
                        return;
                    }
                }

                this.searches.push( search );
                localStorageService.set( this.searchKey, this.searches );

                this.broadcast( search.form.summary )
            },

            getSaveConfirm : function () {
                return localStorageService.get( this.saveConfirmKey );
            },

            getFavoriteSearches : function () {
                return this.searches;
            },

            getFavoriteMedia : function () {
                return this.media;
            },

            isFavoriteSearch : function ( search ) {
                for ( var i = 0; i < this.searches.length; i ++ ) {
                    if ( search.id === this.searches[ i ].id ) {
                        return true;
                    }
                }
                return false;
            },

            isFavoriteMedia : function ( media ) {
                var isFavorite = false;

                for ( var i = 0; i < this.media.length; i ++ ) {
                    if ( this.media[i].mid === media.mid ) {
                        isFavorite = true;
                    }
                }
                return isFavorite;
            },

            removeSearch : function ( search ) {
                for ( var i = 0; i < this.searches.length; i ++ ) {
                    if ( this.searches[i].id === search.id ) {
                        search.favorite = false;
                        this.searches.splice( i, 1 );
                        break;
                    }
                }
                localStorageService.set( this.searchKey, this.searches );
                return this.searches;
            },

            removeMediaItem : function ( mid ) {
                this.media.splice( this.media.indexOf( mid ), 1 );
                localStorageService.set( this.mediaKey, this.media );
                return this.media;
            },

            setSaveConfirm : function ( value ) {
                localStorageService.set( this.saveConfirmKey, "" + value );
            }

        };

        return new FavoritesService();
    }
] );
