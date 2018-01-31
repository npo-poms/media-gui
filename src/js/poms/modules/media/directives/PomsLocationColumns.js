angular.module( 'poms.media.directives' )
    .directive( 'pomsLocationColumns', ['$parse', '$rootScope', 'PomsEvents', 'localStorageService', 'EditorService', 'NotificationService' ,function ( $parse, $rootScope, pomsEvents, localStorageService, EditorService, NotificationService ) {
        return {
            restrict: 'E',
            templateUrl: 'common/columns.html',
            link: function ( $scope, element, attrs ) {
                var namespace, defaultKey, editor;

                editor = EditorService.getCurrentEditor() ;

                $scope.allColumns = [
                    {'id': 'format', 'value': 'Formaat'},
                    {'id': 'url', 'value': 'URL'},
                    {'id': 'platform', 'value': 'Platform'},
                    {'id': 'workflow', 'value': 'Status', 'tableValue': ''},
                    {'id': 'bitrate', 'value': 'Bitrate'},
                    {'id': 'offset', 'value': 'Offset'},
                    {'id': 'dates', 'value': 'Online / Offline'},
                    {'id': 'owner', 'value': 'Eigenaar'}

                ];
                if ( attrs.namespace ) {
                    namespace = $parse( attrs.namespace )( $scope );
                }

                namespace = namespace || 'locations';

                defaultKey = editor.hashId + '.edit.' + namespace + '.grid.columns.default';

                var defaultColumns = localStorageService.get( defaultKey );

                if ( ! defaultColumns ) {
                    defaultColumns = [
                        {'id': 'format', 'value': 'Formaat'},
                        {'id': 'url', 'value': 'URL'},
                        {'id': 'workflow', 'value': 'Status', 'tableValue': ''},
                        {'id': 'dates', 'value': 'Online / Offline'}
                    ];

                    localStorageService.set(defaultKey, defaultColumns);
                }

                $scope.selectedColumns = defaultColumns;

                $scope.setDefault = function ( columns ) {
                    localStorageService.set( defaultKey, columns );
                    NotificationService.notify( 'Uw voorkeuren voor bronnen-kolommen zijn opgeslagen' );

                }
            }
        }
    }] );
