(function() {

    angular.module('poms.screen.services',[]);

    angular.module('poms.screen.controllers',[
            'poms.screen.services'
    ]);

    angular.module('poms.screen.directives',[
        'poms.screen.services'
    ]);

    angular.module('poms.screen', [
        'poms.screen.controllers',
        'poms.screen.directives'
    ]);

})();
