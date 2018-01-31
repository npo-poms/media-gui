angular.module( 'poms.screen.directives' ).directive( 'screenMember', [function () {
    return {
        restrict: 'E',
        templateUrl: 'screen/screen-members.html',
        controller: 'ScreenMemberController',
        controllerAs: 'screenMemberController',
        scope: {
            section: '@section',
            screen: '=',
            header :  '@'
        }
    }
}] );