angular.module( 'poms.media.controllers' ).controller( 'CreateController', [
    '$scope',
    '$uibModalInstance',
    'EditorService',
    'MediaService',
    'PomsEvents',
    'mediaTypes',
    'avTypes',
    'broadcasters',
    'portals',
    'media',
    'genres',
    (function () {

        function CreateController ( $scope, $uibModalInstance, EditorService, MediaService, PomsEvents, mediaTypes, avTypes, broadcasters, portals, media, genres ) {

            this.$scope = $scope;

            this.$uibModalInstance = $uibModalInstance;
            this.mediaService = MediaService;
            this.editorService = EditorService;
            this.pomsEvents = PomsEvents;

            this.$scope.modalTitle = 'Nieuw object toevoegen';

            this.$scope.media = media;

            this.avTypes = avTypes;
            this.$scope.avTypes = avTypes;
            this.$scope.mediaTypes = mediaTypes;
            this.$scope.broadcasters = broadcasters;
            this.$scope.portals = portals;

            this.$scope.genres = genres;
            this.$scope.genresHeader = 'Genre';
            this.$scope.genreRequired = false;

            this.$scope.required = [
                {'id': 'title', 'text': 'Hoofdtitel'},
                {'id': 'avType', 'text': 'AV Type'},
                {'id': 'type', 'text': 'Mediatype'},
                {'id': 'broadcasters', 'text': 'Omroep'}
            ];

            this.$scope.createFormValid = false;

            this.currentEditor = this.editorService.getCurrentEditor();
            this.$scope.media.broadcasters = this.currentEditor.broadcasters;
            this.$scope.media.portals = this.currentEditor.portals;


            this.init();

        }

        CreateController.prototype = {

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$uibModalInstance.dismiss();
            },

            init: function(){
                this.$scope.$watch( 'media', function ( newValue ) {
                    invalid = newValue.title === undefined || newValue.type === undefined || newValue.avType === undefined || newValue.broadcasters.length === 0 
                    this.$scope.genreRequired =  newValue.type && newValue.type.requiresGenre;
                    if (this.$scope.genreRequired) {
                        invalid = invalid || ! newValue.genres || newValue.genres.length === 0;
                        this.$scope.genresHeader = 'Genre *';
                    } else {
                        this.$scope.genresHeader = 'Genre';
                    }
                    this.$scope.createFormValid =  !(invalid);
                    if (newValue.type) {
                        this.$scope.avTypes = this.avTypes.filter(function (avType) {
                            return newValue.type.avTypes.includes(avType.id)
                        });
                        
                        if (newValue.avType && ! newValue.type.avTypes.includes(newValue.avType.id)) {
                            newValue.avType = undefined;
                        }
                    }

                }.bind( this ), true );
            },

            submit: function () {

                this.$scope.waiting = true;

                //MGNL-2923 // prevent saving of publication stop time before publication start time
                if ( this.$scope.media.publication && this.$scope.media.publication.stop && this.$scope.media.publication.start && (this.$scope.media.publication.stop < this.$scope.media.publication.start) ){
                    this.$scope.media.publication.stop = this.$scope.media.publication.start;
                }

                this.mediaService.create( this.$scope.media ) .then(
                    function ( media ) {
                        this.$scope.waiting = false;
                        this.$uibModalInstance.close( media );
                    }.bind( this ),
                    function( error ){
                        this.$scope.waiting = false;
                        if ( error.violations ) {
                            this.$scope.violations = error.violations;
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error );
                        }

                    }.bind(this)
                );
            },

            remove: function ( collection, item ) {
                collection.some( function ( someItem, index ) {
                    if ( angular.equals( someItem, item ) ) {
                        collection.splice( index, 1 );
                        return true;
                    }
                } );
            }
            
        };

        return CreateController;
    }())
] );
