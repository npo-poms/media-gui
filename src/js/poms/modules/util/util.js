(function() {
    angular.module('poms.util.filters', []);
    angular.module('poms.util.services', []);
    angular.module('poms.util.controllers', []);
    angular.module('poms.util.directives',['ui.bootstrap']);

    angular.module('poms.util', [
        'poms.util.directives',
        'poms.util.filters',
        'poms.util.controllers',
        'poms.util.services'
    ]);

})();
