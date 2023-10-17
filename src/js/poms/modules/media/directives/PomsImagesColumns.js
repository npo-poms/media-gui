angular.module( 'poms.media.directives' )
    .directive( 'pomsImagesColumns', ['$parse', 'PomsEvents', 'localStorageService', 'EditorService', 'NotificationService', function ( $parse, pomsEvents, localStorageService, editorService, notificationService ) {
        return {
            restrict: 'E',
            templateUrl: '/views/common/columns.html',
            link: function ( $scope, element, attrs ) {
                var namespace, defaultKey, editor;

                editor = editorService.getCurrentEditor() ;

                $scope.allColumns = [
                    {'id': 'preview', 'value': 'Afbeelding', 'tableValue':''},
                    {'id': 'highlighted', 'value': 'Uitgelicht', 'tableValue':''},
                    {'id': 'title', 'value': 'Titel'},
                    {'id': 'workflow', 'value': 'Status', 'tableValue':''},
                    {'id': 'description', 'value': 'Omschrijving'},
                    {'id': 'type', 'value': 'Type'},
                    {'id': 'size', 'value': 'Formaat'},
                    {'id': 'credits', 'value': 'Fotograaf / Rechthebbende'},
                    {'id': 'sourceName', 'value': 'Bron'},
                    {'id': 'source', 'value': 'Bron URL'},
                    {'id': 'license', 'value': 'Licentie'},
                    {'id': 'date', 'value': 'Jaar'},
                    {'id': 'publication', 'value': 'Online / offline'},
                    {'id': 'offset', 'value': 'Offset'},
                    {'id': 'owner', 'value': 'Eigenaar'}
                ];
                if ( attrs.namespace ) {
                    namespace = $parse( attrs.namespace )( $scope );
                }

                namespace = namespace || 'images';

                defaultKey = editor.hashId + '.edit.' + namespace + '.grid.columns.default';

                var defaultColumns = localStorageService.get( defaultKey );

                if ( ! defaultColumns ) {
                    defaultColumns = [
                        {'id': 'preview', 'value': 'Afbeelding', 'tableValue':''},
                        {'id': 'highlighted', 'value': 'Uitgelicht', 'tableValue':''},
                        {'id': 'title', 'value': 'Titel'},
                        {'id': 'workflow', 'value': 'Status', 'tableValue':''},
                        {'id': 'description', 'value': 'Omschrijving'}
                    ];

                    localStorageService.set( defaultKey, defaultColumns );
                }

                $scope.selectedColumns = defaultColumns;

                $scope.setDefault = function ( columns ) {
                    localStorageService.set( defaultKey, columns );
                    notificationService.notify( 'Uw voorkeuren voor afbeeldings-kolommen zijn opgeslagen');
                }
            }
        }
    }] );
