angular.module( 'poms.search.services' ).factory( 'SearchFactory', [
    '$filter',
    'ListService',
    'MediaService',
    function ( $filter, listService, mediaService ) {

        function date ( d ) {
            if ( ! d ) {
                return;
            }
            if ( d instanceof Date ) {
                return d;
            }
            return new Date( '' + d );
        }
        function dateRange(range) {
            var result = {};
            if (range) {
                result.start = date(range.start);
                result.stop = date(range.stop);
            }
            return result;

        }


        /**
         * Some kind of documentation would be welcome here.
         */
        function RestrictedValue ( config ) {
            this.strict = config && config.strict || false;
            this.restriction = config && config.restriction || undefined;
            this.value = config && config.value || undefined;
        }

        RestrictedValue.prototype = {

            isRestrictedField : true,

            strict : false, // when false keep one, when true keep all

            restriction : undefined,

            value : undefined,

            remove : function ( value ) {
                var allow = this.restriction === undefined;

                if ( this.value.constructor === Array ) {
                    if ( ! allow ) {
                        if ( this.strict ) {
                            if ( _.some( this.restriction, value ) ) {
                                return false;
                            } else {
                                allow = true;
                            }
                        } else {
                            for ( var i = 0; i < this.value.length; i ++ ) {
                                var restrictedValue = this.value[ i ];
                                if ( ! angular.equals( restrictedValue, value ) && _.contains( this.restriction, value ) ) {
                                    allow = true;
                                    break;
                                }
                            }
                        }
                    }

                    if ( allow ) {
                        var l = this.value.length;
                        _.remove( this.value, function ( type ) {
                            return type.id === value.id;
                        } );
                        return this.value.length < l;
                    }
                }

                return false;
            }

        };

        function Form ( config ) {

            this.summary = config && config.summary || 'Geen beperking';
            this.text = config && config.text || '';
            this.types = new RestrictedValue( config && config.types || { value : [] } );
            this.portals = config && config.portals || [];
            this.broadcasters = config && config.broadcasters || [];
            this.channels = config && config.channels || [];
            this.avType = config && config.avType || undefined;
            this.properties = new RestrictedValue( config && config.properties || { value : [] } );
            this.tags = config && config.tags || [];
            this.descendantOf = config && config.descendantOf || [];
            this.sortDate = dateRange(config && config.sortDate);
            this.createdBy = config && config.createdBy || undefined;
            this.lastModifiedBy = config && config.lastModifiedBy || undefined;
            this.createdDate = dateRange(config && config.createdDate);
            this.lastModifiedDate = dateRange(config && config.lastModifiedDate);
            this.scheduleEventDate = dateRange(config && config.scheduleEventDate);

            this.excludedMids = config && config.excludedMids;
            this.sort = config && config.sort || { field : 'relevance'};

            _.forEach( this, function ( field ) {
                if ( field && field.isRestrictedField && field.restriction && (field.strict || ! field.value || field.value.length === 0) ) {
                    if ( field.restriction.constructor === Array ) {
                        // For strict fields the value should at least contain all restrictions
                        field.value = _.unique( field.value ? field.value.concat( field.restriction ) : field.restriction );
                    }
                }
            } );
        }



        Form.prototype = {
            dateConstraintTypes: mediaService.dateConstraintTypes,
            text : '',
            summary : 'Geen beperking',
            sort: {
                field: 'relevance'
            },
            types : [],
            portals : [],
            broadcasters : [],
            channels : [],
            avType : undefined,
            tags : [],
            sortDate : {
                'start' : undefined,
                'stop' : undefined
            },
            createdBy : undefined,
            lastModifiedBy : undefined,
            createdDate : {
                'start' : undefined,
                'stop' : undefined
            },
            lastModifiedDate : {
                'start' : undefined,
                'stop' : undefined
            },
            scheduleEventDate: {
                'start': undefined,
                'stop': undefined
            },

            descendantOf : [],
            remove : function ( field, value ) {
                if ( field.isRestrictedField ) {
                    return field.remove( value );
                } else {
                    var success = false;
                    _.remove( field, function ( option ) {
                        var equals = _.isEqual( value, option );
                        success |= equals;
                        return equals;
                    } );
                    return success;
                }
            },

            hasDateConstraint : function ( type ) {
                if ( ! this[ type ] ) {
                    throw new Error( 'Invalid dateConstraintType ' + type + ' valid are [sortDate, createdDate, lastModifiedDate,scheduleEventDate]' )
                }

                return type !== undefined
                    && (this[ type ].start !== undefined || this[ type ].stop !== undefined);
            },

            getStartDateConstraint : function ( type ) {
                return this.hasDateConstraint( type ) ? this[ type ].start : undefined;
            },

            getStopDateConstraint : function ( type ) {
                return this.hasDateConstraint( type ) ? this[ type ].stop : undefined;
            },

            clearDateConstraint : function ( type ) {
                if ( this.hasDateConstraint( type ) ) {
                    this[ type ] = { start : undefined, stop : undefined }
                }
            },

            clearStartDateConstraint : function ( type ) {
                if ( this.hasDateConstraint( type ) ) {
                    this[ type ].start = undefined
                }
            },

            clearStopDateConstraint : function ( type ) {
                if ( this.hasDateConstraint( type ) ) {
                    this[ type ].stop = undefined
                }
            },

            setDateConstraint : function ( type, start, stop ) {
                this.clearDateConstraint( type );
                this[ type ] = { start : start, stop : stop }
            },

            applyRestrictions : function ( media ) {
                var self = this;
                var allow = true;

                // We don't check against the form fields but against the restricted fields
                // currently the only restricted fields in use are types and properties
                var checks = [
                    function () {
                        allow = ! self.types.restriction
                            || _.contains(
                                _.map( self.types.restriction, function ( type ) {
                                    return type.id
                                } ), media.type.id );
                        return allow;
                    },
                    function () {
                        _.forEach( self.properties.restriction, function ( restriction ) {
                            switch ( restriction.id ) {
                                case 'noScheduleEvents' :
                                    allow = media.scheduleEvents && media.scheduleEvents.length > 0;
                                    return allow;
                                case 'noMemberOf' :
                                    allow = media.memberOf && media.memberOf.length > 0;
                                    return allow;
                                case 'noEpisodeOf' :
                                    allow = media.episodeOf && media.episodeOf.length > 0;
                                    return allow;
                                case 'withLocations' :
                                    allow = media.locations && media.locations.length > 0;
                                    return allow;
                                case 'writable' :
                                    allow = mediaService.hasWritePermission( media, 'media' );
                                    return allow;
                            }

                        } );

                        return allow;
                    }
                ];

                _.forEach( checks, function ( check ) {
                    allow = check();
                    return allow;
                } );

                return allow;
            },

            // returns a shallow clone of this object while replacing all restricted field to there bare value for querying
            getQuery : function () {
                var clone = _.clone( this );

                // unwrap restricted fields
                _.forEach( clone, function ( field, key ) {
                    clone[ key ] = field && field.isRestrictedField ? field.value : field;
                } );

                // translate form properties to boolean filter config
                if ( clone.properties.length > 0 ) {
                    clone.filters = {};
                    clone.properties.forEach( function ( filter ) {
                        clone.filters[ filter.id ] = true;
                    } );
                    delete clone.properties;
                }

                return clone;
            },

            buildSummary : function () {
                var queryTerms = [],
                    queryText = this.text,
                    ignoreKeys = [ 'text', 'summary', 'dateType', '$$hashKey' ];

                for ( var key in this ) {
                    if ( ! this[ key ] || (key.length && key.length === 0)) {
                        continue;
                    }

                    if ( this.hasOwnProperty( key ) && key in this.dateConstraintTypes) {
                        var formDate = this[key];
                        if (formDate.start || formDate.stop) {
                            var dateDisplay = this.dateConstraintTypes[key];
                            if (formDate.start) {
                                dateDisplay = dateDisplay + " vanaf " + $filter('date')(formDate.start, 'dd-MM-yyyy');
                            }
                            if (formDate.stop) {
                                dateDisplay = dateDisplay + " tot en met " + $filter('date')(formDate.stop, 'dd-MM-yyyy');
                            }
                            queryTerms.push(dateDisplay);
                        }
                    } else if ( key === 'createdBy' && this[ key ] ) {
                        queryTerms.push( 'gemaakt door: ' + this[ key ] );
                    } else if ( key === 'descendantOf' && this[ key ].length > 1 ) {
                        queryTerms.push( 'onderdeel van: ' + this[ key ] );
                    } else if ( key === 'lastModifiedBy' && this[ key ] ) {
                        queryTerms.push( 'gewijzigd door: ' + this[ key ] );
                    } else if ( key === 'excludedMids' && this[ key ] ) {
                        queryTerms.push( 'niet: ' + this[ key ] );
                    } else if ( this.hasOwnProperty(key) && ignoreKeys.indexOf(key) === - 1 ) {

                        var value = this[ key ];

                        if ( value.isRestrictedField ) {
                            value = value.value;
                        }

                       
                        if ( value ) {
                            //check for objects & arrays ... and strings???
                            if (value.length) {
                                for (var term in value) {
                                    if (value.hasOwnProperty(term)) {
                                        if (typeof value[term] === 'string') {
                                            queryTerms.push(value[term]);
                                        } else if (value[term].text) {
                                            queryTerms.push(value[term].text);
                                        } else {
                                            queryTerms.push(value.value[term]);
                                        }
                                    }
                                }
                            } else if (value.text) {
                                //check for strings
                                queryTerms.push(value.text);
                            }
                        } else {
                            console.log("Unrecognized", key, value);
                        }

                    }
                }

                queryTerms = queryTerms.join( ', ' );

                if ( queryText && queryTerms ) {
                    queryTerms = "'" + queryText + "' in " + queryTerms;
                } else if ( queryText && ! queryTerms ) {
                    queryTerms = "'" + queryText + "'";
                }

                this.summary = queryTerms.length > 0 ? queryTerms : this.__proto__.summary
            }
        };

        function Search ( config ) {
            this.id = config && config.id || Math.random().toString( 36 ).substring(2);
            this.favorite = config && config.favorite || false;
            this.scope = config && config.scope || undefined;
            this.parentMid = config && config.parentMid || undefined;
            this.multiSelect = config && config.multiSelect !== undefined ? config.multiSelect : true;
            this.allowStore = config && config.allowStore !== undefined ? config.multiSelect : true;
            this.selection = config && config.selection || [];
            this.form = new Form( config && config.form ? config.form : undefined );
            this._backup = new Form( config && config._backup ? config._backup : angular.copy( this.form ) );
        }

        Search.prototype = {
            id : undefined,
            favorite : false,
            scope : undefined,
            parentMid : undefined,
            multiSelect : true,
            allowStore : true,
            selection : [],
            form : undefined,
            _backup : undefined,
            clear: function () {
                angular.copy( new Form(), this.form );
                this.selection.length = 0;
                this.form.buildSummary();
            },

            modified : function () {
                return ! angular.equals( this.form, this._backup )
            },

            matches : function ( scope ) {
                for ( var i = 0; i < this.scope.length; i ++ ) {
                    var value = this.scope[ i ];
                    if ( value === scope ) {
                        return true;
                    }
                }
                return false;
            },

            update : function () {
                angular.copy( this.form, this._backup );
            },

            reset : function () {
                angular.copy( this._backup, this.form );
                this.selection.length = 0;
                this.form.buildSummary();
            }
        };

        function SearchResult ( config ) {
            this.searchResults = config && config.searchResults || [];
            this.hasResults = config && config.hasResults || false;
            this.resultCount = config && config.resultCount || 0;
            this.allFilters = config && config.allFilters || [];
            this.searching = config && config.searching || false;
            this.selection = config && config.selection || [];
        }

        SearchResult.prototype = {
            searchResults : [],
            hasResults : false,
            resultCount : 0,
            allFilters : [],
            searching : false,
            selection : []
        };

        function SearchFactory () {
            listService.getMediaTypes().then(
                function ( types ) {
                    SearchFactory._typesHolder = types;
                }.bind( this )
            );
        }

        SearchFactory.pushMediaTypes = function ( ids, target ) {
            for ( var r = 0; r < ids.length; r ++ ) {
                var requestType = ids[ r ];
                for ( var s = 0; s < SearchFactory._typesHolder.length; s ++ ) {
                    var sourceType = SearchFactory._typesHolder[ s ];
                    if ( requestType === sourceType.id ) {
                        target.push( sourceType );
                        break;
                    }
                }
            }
            return target;
        };

        SearchFactory.prototype = {

            newRestrictedValue : function ( config ) {
                return new RestrictedValue( config )
            },

            newForm : function ( config ) {
                return new Form( config )
            },

            newSearch : function ( config ) {
                return new Search( config )
            },

            newDescendantOfSearch : function ( config ) {
                var search = {
                    scope : 'descendantOf',
                    form : {
                        excludedMids : config.selectedMids ,
                        types : {
                            restriction : SearchFactory.pushMediaTypes( [ 'GROUP' ], [] )
                        }/*,
                         properties : {
                         strict : true,
                         restriction : [
                         {
                         id : 'writable',
                         text : 'Mag schrijven'
                         }
                         ]
                         } */
                    }
                };

                _.merge( search, config );

                return new Search( search );
            },

            newEpisodesSearch : function ( config ) {
                var search = {
                    scope : 'episodes',
                    form : {
                        excludedMids : [ config.parentMid ],
                        types : {
                            restriction : SearchFactory.pushMediaTypes( [ 'BROADCAST' ], [] )
                        }/*,
                        properties : {
                            strict : true,
                            restriction : [
                                {
                                    id : 'writable',
                                    text : 'Mag schrijven'
                                }
                            ]
                        } */
                    }
                };

                _.merge( search, config );

                return new Search( search );
            },

            newEpisodeOfSearch : function ( config ) {
                var search = {
                    scope : 'episodeOf',
                    form : {
                        excludedMids : [ config.parentMid ],
                        types : {
                            restriction : SearchFactory.pushMediaTypes( [ 'SERIES', 'SEASON' ], [] )
                        },
                        properties : {
                            strict : true,
                            restriction : [
                                {
                                    id : 'writable',
                                    text : 'Mag schrijven'
                                }
                            ]
                        }
                    }
                };

                _.merge( search, config );

                return new Search( search );
            },

            newMembersSearch : function ( config ) {
                var search = {
                    scope : 'members',
                    form : {
                        excludedMids : [ config.parentMid ]
                    }

                };

                _.merge( search, config );

                return new Search( search );
            },

            newMemberOfSearch : function ( config ) {
                var search = {
                    scope : 'memberOf',
                    form : {
                        excludedMids : [ config.parentMid ],
                        properties : {
                            strict : true,
                            restriction : [
                                {
                                    id : 'writable',
                                    text : 'Mag schrijven'
                                }
                            ]
                        }
                    }
                };

                _.merge( search, config );

                return new Search( search );
            },

            newMergeSearch : function ( type, config ) {
                config = config || {};

                var search = {
                    scope : 'merge',
                    allowStore : false,
                    multiSelect : false,
                    form : {
                        excludedMids : [ config.parentMid ],
                        types : {
                            strict : true,
                            restriction : SearchFactory.pushMediaTypes( [ type.id ? type.id : type ], [] )
                        },
                        properties : {
                            strict : true,
                            restriction : [
                                {
                                    id : 'writable',
                                    text : 'Mag schrijven'
                                }
                            ]
                        }
                    }
                };

                _.merge( search, config );

                return new Search( search );
            },

            migrateQuery : function ( config ) {
                if ( ! config || ! config.form ) {
                    return;
                }

                _.forEach( [ 'types', 'properties' ], function ( field ) {
                    if ( config.form[ field ] ) {
                        config.form[ field ] = { value : config.form[ field ] };
                    }
                } );

                var search = new Search( config );
                search.form.buildSummary();
                return search
            },

            newSearchResult : function ( config ) {
                return new SearchResult( config )
            }

        };

        return new SearchFactory();
    }
] );
