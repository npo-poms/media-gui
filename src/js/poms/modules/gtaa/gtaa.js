(function() {

    angular.module('poms.gtaa.services',[]);

    angular.module('poms.gtaa.controllers',['poms.gtaa.services']);
    angular.module('poms.gtaa.directives',['poms.gtaa.controllers']);

    angular.module('poms.gtaa', [
        'poms.gtaa.controllers',
        'poms.gtaa.directives'
    ]);

})();
