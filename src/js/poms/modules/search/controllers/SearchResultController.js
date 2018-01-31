angular.module( 'poms.search.controllers' ).controller( 'SearchResultController', [
    '$scope',
    'FavoritesService',
    'GuiService',
    'MediaService',
    'PomsEvents',
    'SearchService',
    (function () {

        function SearchResultController ( $scope, favoritesService, guiService, mediaService, pomsEvents, searchService ) {

            this.$scope = $scope;

            this.favoritesService = favoritesService;
            this.guiService = guiService;
            this.mediaService = mediaService;
            this.pomsEvents = pomsEvents;
            this.searchService = searchService;

            this.$scope.searchResults = {};

            this.search = $scope.search;

            this.clearResults();

            this.searchCount = 0;

            this.$scope.sort = 'relevance';

            this.$scope.$watchCollection( 'query', function ( newValue ) {
                this.submit();
            }.bind( this ));
        }

        SearchResultController.prototype = {

            addFavorite: function () {
                this.favoritesService.saveSearch(this.$scope.search);
            },

            isFavorite: function () {
                return this.$scope.search.favorite;
            },

            removeFavorite: function () {
                this.favoritesService.removeSearch(this.$scope.search);
            },

            modifiedFavorite: function () {
                return this.isFavorite() && this.$scope.search.modified();
            },

            editResult: function ( result ) {
                this.searchService.editResult(result);
            },

            previewResult: function ( index ) {
                this.searchService.previewResultsInModal(this.$scope.searchResults.items, index);
            },

            clearResults: function(){
                this.$scope.searchResults = [];
                this.$scope.hasResults = false;
                this.$scope.resultCount = 0;
                this.$scope.searching = false;
                this.search.selection = [];
            },

            mayWrite: function ( item ) {
                return this.mediaService.hasWritePermission( item, 'media' );
            },

            onDeleteResult: function () {
                return this.submit();
            },

            selectResult: function (result) {
                this.$scope.$emit('selected', result)
            },

            toggleSelect: function ( item ) {

                var spliceIdx = - 1;
                item.selected = !item.selected;

                if ( !this.search.multiSelect ){
                    if ( item.selected ) {
                        this.search.selection = [ item ];
                        angular.forEach( this.$scope.searchResults.items, function ( i ) {
                            if ( i.mid != item.mid ){
                                i.selected = false;
                            }
                        });
                    } else {
                        this.search.selection = [ ];
                        angular.forEach( this.$scope.searchResults.items, function ( i ) {
                            i.selected = false;
                        });
                    }
                } else {
                    if ( item.selected ) {
                        this.search.selection.push( item );
                    } else {
                        angular.forEach( this.search.selection, function ( selection, idx ) {
                            if ( selection.mid === item.mid ) {
                                spliceIdx = idx;
                            }
                        } );
                    }

                    if ( spliceIdx > - 1 ) {
                        this.search.selection.splice( spliceIdx, 1 );
                    }
                }
                this.$scope.$emit( 'selectionChanged', this.search.selection );
            },

            defaultSort: function () {
                this.$scope.sort = 'relevance';
                this.$scope.order = 'DESC';
                this.submit();
            },

            toggleSort: function ( toggledColumn ) {

                if ( toggledColumn.sortable === true ) {

                    if ( toggledColumn.id != this.$scope.sort ) {

                        this.$scope.sort = toggledColumn.id;
                        this.$scope.order = 'DESC';

                    } else {
                        this.$scope.order = this.$scope.order === 'DESC' ? 'ASC' : 'DESC';
                    }
                    this.submit();
                }

            },

            submit: function ( offset ) {
                var queryData = this.searchService.setStopDates(this.$scope.query);
                var options;
                var searchCount = ++this.searchCount;

                this.$scope.searching = true;

                this.$scope.dateFilter = queryData.sortDate || {};

                options = {
                    offset: offset || 0
                };
                if ( this.$scope.sort && this.$scope.sort != 'relevance' ) {
                    options.sort = this.$scope.sort;
                    options.order = this.$scope.order;
                }

                var promise;
                if ( this.search.scope == 'episodeOf' ) {
                    promise = this.searchService.loadEpisodeOfs( queryData, options );
                } else if ( this.search.scope == 'episodes' ) {
                    promise = this.searchService.loadEpisodes( queryData, options );
                } else {
                    promise = this.searchService.load( queryData, options );
                }

                promise.then(
                    function ( data ) {
                        if( searchCount == this.searchCount ) {
                            this.$scope.searchResults = data;
                            this.$scope.hasResults = data.items && data.items.length;
                            this.$scope.resultCount = data.total;
                            this.$scope.searching = false;
                            this.search.selection = [];
                        }
                    }.bind( this ),
                    function (error) {
                        console && console.log("ERROR", error);
                        this.clearResults();
                    }.bind( this )
                );
            },

            locationTypes : function( locations ){
                var uniqueLocations = [];
                for ( var i = 0; i < locations.length; i ++ ) {
                    if ( uniqueLocations.indexOf( locations[i].format ) == -1 ){
                        uniqueLocations.push( locations[i].format );
                    }

                }
                return uniqueLocations;

            }

        };

        return SearchResultController;
    }())
] );
