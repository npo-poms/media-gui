angular.module( 'poms.media.services' ).factory( 'MediaService', [
    '$rootScope',
    '$q',
    '$http',
    '$modal',
    'localStorageService',
    'appConfig',
    function ( $rootScope, $q, $http, $modal, localStorageService, appConfig ) {

        var readPermissions = {
                'media': 1 << 0,
                'broadcasters': 1 << 0,
                'portals': 1 << 0,
                'languages': 1 << 0,
                'countries': 1 << 0,
                'avType': 1 << 0,
                'mainTitle': 1 << 0,
                'subTitle': 1 << 0,
                'shortTitle': 1 << 0,
                'abbreviationTitle': 1 << 0,
                'workTitle': 1 << 0,
                'originalTitle': 1 << 0,
                'lexicoTitle': 1 << 0,
                'mainDescription': 1 << 0,
                'subDescription': 1 << 0,
                'shortDescription': 1 << 0,
                'kickerDescription': 1 << 0,
                'persons': 1 << 0,
                'relations': 1 << 0,
                'websites': 1 << 0,
                'publication': 1 << 0,
                'year': 1 << 0,
                'embeddable': 1 << 0,
                'isDubbed': 1 << 0,
                'tags': 1 << 0,
                'duration': 1 << 0,
                'predictions': 1 << 0,
                'locations': 1 << 0,
                'segments': 1 << 0,
                'episodes': 1 << 0,
                'episodeOf': 1 << 0,
                'members': 1 << 0,
                'memberOf': 1 << 0,
                'images': 1 << 0,
                'genres': 1 << 0,
                'ageRating': 1 << 0,
                'contentRatings': 1 << 0,
                'geoRestrictions': 1 << 0,
                'portalRestrictions': 1 << 0,
                'twitterRefs': 1 << 0,
                'scheduleEvents': 1 << 0,
                'subtitles': 1 << 0
            },
            writePermissions = {
                'media': 1 << 12,
                'broadcasters': 1 << 12,
                'portals': 1 << 12,
                'languages': 1 << 19,
                'countries': 1 << 19,
                'avType': 1 << 12,
                'mainTitle': 1 << 12,
                'subTitle': 1 << 12,
                'shortTitle': 1 << 12,
                'abbreviationTitle': 1 << 12,
                'workTitle': 1 << 12,
                'originalTitle': 1 << 12,
                'lexicoTitle': 1 << 12,
                'mainDescription': 1 << 12,
                'subDescription': 1 << 12,
                'shortDescription': 1 << 12,
                'kickerDescription': 1 << 12,
                'relations': 1 << 12,
                'persons': 1 << 12,
                'websites': 1 << 12,
                'publication': 1 << 13,
                'year': 1 << 12,
                'embeddable': 1 << 12,
                'isDubbed': 1 << 12,
                'tags': 1 << 12,
                'duration': 1 << 14,
                'predictions': 1 <<15,
                'locations': 1 << 15,
                'segments': 1 << 12,
                'episodes': 1 << 24,
                'episodeOf': 1 << 16,
                'members': 1 << 25,
                'memberOf': 1 << 17,
                'images': 1 << 18,
                'imagesUpload': 1 << 3,
                'genres': 1 << 19,
                'ageRating': 1 << 20,
                'contentRatings': 1 << 20,
                'geoRestrictions': 1 << 21,
                'portalRestrictions': 1 << 12,
                'twitterRefs': 1 << 12,
                'scheduleEvents': 1 << 12,
                'subtitles': 1 << 12
            },

            deletePermission = 1 << 30,

            mergePermission = 1 << 29,

            storageService = localStorageService,

            baseUrl = appConfig.apihost + '/gui/media',

            get = function ( media, path, config ) {
                var deferred = $q.defer();
                var url = baseUrl + '/' + media.mid + path;
                $http.get(url, config )
                    .success( function ( result ) {
                        deferred.resolve( result );
                    } )
                    .error( function ( error ) {
                        deferred.reject( error );
                    }
                    );

                return deferred.promise;
            },

            post = function ( media, path, body ) {

                var deferred = $q.defer();
                var url = baseUrl + '/' + media.mid + path;

                $http.post( url, body )
                    .success( function ( media ) {
                        deferred.resolve( media );
                    } )
                    .error( function ( error ) {
                        deferred.reject( error );
                    } );

                return deferred.promise;
            },

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
            },

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
                return (media.permission & readPermissions[permission]) > 0;
            },

            hasWritePermission: function ( media, permission ) {
                return (media[permission] && media[permission].mayWrite) || ((media.permission & writePermissions[permission]) > 0);
            },

            hasDeletePermission: function ( media ) {
                return (media.permission & deletePermission) > 0;
            },

            hasMergePermission: function ( media ) {
                return (media.permission & mergePermission) > 0 && media.mergedFrom.length == 0;
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
                $http.get( baseUrl + '/' + mid)
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

            getOwnerData: function ( media , owner) {
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

            setTitle: function ( media, type, text ) {
                if ( ! text || text === "" ) {
                    return del( media, '/titles/' + type );
                }
                var data = {'type': type, 'text': text};
                return post( media, '/titles',  data);
            },

            setDescription: function ( media, type, text ) {
                if ( ! text || text === "" ) {
                    return del( media, '/descriptions/' + type );
                }
                return post( media, '/descriptions', {'type': type, 'text': text} );
            },

            setPublication: function ( media, data ) {
                if ( ! data || ( ! data.start && ! data.stop ) ) {
                    return del( media, '/publication/' );
                }
                return post( media, '/publication', data );
            },

            setDuration: function ( media, data ) {
                if ( ! data ) {
                    return del( media, '/duration/' );
                }
                return post( media, '/duration', {'duration': data} );
            },

            setEmbeddable: function ( media, embeddable ) {
                return post( media, '/embeddable', {'value': embeddable} );
            },

            setIsDubbed: function (media, isDubbed) {
                return post(media, '/isdubbed', {'value': isDubbed});
            },
            setOrdered: function ( media, ordered ) {
                return post( media, '/ordered', {'value': ordered} );
            },

            setYear: function ( media, data ) {
                if ( ! data ) {
                    return del( media, '/year/' );
                }
                return post( media, '/year', {'year': data} );
            },

            setAgeRating: function ( media, ageRating ) {
                if ( ! ageRating ) {
                    return del( media, '/ageRating/' );
                }
                return post( media, '/ageRating', ageRating );
            },

            setContentRatings: function ( media, contentRatings ) {
                if ( ! contentRatings ) {
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

            getPersons: function ( media ) {
                return get( media, '/persons' );
            },

            setPerson: function ( media, person ) {
                return post( media, '/persons', person );
            },

            removePerson: function ( media, person ) {
                return del( media, '/persons/' + person.id );
            },

            movePerson: function ( media, from, to ) {
                return put( media, '/persons', {from: from, to: to} );
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
                return put( media, '/images', {from: from, to: to} );
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
                return post( media, '/prediction', prediction);
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
                return put( media, '/episodes', {from: from, to: to} );
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
                return put( media, '/members', {from: from, to: to} );
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
                return post( media, '/scheduleevents/'  + scheduleEvent.id  , scheduleEvent );
            },

            getHistory: function ( media, offset, max ) {
                return get( media, '/history', {params: {offset: offset || 0, max: max || 30}} );
            },

            tooManyDescendants : function ( type, error, message ) {

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
