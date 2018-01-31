(function() {

    angular.module('poms.search.services',['poms.list']);
    angular.module('poms.search.controllers',['poms.search.services']);
    angular.module('poms.search.directives',['poms.search.controllers']);
    angular.module('poms.search', ['poms.search.directives']);

})();
