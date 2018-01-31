angular.module('poms.gtaa.directives')
    .directive('gtaaConnectorEdit', [function() {
        return {
            restrict : 'E',
            templateUrl : 'edit/modal-gtaa-connector.html',
            controller : 'GtaaConnectorEditController',
            controllerAs : 'controller',
            scope : {
                linkedPerson : '=',
                gtaaId : '=',
                origin: '='
            }
        }
    }]
);