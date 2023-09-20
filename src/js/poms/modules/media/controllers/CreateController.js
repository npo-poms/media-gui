angular.module( 'poms.media.controllers' ).controller( 'CreateController', [
    '$scope',
    '$modalInstance',
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

        function CreateController ( $scope, $modalInstance, EditorService, MediaService, PomsEvents, mediaTypes, avTypes, broadcasters, portals, media, genres ) {

            this.$scope = $scope;

            this.$modalInstance = $modalInstance;
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
                this.$modalInstance.dismiss();
            },

            init: function(){
                this.$scope.$watch( 'media', function ( newValue ) {

                    // ridiculous amounts of logic
                    if ( newValue.type && ( newValue.type.id === 'BROADCAST' || newValue.type.id === 'CLIP' || newValue.type.id === 'TRAILER' )){
                        this.$scope.createFormValid =  !( !newValue.genres || newValue.genres.length === 0 || newValue.title === undefined || newValue.avType === undefined || !newValue.broadcasters || newValue.broadcasters.length === 0 );

                        this.$scope.genreRequired = true;
                        this.$scope.genresHeader = 'Genre *';
                    } else {
                        this.$scope.createFormValid =  !( newValue.title === undefined || newValue.type === undefined || newValue.avType === undefined || newValue.broadcasters.length === 0 );

                        this.$scope.genreRequired = false;
                        this.$scope.genresHeader = 'Genre';
                    }
                    if (this.$scope.media && this.$scope.media.type) {
                        this.$scope.avTypes = this.avTypes.filter(function (avType) {
                            return this.$scope.media.type.avTypes.includes(avType.id)
                        }.bind(this));
                        
                        if (this.$scope.media.avType && ! this.$scope.media.type.avTypes.includes(this.$scope.media.avType.id)) {
                            this.$scope.media.avType = undefined;
                        }
                        console.log("Filtered", this.$scope.avTypes);
                        console.log(this.$scope.media.avType);
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
                        this.$modalInstance.close( media );
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
