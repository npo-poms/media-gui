angular.module( 'poms.search.directives' )
    .directive( 'pomsSearchColumns', [function ( ) {
        return {
            restrict: 'E',
            templateUrl: 'views/common/columns.html',
            controller: function ( $scope, $rootScope, PomsEvents, localStorageService, EditorService, NotificationService) {

                var defaultKey, defaultColumns, localKey, editor;
                editor = EditorService.getCurrentEditor();
                //console.log('editor', editor);


                $scope.allColumns = [
                    {'id': 'preview', 'value': 'Afbeelding', 'tableValue':'', 'sortable': false},
                    {'id': 'mid', 'value': 'MID', 'sortable': true},
                    {'id': 'title', 'value': 'Hoofdtitel', 'sortable': true},
                    {'id': 'subTitle', 'value': 'Subtitel'},
                    {'id': 'broadcasters', 'value': 'Omroep'},
                    {'id': 'workflow', 'value': 'Status', 'tableValue':''},
                    {'id': 'type', 'value': 'Type', 'sortable': true},
                    {'id': 'locations', 'value': 'Bron(nen)'},
                    {'id': 'creationDate', 'value': 'Aangemaakt op', 'sortable': true},
                    {'id': 'createdBy', 'value': 'Aangemaakt door', 'sortable': true},
                    {'id': 'lastModified', 'value': 'Gewijzigd op', 'sortable': true},
                    {'id': 'lastModifiedBy', 'value': 'Gewijzigd door', 'sortable': true},
                    {'id': 'publishStart', 'value': 'Datum online', 'sortable': true},
                    {'id': 'publishStop', 'value': 'Datum offline', 'sortable': true},
                    {'id': 'sortDate', 'value': 'Sorteerdatum', 'sortable': true},
                    {'id': 'firstScheduleEvent', 'value': 'Eerste uitzending', 'sortable': true},
                    {'id': 'lastScheduleEvent', 'value': 'Laatste uitzending', 'sortable': true},
                    {'id': 'lastPublished', 'value': 'Gepubliceerd op', 'sortable': true},
                    {'id': 'score', 'value': 'Score', "sortable": false},
                    {'id': 'streamingPlatformStatus', 'value': 'Streaming platformstatus', "sortable": false}

                ];
                defaultKey = editor.hashId + '.search.grid.columns.default';
                defaultColumns = localStorageService.get( defaultKey );

                if ( ! defaultColumns ) {
                    defaultColumns = [
                        {'id': 'preview', 'value': 'Afbeelding',  'tableValue':'','sortable': false},
                        {'id': 'title', 'value': 'Hoofdtitel', 'sortable': true},
                        {'id': 'subTitle', 'value': 'Subtitel'},
                        {'id': 'workflow', 'value': 'Status', 'tableValue':''},
                        {'id': 'type', 'value': 'Type', 'sortable': true},
                        {'id': 'locations', 'value': 'Bron(nen)'},
                        {'id': 'sortDate', 'value': 'Sorteerdatum', 'sortable': true}
                    ];
                    localStorageService.set( defaultKey, defaultColumns );
                }

                localKey = editor.hashId + '.search.grid.columns.' + $scope.search.id;

                localStorageService.bind( $scope, 'selectedColumns', defaultColumns, localKey );

                $scope.$on( "$destroy", function () {
                    localStorageService.remove( localKey );
                } ).bind( this );


                $scope.setDefault = function ( columns ) {
                    localStorageService.set( defaultKey , columns );
                    NotificationService.notify('Uw voorkeuren voor zoek-kolommen zijn opgeslagen');

                };

            }
        }
    }] );
