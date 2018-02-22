angular.module( 'poms.media.directives' )
    .directive( 'pomsPredictionColumns', ['$parse', '$rootScope', 'PomsEvents', 'localStorageService', 'EditorService', 'NotificationService' ,function ( $parse, $rootScope, pomsEvents, localStorageService, EditorService, NotificationService ) {
        return {
            restrict: 'E',
            templateUrl: 'common/columns.html',
            link: function ( $scope, element, attrs ) {
                var namespace, defaultKey, editor;

                editor = EditorService.getCurrentEditor() ;

                $scope.allColumns = [
                    {'id': 'platform', 'value': 'Platform', 'tableValue': 'Platform'},
                    {'id': 'available', 'value': 'Beschikbaarheid', 'tableValue': 'Beschikbaarheid'},
                    {'id': 'dates', 'value': 'Online / Offline' , 'tableValue': 'Online / Offline'},
                    {'id': 'authority', 'value': 'Authority', 'tableValue': 'Authority'}
                ];
                if ( attrs.namespace ) {
                    namespace = $parse( attrs.namespace )( $scope );
                }

                namespace = namespace || 'predictions';
                defaultKey = editor.hashId + '.edit.' + namespace + '.grid.columns.default';

                var defaultColumns = localStorageService.get( defaultKey );

                if ( ! defaultColumns ) {
                    defaultColumns = [
                        {'id': 'platform', 'value': 'Platform', 'tableValue': 'Platform'},
                        {'id': 'available', 'value': 'Beschikbaarheid', 'tableValue': 'Beschikbaarheid'},
                        {'id': 'dates', 'value': 'Online / Offline' , 'tableValue': 'Online / Offline'}
                    ];

                    localStorageService.set(defaultKey, defaultColumns);
                }

                $scope.selectedColumns = defaultColumns;

                $scope.setDefault = function ( columns ) {
                    localStorageService.set( defaultKey, columns );
                    NotificationService.notify( 'Uw voorkeuren voor platform-kolommen zijn opgeslagen' );
                }
            }
        }
    }] );
