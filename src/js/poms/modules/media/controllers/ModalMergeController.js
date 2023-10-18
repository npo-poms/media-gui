angular.module( 'poms.media.controllers' ).controller( 'ModalMergeController', [
    '$scope',
    '$uibModalInstance',
    'config',
    'merge',
    'submitMerge',
    'MediaService',
    'PomsEvents',
    (function () {

        function ModalMergeController ( $scope, $uibModalInstance, config, merge, submitMerge, MediaService, Pomsevents ) {
            this.$scope = $scope;
            this.$uibModalInstance = $uibModalInstance;
            this.config = config;
            this.merge = merge;
            this.submitMerge = submitMerge;
            this.mediaService = MediaService;
            this.pomsEvents = Pomsevents;

            this.$scope.merge = this.merge;

            this.$scope.columns = [

                { "id" : "mainTitle", "title" : "Titel", "type" : 'object' },
                { "id" : "subTitle", "title" : "Subtitel", "type" : 'object' },
                { "id" : "shortTitle", "title" : "Korte Titel", "type" : 'object' },
                { "id" : "abbreviationTitle", "title" : "Afkorting", "type" : 'object' },
                { "id" : "workTitle", "title" : "Werktitel", "type" : 'object' },
                { "id" : "originalTitle", "title" : "Originele Titel", "type" : 'object' },
                { "id" : "lexicoTitle", "title" : "Lexiconografische titel", "type" : 'object' },
                { "id" : "mainDescription", "title" : "Beschrijving", "type" : 'object' },
                { "id" : "shortDescription", "title" : "Korte beschrijving", "type" : 'object' },

                { "id" : "images", "title" : "Afbeeldingen" },
                { "id" : "members", "title" : "Onderdelen" },
                { "id" : "episodes", "title" : "Afleveringen" },
                { "id" : "locations", "title" : "Bronnen" },
                { "id" : "relations", "title" : "Relaties" },

                { "id" : "genres", "title" : "Genres", "type" : 'array' },
                { "id" : "tags", "title" : "Tags", "type" : 'array' },
                { "id" : "websites", "title" : "Websites", "type" : 'array' },
                { "id" : "twitter", "title" : "Twitter", "type" : 'array' },
                { "id" : "credits", "title" : "Naamsvermeldingen", "type" : 'array' }
            ];

            this.init();
        }

        ModalMergeController.prototype = {

            mayClose : true,

            init : function () {

                this.mediaService.getGenres( this.$scope.merge.source ).then(
                    function ( data ) {
                        this.$scope.merge.source.genres = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getGenres( this.$scope.merge.destination ).then(
                    function ( data ) {
                        this.$scope.merge.destination.genres = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getTwitterRefs( this.$scope.merge.source ).then(
                    function ( data ) {
                        this.$scope.merge.source.twitter = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getTwitterRefs( this.$scope.merge.destination ).then(
                    function ( data ) {
                        this.$scope.merge.destination.twitter = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getTags( this.$scope.merge.source ).then(
                    function ( data ) {
                        this.$scope.merge.source.tags = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getTags( this.$scope.merge.destination ).then(
                    function ( data ) {
                        this.$scope.merge.destination.tags = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getCredits( this.$scope.merge.source ).then(
                    function ( data ) {
                        this.$scope.merge.source.credits = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getCredits( this.$scope.merge.destination ).then(
                    function ( data ) {
                        this.$scope.merge.destination.credits = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getWebsites( this.$scope.merge.source ).then(
                    function ( data ) {
                        this.$scope.merge.source.websites = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );

                this.mediaService.getWebsites( this.$scope.merge.destination ).then(
                    function ( data ) {
                        this.$scope.merge.destination.websites = data;
                    }.bind( this ),
                    function ( error ) {
                        console.log( error );
                    }
                );
            },

            cancel : function () {
                if ( this.mayClose ) {
                    this.$uibModalInstance.dismiss( 'canceled' );
                }
            },

            hasOwner : function ( media, column ) {
                return this.$scope.merge[ media ][ column.id ] && this.$scope.merge[ media ][ column.id ].owner && this.$scope.merge[ media ][ column.id ].owner !== 'BROADCASTER'
            },

            submit : function () {
                this.mayClose = false;
                this.$scope.waiting = true;

                this.submitMerge( this.merge ).then(
                    function ( destination ) {
                        this.$uibModalInstance.close( destination );
                        this.$scope.waiting = false;

                    }.bind( this ),
                    function ( error ) {
                        this.mayClose = true;
                        this.$scope.waiting = false;

                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );
            },
            message : function () {
                return "Als je nu op 'voeg samen' klikt dan wordt het mediaobject " + this.$scope.merge.source.mid + " verwijderd, en de inhoud naar " + this.$scope.merge.destination.mid + " gekopieerd";
            }

        };

        return ModalMergeController;
    }())
] );
