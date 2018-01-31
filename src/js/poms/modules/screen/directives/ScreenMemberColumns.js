angular.module( 'poms.screen.directives' )
    .directive( 'screenMemberColumns', ['$parse', '$rootScope', 'PomsEvents', 'localStorageService', 'EditorService', 'NotificationService', function ( $parse, $rootScope, pomsEvents, localStorageService, EditorService, NotificationService ) {
        return {
            restrict: 'E',
            templateUrl: 'common/columns.html',
            link: function ( $scope, element, attrs ) {
                var namespace, defaultKey, localKey, editor;

                editor = EditorService.getCurrentEditor() ;

                $scope.allColumns = [
                    {'id': 'preview', 'value': 'Afbeelding', 'tableValue': ''},
                    {'id': 'mid', 'value': 'MID'},
                    {'id': 'title', 'value': 'Hoofdtitel'},
                    {'id': 'type', 'value': 'Type'}
                ];

                if ( attrs.namespace ) {
                    namespace = $parse( attrs.namespace )( $scope );
                }

                namespace = namespace || 'members';

                defaultKey = editor.hashId + '.screen.' + namespace + '.grid.columns.default';
                localKey = editor.hashId + '.screen.' + namespace + '.grid.columns.' + $scope.screen.sid;

                var defaultColumns = localStorageService.get( defaultKey );

                if ( ! defaultColumns ) {
                    defaultColumns = [
                        {'id': 'preview', 'value': 'Afbeelding', 'tableValue': ''},
                        {'id': 'mid', 'value': 'MID'},
                        {'id': 'title', 'value': 'Hoofdtitel'},
                        {'id': 'type', 'value': 'Type'}
                    ];

                    localStorageService.set( defaultKey, defaultColumns );
                }

                localStorageService.bind( $scope, 'selectedColumns', defaultColumns, localKey );

                $scope.$on( "$destroy", function () {
                    localStorageService.remove( localKey );
                } );


                $scope.setDefault = function ( columns ) {

                    localStorageService.set( defaultKey, columns );
                    NotificationService.notify( 'Uw voorkeuren voor onderdeel-kolommen zijn opgeslagen' );

                }
            }
        }
    }] );