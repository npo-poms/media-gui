angular.module( 'poms.media.controllers' ).controller( 'EditController', [
    '$scope',
    '$modal',
    '$sce',
    'PomsEvents',
    'EditorService',
    'GuiService',
    'ListService',
    'MediaService',
    'SearchFactory',
    'SearchService',
    (function () {

        function EditController (
            $scope,
            $modal,
            $sce,
            pomsEvents,
            editorService,
            guiService,
            listService,
            mediaService ,
            searchFactory ,
            searchService) {
            this.$scope = $scope;
            this.$modal = $modal;
            this.$sce = $sce;
            this.pomsEvents = pomsEvents;

            this.media = $scope.media;

            this.listService = listService;
            this.mediaService = mediaService;
            this.searchFactory = searchFactory;
            this.searchService = searchService;
            this.editorService = editorService;
            this.guiService = guiService;

            editorService.getAllowedBroadcasters().then(
                function ( data ) {
                    this.allowedBroadcasters = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            editorService.getAllowedPortals().then(
                function ( data ) {
                    this.allowedPortals = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            listService.getBroadcasters().then(
                function ( data ) {
                    this.broadcasters = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            listService.getPortals().then(
                function ( data ) {
                    this.portals = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            listService.getAvTypes().then(
                function ( data ) {
                    this.$scope.avTypes = data.filter(function (avType) {
                        return this.$scope.media.targetAVTypes.indexOf(avType.id) !== -1;
                    }.bind(this));
                    //console.log("ec Types,", this.$scope.avTypes);
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            listService.getAdoptQualityFromPlusOptions($scope.media.clazz === 'group').then(
                function ( data ) {
                    this.$scope.adoptQualityFromPlusOptions = data;
                }.bind(this),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            listService.getAgeRatings().then(
                function ( data ) {
                    this.ageRatings = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );


            listService.getContentRatings().then(
                function ( data ) {
                    this.contentRatings = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            listService.getPersonRoles().then(
                function ( data ) {
                    this.personRoles = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            listService.getRegions().then(
                function ( data ) {
                    this.regions = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            listService.getPlatforms().then(
                function ( data ) {
                    this.platforms = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            // remove comments for MSE-3377
             listService.getCountries().then(
                 function ( data ) {
                     this.countries = data;
                 }.bind( this ),
                 function ( error ) {
                     $scope.$emit( pomsEvents.error, error )
                 }.bind( this )
             );

             listService.getLanguages().then(
                 function ( data ) {
                     this.languages = data;
                 }.bind( this ),
                 function ( error ) {
                     $scope.$emit( pomsEvents.error, error )
                 }.bind( this )
            );

             listService.getSubtitlesTypes().then(
                function ( data ) {
                    this.subtitlesTypes = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            $scope.$on( 'nextField', function( e ){
                var nextElement = angular.element('.media-field[field="'+ e.targetScope.field +'"]').next('.media-field') ;
                while ( nextElement.length !==0 && nextElement.find('.editfield-wrapper.may-write' ).length === 0 ){
                    nextElement = nextElement.next('.media-field') ;
                }
                if ( nextElement.length !==0  ) {
                    this.$scope.$broadcast( 'openElement', {field: nextElement.attr( 'field' )} );
                }
            }.bind(this) );

            $scope.$on( 'prevField', function( e ){
                var nextElement = angular.element('.media-field[field="'+ e.targetScope.field +'"]').prev('.media-field') ;
                while ( nextElement.length !==0 && nextElement.find('.editfield-wrapper.may-write' ).length === 0 ){
                    nextElement = nextElement.prev('.media-field') ;
                }
                if ( nextElement.length !==0  ){
                    this.$scope.$broadcast('openElement', { field : nextElement.attr('field')} );
                }
            }.bind(this) );

            this.listService = listService;
            this.scope = $scope;
        }

        EditController.prototype = {

            listService: null,

            scope: null,

            allowedBroadcasters: [],

            allowedPortals: [],

            avTypes: [],

            ageRatings: [],

            contentRatings: [],

            geoRestrictions: [],

            portalRestrictions: [],

            nets:[] ,

            languages: [],

            loadTargetTypes: function () {
                this.listService.getMediaTypes().then(
                    function ( data ) {
                        var mediaTypes = data;
                        this.scope.targetTypesObjects = [];
                        if (this.media === undefined) { // happens in test cases....
                            this.scope.$emit(pomsEvents.error, "No media object");
                            return;
                        }
                        angular.forEach(mediaTypes, function (value, key) {
                            if (this.media.targetTypes && this.media.targetTypes.indexOf(value.id) !== -1) {
                                this.scope.targetTypesObjects.push(value);
                            }
                        }.bind(this));
                    }.bind( this ),
                    function (error) {
                        $scope.$emit( pomsEvents.error, error )
                    }.bind( this )
                )
            },

            editRef: function ( mid ) {
                return '#/edit/' + mid;
            },

            genres: function () {
                return this.listService.getGenres();
            },

            getGenres: function () {
                return this.mediaService.getGenres( this.media );
            },

            setGenres: function ( genres ) {
                return this.mediaService.setGenres( this.media, genres );
            },

            tags: function ( text ) {
                return this.listService.getTags( text );
            },

            getTags: function () {
                return this.mediaService.getTags( this.media );
            },

            setTags: function ( tags ) {
                return this.mediaService.setTags( this.media, tags );
            },

            getWebsites: function () {
                return this.mediaService.getWebsites( this.media );
            },

            setWebsites: function ( websites ) {
                return this.mediaService.setWebsites( this.media, websites );
            },

            getTwitterRefs: function () {
                return this.mediaService.getTwitterRefs( this.media );
            },

            setTwitterRefs: function ( twitterrefs ) {
                return this.mediaService.setTwitterRefs( this.media, twitterrefs );
            },

            getEmail: function () {
                return this.mediaService.getEmail( this.media );
            },

            setEmail: function ( email ) {
                return this.mediaService.setEmail( this.media, email );
            },

            allowedPortalRestrictions: function () {
                return this.editorService.getAllowedPortals();
            },
            getPortalRestrictionColumns: function() {
                return [
                    {'text': 'Portal', 'id': 'portal', 'helpField': 'editor.general.portalRestriction.portal'},
                    {'text': 'Online vanaf', 'id': 'start', 'helpField': 'editor.general.portalRestriction.start'},
                    {'text': 'Online tot', 'id': 'stop', 'helpField': 'editor.general.portalRestriction.stop'}
                ];
            },

            getPortalRestrictions: function () {
                return this.mediaService.getPortalRestrictions( this.media );
            },

            setPortalRestriction: function ( media, data ) {
                return this.mediaService.setPortalRestriction( media, data );
            },

            removePortalRestriction: function ( media, data ) {
                return this.mediaService.removePortalRestriction( media, data );
            },

            movePortalRestriction: function ( media, from, to ) {
                return this.mediaService.movePortalRestriction( media, from, to );
            },

            allowedGeoRestrictions: function () {
                return this.listService.getRegions();
            },
            getGeoRestrictionColumns: function() {
                return [
                    {'text': 'Regio', 'id': 'region', 'helpField': 'editor.general.geoRestriction.region'},
                    {'text': 'Platform', 'id': 'platform', 'helpField': 'editor.general.geoRestriction.platform'},
                    {'text': 'Online vanaf', 'id': 'start', 'helpField': 'editor.general.geoRestriction.start'},
                    {'text': 'Online tot', 'id': 'stop', 'helpField': 'editor.general.geoRestriction.stop'}
                ];
            },

            allowedPlatforms : function () {
                return this.listService.getPlatforms();
            },

            getGeoRestrictions: function () {
                return this.mediaService.getGeoRestrictions( this.media );
            },

            setGeoRestriction: function ( media, data ) {
                return this.mediaService.setGeoRestriction( media, data );
            },

            removeGeoRestriction: function ( media, data ) {
                return this.mediaService.removeGeoRestriction( media, data );
            },

            moveGeoRestriction: function ( media, from, to ) {
                return this.mediaService.moveGeoRestriction( media, from, to );
            },

            allowedRoles: function () {
                return this.listService.getPersonRoles();
            },

            getCredits: function () {
                return this.mediaService.getCredits( this.media );
            },

            setCredits: function ( media, data ) {
                return this.mediaService.setCredits( media, data );
            },


            removeCredits: function ( media, data ) {
                return this.mediaService.removeCredits( media, data );
            },

            moveCredits: function ( media, from, to ) {
                return this.mediaService.moveCredits( media, from, to );
            },

            getGeoLocations: function () {
                return this.mediaService.getGeoLocations( this.media );
            },

            setGeoLocation: function ( media, data ) {
                return this.mediaService.setGeoLocation( media, data );
            },

            getTopics: function () {
                return this.mediaService.getTopics( this.media );
            },

            setTopic: function ( media, data ) {
                return this.mediaService.setTopic( media, data );
            },

            mayWriteMemberOf: function ( memberRef ) {
                return true; // This is always allowed (MSE-4669)
            },

            removeMemberOf: function ( media, memberRef ) {
                return this.mediaService.removeMemberOf( media, memberRef ).then(
                    function ( media ) {
                        angular.copy( media, this.media );
                        this.guiService.removedMember(memberRef.id);
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this )
                );
            },

            addMemberOf : function( memberType ){
                var addMethod,
                        addEventMethod,
                        search;

                if(memberType === 'episodeOf') {
                    addMethod = 'addEpisodeOf';
                    addEventMethod = 'addedEpisode';
                    search = this.searchFactory.newEpisodeOfSearch({parentMid : this.$scope.media.mid})
                } else {
                    addMethod = 'addMemberOf';
                    addEventMethod = 'addedMember';
                    search = this.searchFactory.newMemberOfSearch({parentMid : this.$scope.media.mid})
                }

                this.searchService.searchMediaInModal(search).then( function ( results ) {
                    if ( results ) {
                        this.mediaService[addMethod]( this.$scope.media, _.map(results, function(result) {return result.mid;}) ).then(
                            function ( media ) {
                                angular.copy( media, this.$scope.media );

                                _.forEach(results, function(result) {
                                    this.guiService[addEventMethod](result.mid);
                                }, this)
                            }.bind( this ),
                            function ( error ) {
                                if ( error.cause === "TOO_MANY_PUBLICATIONS" ) {
                                    var type, message;
                                    if(memberType === 'episodeOf') {
                                        type = 'aflevering van';
                                        message = 'Ik probeer ' + this.$scope.media.mid + ' aflevering van [' + _.map(results, function(result) {
                                            return ' ' + result.mid + ' '
                                        }).join() + '] te maken';
                                    } else {
                                        type = 'onderdeel van';
                                        message = 'Ik probeer ' + this.$scope.media.mid + ' onderdeel van [' + _.map(results, function(result) {
                                            return ' ' + result.mid + ' '
                                        }).join() + '] te maken';
                                    }
                                    this.mediaService.tooManyDescendants( type, error, message );
                                    return;
                                }
                                this.$scope.$emit( this.pomsEvents.error, error )
                            }.bind( this )
                        );
                    }
                }.bind( this ) );
            },

            mayWriteEpisodeOf: function ( episodeRef ) {
                return this.mediaService.hasWritePermission( episodeRef, 'episodeOf' );
            },

            removeEpisodeOf: function ( media, episodeRef ) {
                return this.mediaService.removeEpisodeOf( media, episodeRef ).then(
                    function ( media ) {
                        angular.copy( media, this.media );
                        this.guiService.removedEpisode(episodeRef.id);
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this )
                );
            },

            mayReadSubtitles: function ( media ) {
                return this.mediaService.hasReadPermission( media, 'subtitles' );
            },

            mayWriteSubtitles: function ( media ) {

                return this.mediaService.hasWritePermission( media, 'subtitles' );
            },

            showAllEvents: function () {

                var modal = this.$modal.open( {
                    resolve: {
                        title: function () {
                            return 'Alle uitzendingen';
                        },
                        media: function () {
                            return this.$scope.media;
                        }.bind( this )
                    },
                    scope: this.$scope,
                    controller: 'ScheduleEventsController',
                    controllerAs: 'scheduleEventsController',
                    templateUrl: 'edit/modal-schedule-events.html'

                } );
            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            },

            showAllOwnerData: function ( owners ) {

                var modal = this.$modal.open({
                    scope: this.$scope,
                    resolve: {
                        title: function(){
                            return 'Alle bronnen';
                        },
                        owners : function(){
                            return owners;
                        },
                        media : function () {
                            return this.media;
                        }.bind( this )
                    },
                    controller : 'OwnersController',
                    controllerAs : 'ownersController',
                    templateUrl: 'edit/modal-owners.html',
                    windowClass: "modal-owners"
                });

            },

            showOwnerData : function( owner ) {

                var modal = this.$modal.open({
                    scope : this.$scope,
                    resolve : {
                        title : function() {
                            return 'Bron: ' + owner.text;
                        },
                        ownerData : function() {
                            return this.mediaService.getOwnerData( this.media, owner.id );
                        }.bind(this),
                        owner: function(){
                            return owner;
                        }
                    },
                    controller : 'OwnerController',
                    controllerAs : 'ownerController',
                    templateUrl: 'edit/modal-owner.html',
                    windowClass: "modal-owner"

                });
            },

            postLink: function ( media, link) {
                return this.mediaService.postLink( media, link, {} );
            },

            showSubtitles: function () {

                var modal = this.$modal.open( {
                    resolve: {
                        title: function () {
                            return 'Alle ondertitels';
                        },
                        languages: function () {
                            return this.languages;
                        }.bind( this ),
                        subtitlesTypes: function () {
                            return this.subtitlesTypes;
                        }.bind( this ),
                        media: function () {
                            return this.media;
                        }.bind( this ),
                        mayWrite: function () {
                            return this.mayWriteSubtitles( this.media )
                        }.bind( this )
                    },
                    scope: this.$scope,
                    controller: 'SubtitlesController',
                    controllerAs: 'subtitlesController',
                    templateUrl: 'media/modal-subtitles.html'

                } );
            },

            uploadSubtitle: function () {
                var modal = this.$modal.open( {
                    resolve: {
                        title: function () {
                            return 'Upload ondertitels';
                        },
                        languages: function () {
                            return this.languages;
                        }.bind( this ),
                        subtitlesTypes: function () {
                            return this.subtitlesTypes;
                        }.bind( this ),
                        media: function () {
                            return this.media;
                        }.bind( this ),
                        mayWrite: function () {
                            return this.mayWriteSubtitles( this.media )
                        }.bind( this )
                    },
                    controller : 'SubtitlesUploadController',
                    controllerAs : 'subtitlesUploadController',
                    templateUrl : 'edit/modal-upload-subtitles.html',
                    windowClass : 'modal-subtitles-upload'
                } );

                //modal.result.then(
                //    function () {
                //        this.load();
                //    }.bind( this )
                //);
            }

        };

        return EditController;
    }())
]);
