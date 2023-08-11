angular.module( 'poms.media.controllers' ).controller( 'MembersController', [
    '$scope',
    '$modal',
    'PomsEvents',
    'EditorService',
    'GuiService',
    'SearchFactory',
    'SearchService',
    'MediaService',
    (function () {

        function MembersController ( $scope, $modal, PomsEvents, EditorService, GuiService, SearchFactory, SearchService, mediaService ) {

            this.$scope = $scope;
            this.$modal = $modal;
            this.pomsEvents = PomsEvents;
            this.editorService = EditorService;
            this.guiService = GuiService;
            this.searchFactory = SearchFactory;
            this.searchService = SearchService;
            this.mediaService = mediaService;

            this.mayWrite = function() {
                return this.mediaService.hasWritePermission( $scope.media, 'media' ) && this.$scope.type === 'episodes' ? this.mediaService.hasWritePermission( $scope.media, 'episodes' ) : this.mediaService.hasWritePermission( $scope.media, 'members' );
            }.bind(this);


            this.$scope.waiting = false;
            this.$scope.displayQuantity = 10;

            $scope.sortableOptions = {
                handle: '.sort-handle',
                update: function ( event, ui ) {
                    var moveMethod = $scope.type === 'episodes' ? 'moveEpisode' : 'moveMember';

                    var to = ui.item.index();
                    if ( this.from >= 0 && to !== this.from ) {
                        $scope.waiting = true;
                        this.mediaService[moveMethod]( $scope.media, this.from, to ).then(
                            function ( media ) {
                                this.load();
                                angular.copy( media, $scope.media );
                            }.bind( this ),
                            function ( error ) {
                                $scope.$emit( this.pomsEvents.error, error )
                            }.bind( this )
                        ).finally( function () {
                                $scope.waiting = false;
                            }.bind( this ) );
                    } else if ( this.from < 0 ) {
                        this.load();
                    }

                    this.from = - 1;
                }.bind( this ),
                start: function ( event, ui ) {
                    this.from = ui.item.index();
                }.bind( this ),
                items: "tr:not(.not-sortable)"
            };

            this.load();

            $scope.$on( $scope.type === 'episodes' ? PomsEvents.episodeAdded : PomsEvents.memberAdded, function ( e, mid ) {
                if ( mid === $scope.media.mid ) {
                    this.load();
                }
            }.bind( this ) );

            $scope.$on( $scope.type === 'episodes' ? PomsEvents.episodeRemoved : PomsEvents.memberRemoved, function ( e, mid ) {
                if ( mid === $scope.media.mid ) {
                    this.load();
                }
            }.bind( this ) );

            $scope.$on(PomsEvents.externalChange, function(e, mid) {
                 if(mid === $scope.media.mid) {
                    this.load();
                }
            }.bind(this));


        }

        MembersController.prototype = {

            from: - 1,

            load: function () {
                var loadMethod = this.$scope.type === 'episodes' ? 'getEpisodes' : 'getMembers';
                this.$scope.waiting = true;
                this.$scope.$emit( this.pomsEvents.loaded, {'section': this.$scope.type, 'waiting': true} );

                this.mediaService[loadMethod]( this.$scope.media )
                    .then( function ( members ) {
                        this.$scope.members = members;

                        // update counts
                        if ( this.$scope.type === 'episodes' ) {
                            this.$scope.media.episodes = members.length;
                        } else {
                            this.$scope.media.members = members.length;
                        }
                    }.bind( this ), function ( error ) {
                        this.$scope.$emit( 'error', error )
                    }.bind( this ) )
                    .finally( function () {
                        this.$scope.waiting = false;
                        this.$scope.$emit( this.pomsEvents.loaded, {'section': this.$scope.type, 'waiting': false} );
                    }.bind( this ) );

            },

            remove: function ( member ) {
                var removeMethod = this.$scope.type === 'episodes' ? 'removeEpisode' : 'removeMember';

                return this.mediaService[removeMethod]( this.$scope.media, member ).then(
                    function ( media ) {
                        this.load();

                        angular.copy( media, this.$scope.media );

                        if ( this.$scope.type === 'episodes' ) {
                            this.guiService.removedEpisodeOf( member.mid );
                        } else {
                            this.guiService.removedMemberOf( member.mid );
                        }
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) );
            },

            edit: function ( rowform ) {
                if ( ! rowform.$visible ) {
                    rowform.$show();
                }
            },

            cancel: function ( index, rowform ) {
                rowform.$cancel();
            },

            editRef: function ( mid ) {
                return '#/edit/' + mid;
            },

            openInEditor: function ( e, mid, rowform ) {
                e.preventDefault();
                e.stopPropagation();
                if ( ! rowform.$visible ) {
                    window.location.href = this.editRef( mid );
                }
            },


            updateMember: function ( member, data ) {

                data.id = member.id;

                var updateMethod = this.$scope.type === 'episodes' ? 'updateEpisode' : 'updateMember';

                this.mediaService[updateMethod]( this.$scope.media, data ).then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media );
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error )
                    }.bind( this )
                ).finally(
                    function () {
                        this.load();
                    }.bind( this )
                )
            },

            mayDelete: function ( memberRef, data ) {
                return this.mediaService.hasDeletePermission( memberRef );
            },
            sortable: function(media) {
                return this.mayWrite() && (media.orderable || (this.$scope.type === 'episodes'));
            },

            addMember: function () {
                var addMethod,
                        addEventMethod,
                        search;

                if(this.$scope.type === 'episodes') {
                    addMethod = 'addEpisode';
                    addEventMethod = 'addedEpisodeOf';
                    search = this.searchFactory.newEpisodesSearch({parentMid : this.$scope.media.mid});
                } else {
                    addMethod = 'addMember';
                    addEventMethod = 'addedMemberOf';
                    search = this.searchFactory.newMembersSearch({parentMid : this.$scope.media.mid})
                }

                this.searchService.searchMediaInModal( search ).then( function ( results ) {
                    if ( results ) {
                        this.$scope.waiting = true;

                        this.$scope.$emit( this.pomsEvents.loaded, {'section': this.$scope.type, 'waiting': true } );

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
                                    if(this.$scope.type === 'episodes') {
                                        type = 'afleveringen';
                                        message = 'Ik probeer [' + _.map(results, function(result) {return ' ' + result.mid + ' '}).join()+ '] als aflevering toe te voegen bij ' + this.$scope.media.mid;
                                    } else {
                                        type = 'onderdelen';
                                        message = 'Ik probeer [' + _.map(results, function(result) {return ' ' + result.mid + ' '}).join()+ '] als onderdeel toe te voegen bij ' + this.$scope.media.mid;
                                    }
                                    this.mediaService.tooManyDescendants( type, error, message );
                                    return;
                                }

                                this.$scope.$emit( this.pomsEvents.error, error )
                            }.bind( this )
                        ).finally(
                            function () {
                                this.load();
                                this.$scope.waiting = false;
                                this.$scope.$emit( this.pomsEvents.loaded, {'section': this.$scope.type, 'waiting': false } );
                            }.bind( this )
                        );
                    }
                }.bind( this ) );
            },

            onRemoveMember : function(){
                this.load();
            },

            showAllMembers : function(){
                this.$scope.displayQuantity = this.$scope.members.length;
            },

            locationTypes : function( locations ){
                var uniqueLocations = [];
                for ( var i = 0; i < locations.length; i ++ ) {
                    if ( uniqueLocations.indexOf( locations[i].format ) === -1 ){
                        uniqueLocations.push( locations[i].format );
                    }

                }
                return uniqueLocations;

            },

            toggleOrdered: function () {

                var modal = this.$modal.open( {
                    controller: 'ConfirmController',
                    controllerAs: 'controller',
                    templateUrl: 'util/confirm.html',
                    windowClass: 'modal-confirm',
                    resolve: {
                        title: function () {
                            return 'Geordende lijst';
                        },
                        message: function () {

                            if ( !this.$scope.media.ordered ) {
                                return "Weet je zeker dat je de ordening van deze onderdelen wilt verwijderen? Dit kan niet ongedaan worden gemaakt";
                            } else {
                                return "Weet je zeker dat je van deze lijst een geordende lijst wilt maken?"
                            }
                        }.bind(this),
                        cancel: function () {
                            return 'annuleer';
                        },
                        submit: function () {
                            return 'ok';
                        }
                    }
                } );

                modal.result.then(
                    function () {
                        this.mediaService.setOrdered( this.$scope.media, this.$scope.media.ordered ).then(
                            function ( results ) {
                                this.load();
                            }.bind(this),
                            function ( error ) {
                                if ( error.cause === "TOO_MANY_PUBLICATIONS" ) {
                                    var type, message;
                                    if(this.$scope.media.ordered) {
                                        type = 'ordenen lijst';
                                        message = 'Ik probeer de onderdelen bij ' + this.$scope.media.mid + ' te ordenen';
                                    } else {
                                        type = 'ordenen lijst';
                                        message = 'Ik probeer de onderdelen bij ' + this.$scope.media.mid + ' ongeordend te maken';
                                    }
                                    this.mediaService.tooManyDescendants( type, error, message );
                                    return;
                                }

                                this.$scope.$emit( this.pomsEvents.error, error )
                            }.bind(this) )
                    }.bind( this ),
                    function () {
                        this.$scope.media.ordered = !this.$scope.media.ordered;
                    }.bind(this)
                );
            }

        };

        return MembersController;
    }())
] );
