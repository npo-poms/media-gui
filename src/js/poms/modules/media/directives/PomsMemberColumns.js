angular.module( 'poms.media.directives' )
    .directive( 'pomsMemberColumns', ['$parse', '$rootScope', 'PomsEvents', 'localStorageService', 'EditorService', 'NotificationService' , function ( $parse, $rootScope, pomsEvents, localStorageService, EditorService, NotificationService ) {
        return {
            restrict: 'E',
            templateUrl: 'views/common/columns.html',
            link: function ( $scope, element, attrs ) {
                var namespace, defaultKey, editor;

                editor = EditorService.getCurrentEditor() ;

                $scope.allColumns = [
                    {'id': 'number', 'value': 'Volgnummer', 'tableValue': '#'},
                    {'id': 'preview', 'value': 'Afbeelding', 'tableValue': ''},
                    {'id': 'mid', 'value': 'MID'},
                    {'id': 'title', 'value': 'Hoofdtitel'},
                    {'id': 'subtitle', 'value': 'Subtitel'},
                    {'id': 'type', 'value': 'Type'},
                    {'id': 'workflow', 'value': 'Status' , 'tableValue': ''},
                    {'id': 'locations', 'value': 'Bron(nen)'},
                    {'id': 'highlighted', 'value': 'Uitgelicht'},
                    {'id': 'broadcasters', 'value': 'Omroep'},
                    {'id': 'added', 'value': 'Toegevoegd'},
                    {'id': 'sortDate', 'value': 'Sorteerdatum'},
                    {'id': 'avType', 'value': 'AV-type'}

                ];

                if ( attrs.namespace ) {
                    namespace = $parse( attrs.namespace )( $scope );
                }

                namespace = namespace || 'members';

                defaultKey = editor.hashId + '.edit.' + namespace + '.grid.columns.default';

                var defaultColumns = localStorageService.get( defaultKey );

                if ( ! defaultColumns ) {
                    defaultColumns = [
                        {'id': 'number', 'value': 'Volgnummer', 'tableValue': '#'},
                        {'id': 'preview', 'value': 'Afb.'},
                        {'id': 'title', 'value': 'Hoofdtitel'},
                        {'id': 'subtitle', 'value': 'Subtitel'},
                        {'id': 'type', 'value': 'Type'},
                        {'id': 'workflow', 'value': 'Status' },
                        {'id': 'locations', 'value': 'Bron(nen)'},
                        {'id': 'sortDate', 'value': 'Sorteerdatum'}
                    ];

                    localStorageService.set( defaultKey, defaultColumns );
                }

                $scope.selectedColumns = defaultColumns;

                $scope.setDefault = function ( columns ) {
                    localStorageService.set( defaultKey, columns );
                    NotificationService.notify('Uw voorkeuren voor onderdeel-kolommen zijn opgeslagen');
                }
            }
        }
    }] );
