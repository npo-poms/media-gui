angular.module( 'poms.media.controllers' ).controller( 'MediaController', [
    '$scope',
    '$document',
    '$element',
    '$modal',
    '$window',
    'EditorService',
    'GuiService',
    'MediaService',
    'MergeService',
    'ListService',
    'NotificationService',
    'PomsEvents',
    (function () {

        function MediaController (  $scope, $document, $element, $modal, $window, EditorService, GuiService, MediaService, MergeService, ListService, NotificationService, PomsEvents ) {

            $scope.showMid = true;

            this.$scope = $scope;

            this.editorService = EditorService;
            this.guiService = GuiService;
            this.mediaService = MediaService;
            this.mergeService = MergeService;
            this.pomsEvents = PomsEvents;
            this.listService = ListService;
            this.notificationService = NotificationService;

            this.$document = $document;
            this.$modal = $modal;
            this.$element = $element;
            this.$scope.sidebarFixed = false;
            this.$scope.predictionsWaiting = true;
            this.$scope.locationsWaiting = true;
            this.$scope.episodesWaiting = true;
            this.$scope.imagesWaiting = true;
            this.$scope.membersWaiting = true;
            this.$scope.relationsWaiting = true;
            this.$scope.segmentsWaiting = true;


            $scope.$on( PomsEvents.publication, function ( e, publication ) {
                if ( publication.mid === $scope.media.mid ) {
                    var message = '<span><a href="#/edit/' + $scope.media.mainTitle.text + '">' + $scope.media.mainTitle.text + '</a></span>';
                    send = false;
                    if (publication.workflow.id !== $scope.media.workflow.id) {
                        message += '<span> is nu ' + publication.workflow.text + '</span>';
                        send = true;
                    }
                    if (publication.editor.id !== editor.id && publication.hasChanges !== 'NO_CHANGES') {
                        message += '<span> is aangepast door ' +  publication.editor.text + '</span>';
                        send = true;
                        this.load()
                    }
                    if (send) {
                        this.notificationService.notify(message);
                    }

                }
            }.bind( this ) );

            $scope.$on( PomsEvents.memberOfAdded, function ( e, episodeMid ) {
                if ( episodeMid === $scope.media.mid ) {
                    this.load()
                }
            }.bind( this ) );

            $scope.$on( PomsEvents.memberOfRemoved, function ( e, episodeMid ) {
                if ( episodeMid === $scope.media.mid ) {
                    this.load()
                }
            }.bind( this ) );

            $scope.$on( PomsEvents.episodeOfAdded, function ( e, episodeMid ) {
                if ( episodeMid === $scope.media.mid ) {
                    this.load()
                }
            }.bind( this ) );

            $scope.$on( PomsEvents.episodeOfRemoved, function ( e, episodeMid ) {
                if ( episodeMid === $scope.media.mid ) {
                    this.load()
                }
            }.bind( this ) );


            $scope.$on( 'editFieldOpen', function ( e, element ) {
                this.editFieldOpen = ( element.isOpen ? true : false);
                this.editField = element.field;
            } );

            angular.element( $window ).on( 'keydown', function ( e ) {
                if ( this.editFieldOpen && e.keyCode == 27 ) {
                    $scope.$broadcast( 'closeEditField', { 'field' : this.editField } );
                }
            } );


            $scope.$on( PomsEvents.loaded, function ( event, loading ) {
                if ( ! loading.section ) {
                    return
                }
                switch ( loading.section ) {
                    case 'predictions':
                        this.$scope.predictionsWaiting = loading.waiting;
                        break;
                    case 'locations':
                        this.$scope.locationsWaiting = loading.waiting;
                        break;
                    case 'episodes':
                        this.$scope.episodesWaiting = loading.waiting;
                        break;
                    case 'images':
                        this.$scope.imagesWaiting = loading.waiting;
                        break;
                    case 'members':
                        this.$scope.membersWaiting = loading.waiting;
                        break;
                    case 'relations':
                        this.$scope.relationsWaiting = loading.waiting;
                        break;
                    case 'segments':
                        this.$scope.segmentsWaiting = loading.waiting;
                        break;
                }
            }.bind( this ) );


        }

        MediaController.breadCrumbs = function ( scope, media ) {
            var answer = [],
                crumb = media.breadCrumbs;

            while ( crumb ) {
                answer.push( {
                    mid : crumb.id,
                    type : crumb.type.text,
                    title : crumb.text,
                    number : crumb.number,
                    sequenceInfo : crumb.sequenceInfo
                } );
                crumb = crumb.child;
            }
            if ( ! answer.length ) {
                answer.push( {
                    mid : media.id,
                    type : media.type.text,
                    title : media.mainTitle.text,
                    number : media.number,
                    sequenceInfo : media.sequenceInfo
                } );
            }
            scope.breadCrumbs = answer;
        };

        MediaController.prototype = {

            init : function () {

                MediaController.breadCrumbs( this.$scope, this.$scope.media );

                this.initScrollSpy();
                this.$scope.mayWrite = this.mediaService.hasWritePermission( this.$scope.media, 'media' );
                this.$scope.mayDelete = this.mediaService.hasDeletePermission( this.$scope.media );
                this.$scope.mayMerge = this.mediaService.hasMergePermission( this.$scope.media );

                this.$scope.numberOfButtons = 0 + (! this.$scope.mayWrite) + this.$scope.mayDelete + this.$scope.mayMerge;
                //console.log("May write: ", this.$scope.mayWrite, "May delete:", this.$scope.mayDelete, "may Merge", this.$scope.mayMerge);
                this.editorService.getAllowedBroadcasters().then(
                    function ( data ) {
                        this.$scope.allowedBroadcasters = data;
                    }.bind( this ),
                    function () {
                        this.$scope.allowedBroadcasters = {};
                    }.bind( this )
                );

                this.editorService.getAllowedPortals().then(
                    function ( data ) {
                        this.$scope.allowedPortals = data;
                    }.bind( this ),
                    function () {
                        this.$scope.allowedPortals = {};
                    }.bind( this )
                );


                this.listService.getAvTypes().then(
                    function ( data ) {
                        this.$scope.avTypes = data;
                    }.bind( this ),
                    function () {
                        this.$scope.avTypes = {};
                    }.bind( this )
                );


                this.listService.getAgeRatings().then(
                    function ( data ) {
                        this.$scope.ageRatings = data;
                    }.bind( this ),
                    function () {
                        this.$scope.ageRatings = {};
                    }.bind( this )
                );


                this.listService.getContentRatings().then(
                    function ( data ) {
                        this.$scope.contentRatings = data;
                    }.bind( this ),
                    function () {
                        this.$scope.contentRatings = {};
                    }.bind( this )
                );

            },

            initScrollSpy : function () {

                // function needs timout because section that have an ng-if are not ready yet.
                setTimeout( function () {
                    this.scrollElement = this.$element.parent().parent();
                    this.sidebar = this.$element.find( '.media-item-navigation' );
                    this.sidebarSections = this.$element.find( '.media-item-navigation-link' );
                    this.sections = this.$element.find( '.media-section' );
                    this.sectionsAmount = this.sections.length;

                    this.scrollElement.on( 'scroll', function () {

                        // fix sidebar to top
                        var scrollPos = this.scrollElement.scrollTop();
                        if ( scrollPos > 50 && ! this.$scope.sidebarFixed ) {

                            var offset = $( '.nav-tabs' ).height() + 97;
                            $( this.sidebar ).css( { 'top' : offset } );

                            this.$scope.sidebarFixed = true;
                            this.$scope.$apply();
                        } else if ( scrollPos < 50 && this.$scope.sidebarFixed ) {
                            $( this.sidebar ).css( { 'top' : 0 } );

                            this.$scope.sidebarFixed = false;
                            this.$scope.$apply();
                        }

                        //monitor active section
                        for ( var i = 0; i < this.sectionsAmount - 1; i ++ ) {
                            var $el = $( this.sections[ i ] );
                            var $nextEl = $( this.sections[ i + 1 ] );

                            var elPosition = $el.position();
                            var nextElPosition = $nextEl.position();

                            if ( scrollPos < nextElPosition.top - 100 && scrollPos > elPosition.top - 100 ) {
                                if ( ! $( this.sidebarSections[ i ] ).hasClass( 'active' ) ) {
                                    $( '.media-item-navigation-link.active' ).removeClass( 'active' );
                                    $( this.sidebarSections[ i ] ).addClass( 'active' )
                                }
                            }

                        }

                    }.bind( this ) );
                }.bind( this ), 0 )
            },

            editRef : function ( mid ) {
                return '#/edit/' + mid;
            },

            sectionId : function ( section ) {
                return 'media-' + section + '-' + this.$scope.media.mid;
            },

            goTo : function ( section ) {
                var element = this.$element.find( '#' + this.sectionId( section ) );
                if ( element.length > 0 ) {
                    this.scrollElement.scrollToElementAnimated( element, 100, 1000 );
                }
            },

            load : function () {
                this.mediaService.load( this.$scope.media.mid ).then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media );
                        MediaController.breadCrumbs( this.$scope, this.$scope.media )
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error )
                    }.bind( this )
                );
            },

            merge : function () {
                this.mergeService.merge( this.$scope.media );
            },


            delete : function () {
                this.mediaService.delete( this.$scope.media ).then(
                    function ( media ) {
                        this.guiService.deleted( media.mid );
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error )
                    }.bind( this )
                );
            },

            onDeleteAncestor : function () {
                this.load();
            },

            editHistory : function () {

                var modal = this.$modal.open( {
                    resolve : {
                        title : function () {
                            return 'Alle wijzigingen';
                        },
                        media : function () {
                            return this.$scope.media;
                        }.bind( this ),
                        mediaService : function () {
                            return this.mediaService;
                        }.bind( this )
                    },
                    controller : "EditHistoryController",
                    controllerAs : "EditHistoryController",
                    templateUrl : 'edit/modal-history.html'

                } );
            }

        };

        return MediaController;
    }())
] );
