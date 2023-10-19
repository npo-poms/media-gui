angular.module('poms.search.controllers').controller('SearchFormController', [
    '$scope',
    '$q',
    '$filter',
    'ListService',
    'FavoritesService',
    'GuiService',
    'MediaService',
    'SearchService',
    'SearchFactory',
    (function() {

        function SearchFormController($scope, $q, $filter, listService, favoritesService, guiService, mediaService, searchService, SearchFactory) {

            this.$scope = $scope;
            this.$q = $q;
            this.$filter = $filter;
            this.listService = listService;
            this.searchService = searchService;

            this.guiService = guiService;
            this.favoritesService = favoritesService;
            this.mediaService = mediaService;
            this.searchFactory = SearchFactory;

            this.search = $scope.search;

            this.$scope.suggestions = [];

            this.$scope.userSuggestions = [];


            this.$scope.searchDate = {
                'isOpen' : false,
                'start' : undefined,
                'stop' : undefined,
                'dateType' : 'sortDate'
            };

            this.$scope.dateFormat = 'dd-MM-yyyy';

            this.$scope.formData = this.search.form;
            this.$scope.formData.selectedAVType = {value: { id : 'VIDEO', text : 'Video' }};

            this.setFilterOptions();

            this.submit();
        }

        SearchFormController.prototype = {

            clearStartDateConstraint : function(type) {
                this.search.form.clearStartDateConstraint(type);
                this.submit();
            },

            clearStopDateConstraint : function(type) {
                this.search.form.clearStopDateConstraint(type);
                this.submit();
            },

            dateSelected : function() {
                if(!this.$scope.searchDate.isOpen) {

                    //dropdown is closed
                    this.search.form.setDateConstraint(this.$scope.searchDate.dateType, this.$scope.searchDate.start, this.$scope.searchDate.stop);

                    if( this.$scope.searchUserType && this.$scope.searchUser && this.$scope.searchUser.text ) {
                        this.$scope.formData.createdBy = '';
                        this.$scope.formData.lastModifiedBy = '';

                        this.$scope.formData[this.$scope.searchUserType] = this.$scope.searchUser.text;
                    }

                    this.submit();

                }
            },

            deleteOption : function(collection, item) {
                delete collection[item];
                this.submit();
            },

            editRef : function(mid) {
                return '#/edit/' + mid;
            },

            getTags : function(data) {
                return this.listService.getTags(data);
            },

            getUsers : function() {
                this.$scope.userSuggestions = this.listService.getUsers(this.$scope.searchUser.text);
            },

            //deprecated
            openInEditor : function(mid) {
                this.editResult({mid : mid});
            },

            editResult : function(results) {
                this.searchService.editResult(results);
            },

            previewSelection : function() {
                this.searchService.previewResultsInModal(this.search.selection);
            },

            removeOption : function(field, value) {
                if(this.search.form.remove(field, value)) {
                    this.submit();
                }
            },

            reset : function() {
                // MSE-3701
                if ( this.search.favorite ) {
                    this.search.clear();
                } else {
                    this.search.reset();
                }

                this.setFilterOptions();
                this.submit();
            },

            selectFavoriteItem : function(mid) {
                this.$scope.$emit('favoriteSelected', mid);
            },

            setDays : function( days ){
                this.$scope.searchDate.stop = new Date();
                this.$scope.searchDate.start = new Date(new Date() - days * 24 * 60 * 60 * 1000);
            },

            addDescendantOf : function( ) {
                if ( this.$scope.formData.descendantOf  && this.$scope.formData.descendantOf.length ){
                    if ( this.$scope.formData.descendantOf.indexOf( this.$scope.descendantOfMid ) === -1 ){
                        this.$scope.formData.descendantOf.push( this.$scope.descendantOfMid );
                    }
                } else {
                    this.$scope.formData.descendantOf = [ this.$scope.descendantOfMid ] ;
                }


                 this.$scope.descendantOfMid = '';
                 this.$scope.onderdeel = false;

                 this.submit();
             },

            searchDescendantOf : function( ) {

                const search = this.searchFactory.newDescendantOfSearch( { selectedMids: this.$scope.formData.descendantOf });

                this.searchService.searchMediaInModal(search).then( function ( results ) {

                    if ( results && results.length ) {

                        const mids = _.map(results, function( result ){
                            return result.mid
                        });

                        if ( this.$scope.formData.descendantOf && this.$scope.formData.descendantOf.length ){
                            this.$scope.formData.descendantOf = this.$scope.formData.descendantOf.concat( mids );
                        } else {
                            this.$scope.formData.descendantOf = mids ;
                        }

                        this.submit();
                    }

                }.bind( this ) );

            },

            setFilterOptions : function() {
                const form = this.search.form;
                const scope = this.$scope;
                const properties = this.$q.defer();

                const selectBindings = [
                    {
                        field : 'types',
                        options : 'mediaTypes',
                        load : this.listService.getMediaTypes
                    },
                    {
                        field : 'avType',
                        options : 'avTypes',
                        load : this.listService.getAvTypes
                    },
                    {
                        field : 'broadcasters',
                        options : 'broadcasters',
                        load : this.listService.getBroadcasters
                    },
                    {
                        field : 'portals',
                        options : 'portals',
                        load : this.listService.getPortals
                    },
                    {
                        field : 'channels',
                        options : 'channels',
                        load : this.listService.getChannels
                    },
                    {
                        field : 'properties',
                        options : 'properties',
                        load : function() {
                            return properties.promise;
                        }
                    }
                ];

                // bind selected values to option values as is required by ui-select
                const bindSelectedValues = function(selected, options) {
                    if(!selected) {
                        return;
                    }

                    for(let i = 0; i < selected.length; i++) {
                        const value = selected[i];
                        const option = _.find(options, function(option) {
                            return option.id === value.id;
                        });

                        if(!option) {
                            // just a precaution
                            selected.splice(i, 1);
                        } else {
                            // replace with bound option
                            selected[i] = option;
                        }
                    }
                };

                _.forEach(selectBindings, function(binding) {
                    const field = form[binding.field];
                    const value = field && field.isRestrictedField ? field.value : field;
                    const restriction = field && field.restriction;
                    if(restriction) {
                        scope[binding.options] = {
                            data : restriction
                        };
                        bindSelectedValues(value, restriction);
                    } else {
                        binding.load().then(
                            function(data) {
                                scope[binding.options] = {
                                    data : data
                                };
                                bindSelectedValues(value, data);
                            },
                            function() {
                                options = {
                                    data : []
                                };
                            }
                        );
                    }
                });

                properties.resolve([
                    {
                        id : 'noScheduleEvents',
                        text : 'Niet op radio/tv'
                    },
                    {
                        id: 'yesScheduleEvents',
                        text: 'Op radio/tv'
                    },
                    {
                        id : 'noMemberOf',
                        text : 'Geen onderdeel'
                    },
                    {
                        id: 'yesMemberOf',
                        text: 'Wel onderdeel'
                    },
                    {
                        id : 'noEpisodeOf',
                        text : 'Geen aflevering'
                    },
                    {
                        id: 'yesEpisodeOf',
                        text: 'Wel aflevering'
                    },
                    {
                        id : 'withLocations',
                        text : 'Met bron'
                    },
                    {
                        id: 'withoutLocations',
                        text: 'Zonder bron'
                    },
                    {
                        id: 'writable',
                        text: 'Mag schrijven'
                    },
                    /*   {
                        id: 'notWritable',
                        text: 'Mag niet schrijven'
                    },*/
                    {
                        id: 'noCredits',
                        text: 'Plaatjes zonder bronvermelding'
                    },
                    {
                        id: 'yesCredits',
                        text: 'Geen plaatjes zonder bronvermelding'
                    },
                    {
                        id: 'noImages',
                        text: 'Zonder plaatjes'
                    },
                    {
                        id: 'yesImages',
                        text: 'Met plaatjes'
                    },
                    {
                        id: 'noStreamingPlatformAvailable',
                        text: 'Niet beschikbaar op streaming platform'
                    },
                    {
                        id: 'yesStreamingPlatformAvailable',
                        text: 'Beschikbaar op streaming platform'
                    }
                ]);
            },

            submit : function() {
                this.$scope.formData.buildSummary();

                //Update queryData on scope, this will trigger a watch in searchResultController
                this.$scope.query = this.$scope.formData.getQuery();
                this.$scope.query.lastClick = new Date(); // explicit click, make sure we search again!

            },

            suggest : function(viewValue) {

                this.suggestionsWaiting = true;

                const normalized = this.$scope.formData.getQuery();

                normalized.text = viewValue;

                return this.searchService.suggest(normalized).then(

                    function(suggestions) {
                        for(let i = 0; i < suggestions.data.length; i++) {
                            suggestions.data[i] = {
                                "text" : suggestions.data[i],
                                "type" : 'searchSuggestion'
                            };
                        }

                        const search = this.search;

                        const filter = function(media) {
                            return search && media.mid !== search.parentMid && search.form.applyRestrictions(media);
                        };

                        const mediaTabs = _.filter(this.guiService.getGuiMedia(), filter);
                        const favoriteMedia = _.filter(this.favoritesService.getFavoriteMedia(), filter);
                        const fastSuggestions = mediaTabs.concat(
                            _.filter(favoriteMedia, function(favorite) {
                                let map = _.map(mediaTabs, function(media) {
                                    return media.mid;
                                });
                                return ! _.includes(map, favorite.mid);
                            }));
                        const re = new RegExp(this.$scope.formData.text, 'gi');
                        for(let j = 0; j < fastSuggestions.length; j++) {
                            const suggestion = fastSuggestions[j];
                            if (! suggestion.mainTitle) {
                                console.log("Odd suggestion! (missing mainTitle)", suggestion);
                                continue;
                            }
                            if(suggestion.mainTitle && suggestion.mainTitle.text.match(re)) {

                                let subTitle = "";
                                if ( suggestion.subTitle ){
                                    subTitle = " - " + suggestion.subTitle.text;
                                }
                                const favoriteSuggestion = {
                                    "text" : suggestion.mainTitle.text + subTitle + " (" + suggestion.type.text + "-" + this.$filter('mediaDate')(suggestion.sortDate) + ")",
                                    "type" : 'mediaSuggestion',
                                    "media" : suggestion
                                };
                                suggestions.data.unshift(favoriteSuggestion);

                            }

                        }
                        //console.log("Ready!");
                        this.suggestionsWaiting = false;

                        return suggestions.data;

                    }.bind(this)
                );
            },

            suggestClicked : function(item) {

                if(item.type === 'searchSuggestion') {
                    this.$scope.formData.text = item.text;
                    this.submit();
                }

                if(item.type === 'mediaSuggestion') {
                    this.$scope.formData.text = '"' + item.media.mainTitle.text + '"';
                    // this.$scope.formData.text = "";
                    this.$scope.$emit('selected', item.media);
                    this.submit();
                }
            },

            toggleDateDropdown : function($event) {
                $event.stopPropagation();
                this.$scope.searchDate.isOpen = !this.$scope.searchDate.isOpen;
                this.dateSelected();
            }
        };

        return SearchFormController;
    }())
]);
