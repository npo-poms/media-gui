angular.module( 'poms.search.controllers' ).controller( 'SearchResultController', [
    '$scope',
    'FavoritesService',
    'GuiService',
    'MediaService',
    'PomsEvents',
    'SearchService',
    'EditorService',
    'MessageService',

    (function () {

        function SearchResultController ( $scope, favoritesService, guiService, mediaService, pomsEvents, searchService, editorService, messageService) {

            this.$scope = $scope;

            this.favoritesService = favoritesService;
            this.guiService = guiService;
            this.mediaService = mediaService;
            this.pomsEvents = pomsEvents;
            this.searchService = searchService;
            this.messageService = messageService;


            this.$scope.searchResults = {};

            this.search = $scope.search;

            this.$scope.lastSelect = null;


            this.clearResults();

            this.searchCount = 0;

            this.$scope.sort = 'relevance';

            this.$scope.$watchCollection( 'query', function ( newValue ) {
                this.submit();
            }.bind( this ));

            this.$scope.mayDownload = editorService.currentEditorHasRoles(['SUPERADMIN', 'SUPERUSER', 'SUPPORT'])
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
                this.$scope.downloading = false;
                this.$scope.csvUrl = null;
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

            toggleSelect: function ( item, event) {
                var previous = this.$scope.lastSelect;
                var range = event.shiftKey && previous;
                console.log("Range matching", range, event.shiftKey, previous);
                this.$scope.lastSelect = item;
                var spliceIdx = - 1;
                item.selected = !item.selected;

                if ( !this.search.multiSelect ){
                    if ( item.selected ) {
                        this.search.selection = [ item ];
                        angular.forEach( this.$scope.searchResults.items, function ( i ) {
                            if ( i.mid !== item.mid ){
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
                    var matching = false;
                    var selectionTarget = item.selected;
                    angular.forEach( this.$scope.searchResults.items, function ( i ) {
                        var matchCurrent = i.mid === item.mid;
                        if (range) {
                            var matchPrevious = i.mid === previous.mid;
                            if (matchPrevious || matchCurrent) {
                                matching = ! matching;
                            }
                        } else {
                            matching = matchCurrent;
                        }

                        if (matching || matchCurrent || matchPrevious) {
                            i.selected = selectionTarget;
                            if (i.selected) {
                                this.search.selection.push(i);
                            } else {
                                angular.forEach(this.search.selection, function (selection, idx) {
                                    if (selection.mid === i.mid) {
                                        spliceIdx = idx;
                                        this.search.selection.splice(spliceIdx, 1);
                                    }
                                }.bind(this));
                            }

                            if (spliceIdx > -1) {
                                this.search.selection.splice(spliceIdx, 1);
                            }

                        }
                    }.bind(this));
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

                    if ( toggledColumn.id !== this.$scope.sort ) {

                        this.$scope.sort = toggledColumn.id;
                        this.$scope.order = 'DESC';

                    } else {
                        this.$scope.order = this.$scope.order === 'DESC' ? 'ASC' : 'DESC';
                    }
                    this.submit();
                }

            },

            queryDataAndOptions: function(offset) {
                var queryData = this.searchService.setStopDates(this.$scope.query);

                this.$scope.dateFilter = queryData.sortDate || {};

                var options = {
                    offset: offset || 0
                };
                if ( this.$scope.sort && this.$scope.sort !== 'relevance' ) {
                    options.sort = this.$scope.sort;
                    options.order = this.$scope.order;
                }
                return [queryData, options];

            },

            submit: function ( offset ) {
                this.$scope.searching = true;
                this.$scope.csvUrl = null;
                var searchCount = ++this.searchCount;
                var queryData, options;
                // [queryData, options] = this.queryDataAndOptions(offset); doesn't work in IE 11
                {
                    var a = this.queryDataAndOptions(offset);
                    queryData = a[0];
                    options = a[1];
                }
                var promise;
                if ( this.search.scope === 'episodeOf' ) {
                    promise = this.searchService.loadEpisodeOfs( queryData, options );
                } else if ( this.search.scope === 'episodes' ) {
                    promise = this.searchService.loadEpisodes( queryData, options );
                } else {
                    promise = this.searchService.load( queryData, options );
                }

                promise.then(
                    function ( data ) {
                        if( searchCount === this.searchCount ) {
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

            download: function (ev) {
                ev.preventDefault();
                var queryData, options;
                [queryData, options] = this.queryDataAndOptions(0);
                this.$scope.downloading = true;
                var promise = this.searchService.download(queryData, options);
                promise.then(
                    function ( data ) {
                        this.messageService.callback(data.uuid, function(arg) {
                            this.$scope.csvUrl = data.url;
                            this.$scope.downloading = false;
                            return false;
                        }.bind(this));
                    }.bind( this ),
                    function (error) {
                        console && console.log("ERROR", error);
                        this.$scope.downloading = false;
                    }.bind( this )
                );

            },

            locationTypes : function( locations ){
                var uniqueLocations = [];
                for ( var i = 0; i < locations.length; i ++ ) {
                    if ( uniqueLocations.indexOf( locations[i].format ) === -1 ){
                        uniqueLocations.push( locations[i].format );
                    }

                }
                return uniqueLocations;

            }

        };

        return SearchResultController;
    }())
] );
