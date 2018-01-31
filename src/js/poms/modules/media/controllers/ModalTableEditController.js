angular.module( 'poms.media.controllers' ).controller( 'ModalTableEditController', [
    '$scope',
    '$q',
    '$modal',
    'PomsEvents',
    'MediaService',
    (function () {

        function load ( scope, pomsEvents, dest ) {
            scope.load().then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    scope.$emit( pomsEvents.error, error )
                }
            )
        }


        function ModalTableEditController ( $scope, $q, $modal, pomsEvents, mediaService ) {

            this.items = [];

            this.options = [];
            this.platforms = [];

            this.$scope = $scope;
            this.$q = $q;
            this.$modal = $modal;

            this.media = $scope.media;
            this.pomsEvents = pomsEvents;

            this.mediaService = mediaService;

            this.mayWrite = mediaService.hasWritePermission( $scope.media, $scope.permission );
            this.mayRead = mediaService.hasReadPermission( $scope.media, $scope.permission );

            load( $scope, this.pomsEvents, this.items );

            $scope.options().then(
                function ( data ) {
                    if ( data.length < 1 ) {
                        this.mayWrite = false;
                    } else {
                        angular.copy( data, this.options );
                    }
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( this.pomsEvents.error, error )
                }.bind( this )
            );

            if ( this.$scope.permission === 'geoRestrictions' ) {
                $scope.platforms().then(
                    function ( data ) {
                        angular.copy( data, this.platforms );
                    }.bind( this ),
                    function ( error ) {
                        $scope.$emit( this.pomsEvents.error, error )
                    }.bind( this )
                );
            }

            this.$scope.sortableOptions = {
                handle: '.sort-handle',
                update: function ( event, ui ) {
                    var to = ui.item.index();
                    if ( this.from >= 0 && to !== this.from ) {
                        this.$scope.moveRestriction( {media: this.$scope.media, from: this.from, to: to} ).then(
                            function ( media ) {
                            }.bind( this ),
                            function ( error ) {
                            }
                        )
                    } else if ( this.from < 0 ) {
                        this.load();
                    }

                    this.from = - 1;
                }.bind( this ),
                start: function ( event, ui ) {
                    this.from = ui.item.index();
                }.bind( this )
            };

            this.columns = [];

            if ( this.$scope.permission === 'geoRestrictions' ) {
                this.columns = [
                    {'text': 'Regio', 'id': 'region', 'helpField': 'editor.general.geoRestriction.region'},
                    {'text': 'Platform', 'id': 'platform', 'helpField': 'editor.general.geoRestriction.platform'},
                    {'text': 'Online vanaf', 'id': 'start', 'helpField': 'editor.general.geoRestriction.start'},
                    {'text': 'Online tot', 'id': 'stop', 'helpField': 'editor.general.geoRestriction.stop'}
                ];
            }
            if ( this.$scope.permission === 'portalRestrictions' ) {
                this.columns = [
                    {'text': 'Portal', 'id': 'portal', 'helpField': 'editor.general.portalRestriction.portal'},
                    {'text': 'Online vanaf', 'id': 'start', 'helpField': 'editor.general.portalRestriction.start'},
                    {'text': 'Online tot', 'id': 'stop', 'helpField': 'editor.general.portalRestriction.stop'}
                ];
            }

        }

        ModalTableEditController.prototype = {

            addItem: function () {
                this.$scope.inserted = {};
                this.items.push( this.$scope.inserted );
            },

            close: function () {
                this.$scope.modal.close();
                load( this.$scope, this.pomsEvents, this.items );
            },

            submit: function ( index, data ) {

                var source = this.items[index];

                if ( source ) {
                    source.violations = undefined;
                    angular.extend( data, {
                        id: source.id
                    } );
                }

                data.publication = {};

                if ( data.startdate ){
                    data.publication.start = new Date( data.startdate ).getTime();
                    data.startdate = data.publication.start;
                }
                if ( data.stopdate ){
                    data.publication.stop = new Date( data.stopdate ).getTime();
                    data.stopdate = data.publication.stop;
                }

                //MGNL-2923 // prevent saving of publication stop time before publication start time
                if ( data.publication.stop && data.publication.start && (data.publication.stop < data.publication.start) ){
                    data.publication.stop = data.publication.start;
                    data.stopdate = data.startdate;
                }

                this.$scope.waiting = true;

                return this.$scope.setRestriction( {media: this.$scope.media, data: data} ).then(
                    function ( data ) {
                        load( this.$scope, this.pomsEvents, this.items );
                        this.$scope.waiting = false;
                    }.bind( this ),
                    function ( error ) {
                        if ( error.status == 400 && error.violations ) {
                            source.violations = error.violations;
                            return 'Errors';
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                        this.$scope.waiting = false;
                    }.bind( this ) );
            },


            remove: function ( index ) {
                var source = this.items[index];
                if ( ! source.id ) {
                    this.items.splice( index, 1 );
                    return;
                }

                this.$scope.waiting = true;
                return this.$scope.removeRestriction( {media: this.$scope.media, source: source} ).then(
                    function ( media ) {
                        load( this.$scope, this.pomsEvents, this.items );
                        this.$scope.waiting = false;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        this.$scope.waiting = false;
                        return false;
                    }.bind( this ) );
            },

            cancelEdit: function ( index, rowform ) {
                var item = this.items[index];
                item.violations = undefined;

                delete item.$$hashKey;
                if ( angular.equals( {}, item ) ) {
                    this.remove( index );
                }

                rowform.$cancel();
            },

            showEditElement: function () {

                if ( this.mayWrite ) {
                    this.$scope.modal = this.$modal.open( {
                        scope: this.$scope,
                        templateUrl: 'edit/editables/poms-table-restrictions.html',
                        windowClass: 'modal-edit'
                    } );
                }
            }

        };

        return ModalTableEditController;
    }())
] );
