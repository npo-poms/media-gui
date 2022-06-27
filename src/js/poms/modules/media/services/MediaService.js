angular.module( 'poms.media.services' ).factory( 'MediaService', [
    '$rootScope',
    '$q',
    '$http',
    '$modal',
    'localStorageService',
    'appConfig',
    function ( $rootScope, $q, $http, $modal, localStorageService, appConfig ) {
        storageService = localStorageService;

        baseUrl = appConfig.apiHost + '/gui/media';

        get = function ( media, path, config ) {
            var deferred = $q.defer();
            var url = baseUrl + '/' + media.mid + path;
            $http.get( url, config )
                .success( function ( result ) {
                    deferred.resolve( result );
                } )
                .error( function ( error ) {
                        deferred.reject( error );
                    }
                );

            return deferred.promise;
        };

        post = function ( media, path, body ) {

            var deferred = $q.defer();
            var url = path.startsWith("http") ? path  : baseUrl + (media ? '/' + media.mid : '') + path;

            $http.post( url, body )
                .success( function ( result ) {
                    deferred.resolve( result );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        };

        put = function ( media, path, body ) {

            var deferred = $q.defer();
            var url = baseUrl + '/' + media.mid + path;

            $http.put( url, body )
                .success( function ( media ) {
                    deferred.resolve( media );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        };

        del = function ( media, path ) {

            var deferred = $q.defer();
            var url = baseUrl + '/' + media.mid + path;

            $http.delete( url )
                .success( function ( media ) {
                    deferred.resolve( media );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        };

        function MediaService () {
        }

        MediaService.prototype = {

            dateConstraintTypes: {
                'sortDate': 'uitzend-/sorteerdatum:',
                'scheduleEventDate': 'uitzenddatum',
                'lastModifiedDate': 'gewijzigd:',
                'createdDate': 'aangemaakt:'
            },

            hasReadPermission: function ( media, permission ) {
                return media.permissions[ 'READ' ];
            },

            hasWritePermission: function ( media, field ) {
                if (media) {
                    if (media[field] && media[field].mayWrite !== undefined) {
                        // explicitely indicated in field
                        return media[field].mayWrite;
                    } else {
                        if (! media.permissions) {
                            console.log("No permissions in ", media);
                        } else {
                            // fall back to default write permissions on the entire object
                            return media.permissions['WRITE'];
                        }
                    }
                } else {
                    console.log("No media object given");
                }
            },

            hasDeletePermission: function ( media ) {
                return media.permissions[ 'DELETE' ];
            },

            hasMergePermission: function ( media ) {
                return media.permissions[ 'MERGE' ];
            },
            hasGenrePermission: function(media) {
                return media.permissions['GENRE_WRITE'];
            },

            create: function ( source ) {
                var deferred = $q.defer();

                $http.put( baseUrl, source )
                    .success( function ( media ) {
                        deferred.resolve( media );
                    } )
                    .error( function ( error ) {
                        deferred.reject( error );
                    } );

                return deferred.promise;
            },

            load: function ( mid ) {
                var deferred = $q.defer();
                $http.get( baseUrl + '/' + mid )
                    .success( function ( media ) {
                        deferred.resolve( media );
                    } )
                    .error( function ( error ) {
                        deferred.reject( error );
                    } );

                return deferred.promise;
            },

            delete: function ( media ) {
                return del( media, '' )
            },

            getOwnerData: function ( media, owner ) {
                return get( media, '/ownerData/' + owner );
            },

            setBroadcasters: function ( media, broadcasters ) {
                return post( media, '/broadcasters', broadcasters );
            },

            setPortals: function ( media, portals ) {
                return post( media, '/portals', portals );
            },

            setCountries: function ( media, countries ) {
                return post( media, '/countries', countries );
            },

            setLanguages: function ( media, languages ) {
                return post( media, '/languages', languages );
            },

            setAvType: function ( media, avType ) {
                return post( media, '/avType', avType );
            },
            setType: function ( media, type ) {
                return post( media, '/type', type );
            },

            setTitle: function ( media, type, text ) {
                if ( !text || text === "" ) {
                    return del( media, '/titles/' + type );
                }
                var data = { 'type': type, 'text': text };
                return post( media, '/titles', data );
            },

            setDescription: function ( media, type, text ) {
                if ( !text || text === "" ) {
                    return del( media, '/descriptions/' + type );
                }
                return post( media, '/descriptions', { 'type': type, 'text': text } );
            },

            setPublication: function ( media, data ) {
                if ( !data || ( !data.start && !data.stop ) ) {
                    return del( media, '/publication/' );
                }
                return post( media, '/publication', data );
            },

            setDuration: function ( media, data ) {
                if ( !data ) {
                    return del( media, '/duration/' );
                }
                return post( media, '/duration', { 'string': data } );
            },

            setEmbeddable: function ( media, embeddable ) {
                return post( media, '/embeddable', { 'value': embeddable } );
            },

            setIsDubbed: function ( media, isDubbed ) {
                return post( media, '/isdubbed', { 'value': isDubbed } );
            },

            setOrdered: function ( media, ordered ) {
                return post( media, '/ordered', { 'value': ordered } );
            },

            setYear: function ( media, data ) {
                if ( !data ) {
                    return del( media, '/year/' );
                }
                return post( media, '/year', { 'year': data } );
            },

            setAgeRating: function ( media, ageRating ) {
                if ( !ageRating ) {
                    return del( media, '/ageRating/' );
                }
                return post( media, '/ageRating', ageRating );
            },

            setContentRatings: function ( media, contentRatings ) {
                if ( !contentRatings ) {
                    return del( media, '/contentRatings/' );
                }
                return post( media, '/contentRatings', contentRatings );
            },

            getGeoRestrictions: function ( media ) {
                return get( media, '/geoRestrictions' );
            },

            setGeoRestriction: function ( media, geoRestriction ) {
                return post( media, '/geoRestrictions', geoRestriction );
            },

            removeGeoRestriction: function ( media, geoRestriction ) {
                return del( media, '/geoRestrictions/' + geoRestriction.id );
            },

            getPortalRestrictions: function ( media ) {
                return get( media, '/portalRestrictions' );
            },

            setPortalRestriction: function ( media, portalRestriction ) {
                return post( media, '/portalRestrictions', portalRestriction );
            },

            removePortalRestriction: function ( media, portalRestriction ) {
                return del( media, '/portalRestrictions/' + portalRestriction.id );
            },

            getCredits: function ( media ) {
                return get( media, '/credits' );
            },

            setCredits: function ( media, person ) {
                return post( media, '/credits', person );
            },

            removeCredits: function ( media, person ) {
                return del( media, '/credits/' + person.id );
            },

            moveCredits: function ( media, from, to ) {
                return put( media, '/credits', { from: from, to: to } );
            },

            // TODO doesnt exist yet
            removeAllCredits: function ( media ) {
                return del( media, '/credits' );
            },

            getGeoLocations: function ( media ) {
                return get( media, '/geoLocations' );
            },

            addGeoLocation: function ( media, geoLocation ) {
                return post( media, '/geoLocations', geoLocation );
            },

            removeGeoLocation: function ( media, geoLocation ) {
                return del( media, '/geoLocations/' + geoLocation.id );
            },

            removeGeoLocations: function ( media ) {
                return del( media, '/geoLocations' );
            },

            getTopics: function ( media ) {
                return get( media, '/topics' );
            },

            addTopic: function ( media, topic ) {
                return post( media, '/topics', topic );
            },

            removeTopic: function ( media, topic ) {
                return del( media, '/topics/' + topic.id );
            },

            removeTopics: function ( media ) {
                return del( media, '/topics' );
            },

            getWebsites: function ( media ) {
                return get( media, '/websites' );
            },

            setWebsites: function ( media, websites ) {
                return post( media, '/websites', websites );
            },

            getTwitterRefs: function ( media ) {
                return get( media, '/twitterRefs' );
            },

            setTwitterRefs: function ( media, twitterrefs ) {
                return post( media, '/twitterRefs', twitterrefs );
            },

            getGenres: function ( media ) {
                return get( media, '/genres' );
            },

            setGenres: function ( media, genres ) {
                return post( media, '/genres', genres );
            },

            getIntentions: function ( media ) {
                return get( media, '/intentions' );
            },

            setIntentions: function ( media, intentions ) {
                return post( media, '/intentions', intentions );
            },

            removeIntentions: function ( media ) {
                return del( media, '/intentions' );
            },

            getTargetGroups: function ( media ) {
                return get( media, '/targetGroups' );
            },

            setTargetGroups: function ( media, targetGroups ) {
                return post( media, '/targetGroups', targetGroups );
            },

            removeTargetGroups: function ( media ) {
                console.log( 'remove' )
                return del( media, '/targetGroups' );
            },

            getTags: function ( media ) {
                return get( media, '/tags' );
            },

            setTags: function ( media, tags ) {
                return post( media, '/tags', tags );
            },

            getImages: function ( media ) {
                return get( media, '/images' );
            },

            saveImage: function ( media, image ) {
                return post( media, '/images', image );
            },

            moveImage: function ( media, from, to ) {
                return put( media, '/images', { from: from, to: to } );
            },

            removeImage: function ( media, image ) {
                return del( media, '/images/' + image.id );
            },

            getLocations: function ( media ) {
                return get( media, '/locations' );
            },

            saveLocation: function ( media, location ) {
                return post( media, '/locations', location );
            },

            removeLocation: function ( media, location ) {
                return del( media, '/locations/' + location.id );
            },

            getPredictions: function ( media ) {
                return get( media, '/predictions' );
            },

            savePrediction: function ( media, prediction ) {
                return post( media, '/prediction', prediction );
            },

            getSegments: function ( media ) {
                return get( media, '/segments' );
            },

            saveSegment: function ( media, segment ) {
                return post( media, '/segments', segment );
            },

            removeSegment: function ( media, segment ) {
                return del( media, '/segments/' + segment.id );
            },

            getEpisodes: function ( media ) {
                return get( media, '/episodes' );
            },

            moveEpisode: function ( media, from, to ) {
                return put( media, '/episodes', { from: from, to: to } );
            },

            updateEpisode: function ( media, episode ) {
                return post( media, '/episodes/' + episode.id, episode );
            },

            removeEpisode: function ( media, episode ) {
                return del( media, '/episodes/' + episode.id );
            },

            addEpisode: function ( media, mids ) {
                return post( media, '/episodes', mids );
            },

            removeEpisodeOf: function ( media, episodeRef ) {
                return del( media, '/episodeOf/' + episodeRef.refId );
            },

            addEpisodeOf: function ( media, mids ) {
                return post( media, '/episodeOf', mids );
            },

            getMembers: function ( media ) {
                return get( media, '/members' );
            },

            moveMember: function ( media, from, to ) {
                return put( media, '/members', { from: from, to: to } );
            },

            updateMember: function ( media, member ) {
                return post( media, '/members/' + member.id, member );
            },

            removeMember: function ( media, member ) {
                return del( media, '/members/' + member.id );
            },

            addMember: function ( media, mids ) {
                return post( media, '/members', mids );
            },

            removeMemberOf: function ( media, memberRef ) {
                return del( media, '/memberOf/' + memberRef.refId );
            },

            addMemberOf: function ( media, mids ) {
                return post( media, '/memberOf', mids );
            },

            getRelations: function ( media ) {
                return get( media, '/relations' );
            },

            saveRelation: function ( media, relation ) {
                return post( media, '/relations', relation );
            },

            removeRelation: function ( media, relation ) {
                return del( media, '/relations/' + relation.id );
            },

            getScheduleEvents: function ( media ) {
                return get( media, '/scheduleevents' );
            },

            saveScheduleEvent: function ( media, scheduleEvent ) {
                return post( media, '/scheduleevents/' + scheduleEvent.id, scheduleEvent );
            },

            publish: function ( media) {
                return post( media, '/publish', {} );
            },

            postLink: function ( media, link) {
                return post( media, link, {} );
            },

            getHistory: function ( media, offset, max ) {
                return get( media, '/history', { params: { offset: offset || 0, max: max || 30 } } );
            },

            tooManyDescendants: function ( type, error, message ) {

                return $modal.open( {
                    templateUrl: 'media/modal-too-many-descendants.html',
                    windowClass: 'modal-descendants',
                    controller: 'TooManyDescendantsController',
                    controllerAs: 'tooManyDescendantsController',
                    resolve: {
                        type: function () {
                            return type;
                        },
                        message: function () {
                            return message;
                        },
                        max: function () {
                            return error.max;
                        },
                        count: function () {
                            return error.count;
                        }
                    }
                } );
            }
        };

        return new MediaService();
    }
] );
