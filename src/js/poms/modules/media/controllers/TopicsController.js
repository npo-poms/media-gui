angular.module( 'poms.media.controllers' ).controller( 'TopicsController', [
    '$scope',
    '$q',
    '$uibModal',
    'PomsEvents',
    'MediaService',
    'EditorService',
    'GTAAService',
    ( function () {

        function load ( scope, pomsEvents, mediaService, media, dest ) {
            mediaService.getTopics( media ).then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    scope.$emit( pomsEvents.error, error )
                }
            )
        }
        function TopicsController ( $scope, $q, $uibModal, pomsEvents, mediaService, editorService, gtaaService) {

            this.items = [];
            this.$scope = $scope;
            this.$q = $q;
            this.$uibModal = $uibModal;

            this.media = $scope.media;
            this.pomsEvents = pomsEvents;

            this.mediaService = mediaService;
            this.editorService = editorService;
            this.gtaaService = gtaaService;


            this.mayWrite = function() {
                return mediaService.hasWritePermission( $scope.media, $scope.permission );
            }.bind(this);
            this.mayRead = function() {
                return mediaService.hasReadPermission( $scope.media, $scope.permission );
            }.bind(this);
            this.currentOwnerType = editorService.getCurrentOwnerType();

            load( $scope, this.pomsEvents, this.mediaService, this.media, this.items );

            $scope.$on( pomsEvents.externalChange, function ( e, mid ) {
                if ( mid === $scope.media.mid ) {
                    this.load();
                }
            }.bind( this ) );

        }

        TopicsController.prototype = {

            editTopic: function (item) {
                this.gtaaService.modal(
                    "Zoek een onderwerp in GTAA",
                    "topic",
                    item,
                    function ( concept, role ) {
                        const parsedTopic = this.parseTopic(concept, role);
                        parsedTopic.id = item ? item.id : null;
                        this.saveTopic(parsedTopic);
                    }.bind(this));
            },

            addTopic: function ( item ) {
                this.editTopic( item );
            },

            saveTopic: function (parsedTopic) {
                this.mediaService.addTopic(this.media, parsedTopic).then(
                    function ( data ) {
                        angular.copy(data, this.items);
                    }.bind(this),
                    function( error) {
                        this.errorHandler(error);
                    }.bind(this)
                )
            },

            removeOverride: function () {
                this.mediaService.removeTopics(this.media).then(
                    function (data) {
                        angular.copy(data, this.items);
                    }.bind(this),
                    function( error) {
                        this.errorHandler(error);
                    }.bind(this)
                )
            },

            errorHandler: function(error) {
                if (error.violations) {
                    for (let violation in  error.violations) {
                        this.$scope.errorText = error.violations[violation];
                        break;
                    }
                } else {
                    this.$scope.$emit(this.pomsEvents.error, error);
                }
            },

            parseTopic: function (concept, role) {
                return {
                    name: concept.name || '',
                    scopeNotes: concept.scopeNotes,
                    gtaaStatus: concept.status || '',
                    gtaaUri: concept.id || '',
                    role: role ? role.name : null
                };
            },

            removeTopic: function ( topic ) {
                return this.mediaService.removeTopic( this.$scope.media, topic ).then(
                    function (data) {
                        angular.copy( data, this.items);
                        return true
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) ).finally(
                    function () {
                        load( this.$scope, this.pomsEvents, this.mediaService, this.media, this.items );
                        return true;
                    }.bind( this )
                );
            }


        };

        return TopicsController;
    }() )
] );
