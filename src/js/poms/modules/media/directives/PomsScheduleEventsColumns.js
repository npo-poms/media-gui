angular.module( 'poms.media.directives' )
    .directive( 'pomsScheduleEventColumns', ['$parse', '$rootScope', 'PomsEvents', 'localStorageService', 'EditorService', 'NotificationService' , function ( $parse, $rootScope, pomsEvents, localStorageService, EditorService, NotificationService ) {
        return {
            restrict: 'E',
            templateUrl: '/views/common/columns.html',
            link: function ( $scope, element, attrs ) {
                let namespace;

                const editor = EditorService.getCurrentEditor() ;

                $scope.allColumns = [
                    {'id': 'channel', 'value': 'Kanaal'},
                    {'id': 'start', 'value': 'Datum'},
                    {'id': 'title', 'value': 'Titel'},
                    {'id': 'description', 'value': 'Omschrijving'},
                    {'id': 'textPage', 'value': 'TT pagina'},
                    {'id': 'textSubtitles', 'value': 'Ondertiteling'},
                    {'id': 'repeat', 'value': 'Herhaling'}

                ];

                if ( attrs.namespace ) {
                    namespace = $parse( attrs.namespace )( $scope );
                }

                namespace = namespace || 'scheduleevents';

                const defaultKey = editor.hashId + '.edit.' + namespace + '.grid.columns.default';

                let defaultColumns = localStorageService.get(defaultKey);

                if ( ! defaultColumns ) {
                    defaultColumns = [
                        {'id': 'channel', 'value': 'Kanaal'},
                        {'id': 'start', 'value': 'Datum'},
                        {'id': 'title', 'value': 'Titel'},
                        {'id': 'description', 'value': 'Omschrijving'}
                    ];

                    localStorageService.set( defaultKey, defaultColumns );
                }

                $scope.selectedColumns = defaultColumns;

                $scope.setDefault = function ( columns ) {
                    localStorageService.set( defaultKey, columns );
                    NotificationService.notify('Uw voorkeuren voor scheduleevents-kolommen zijn opgeslagen');
                }
            }
        }
    }] );
