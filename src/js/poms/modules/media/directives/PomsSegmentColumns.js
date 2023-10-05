angular.module( 'poms.media.directives' )
    .directive( 'pomsSegmentColumns', ['$parse', '$rootScope', 'PomsEvents', 'localStorageService', 'EditorService', 'NotificationService', function ( $parse, $rootScope, pomsEvents, localStorageService, EditorService , NotificationService) {
        return {
            restrict: 'E',
            templateUrl: 'views/common/columns.html',
            link: function ( $scope, element, attrs ) {
                var namespace, defaultKey, editor;

                editor = EditorService.getCurrentEditor() ;

                $scope.allColumns = [
                    {'id': 'preview', 'value': 'Afbeelding', tableValue:''},
                    {'id': 'mid', 'value': 'MID'},
                    {'id': 'mainTitle', 'value': 'Titel'},
                    {'id': 'mainDescription', 'value': 'Omschrijving'},
                    {'id': 'workflow', 'value': 'Status', tableValue:''},
                    {'id': 'start', 'value': 'Start'},
                    {'id': 'stop', 'value': 'Stop'},
                    {'id': 'duration', 'value': 'Speelduur'},
                    {'id': 'avType', 'value': 'AV-type'}
                ];

                if ( attrs.namespace ) {
                    namespace = $parse( attrs.namespace )( $scope );
                }

                namespace = namespace || 'segments';

                defaultKey = editor.hashId + '.edit.' + namespace + '.grid.columns.default';

                var defaultColumns = localStorageService.get( defaultKey );

                if ( ! defaultColumns ) {
                    defaultColumns = [
                        {'id': 'preview', 'value': 'Afbeelding', tableValue:''},
                        {'id': 'mainTitle', 'value': 'Titel'},
                        {'id': 'workflow', 'value': 'Status', tableValue:''},
                        {'id': 'start', 'value': 'Start'},
                        {'id': 'stop', 'value': 'Stop'},
                        {'id': 'duration', 'value': 'Speelduur'}
                    ];

                    localStorageService.set( defaultKey, defaultColumns );
                }

                $scope.selectedColumns = defaultColumns;

                $scope.setDefault = function ( columns ) {

                    localStorageService.set( defaultKey, columns );
                    NotificationService.notify('Uw voorkeuren voor segment-kolommen zijn opgeslagen');

                }
            }
        }
    }] );
