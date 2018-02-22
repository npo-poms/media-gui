describe('PredictionsController', function() {

    var
        $scope,
        $modal = {},
        $filter,
        $http,
        editorService = {},
        listService = {},
        mediaService = {},
        pomsEvents = {},
        notificationService = {},
        appConfig = {},
        deferredOptions,
        target;


    beforeEach(module('poms.media.controllers'));

    var $controller;

    beforeEach(inject(function($q) {
        deferredOptions = $q.defer();

        mediaService.getPredictions = function() {
            return deferredOptions.promise;
        };

    }));

    beforeEach(inject(function(_$rootScope_, $controller) {

        $scope = _$rootScope_.$new();

        target = $controller('PredictionsController', {
            '$scope' : $scope,
            '$filter': $filter,
            '$http' : $http,
            '$modal': $modal,
            'EditorService' : editorService,
            'PomsEvents': pomsEvents,
            'MediaService': mediaService,
            'NotificationService': notificationService,
            'ListService' : listService,
            'appConfig' : appConfig
        });

        deferredOptions.resolve([
            {id : 'ID1', text : 'Type 1'},
            {id : 'ID2', text : 'Type 2'},
            {id : 'ID3', text : 'Type 3'}
        ]);

    }));

    describe('Platform list', function() {
        it('is not viewable when AvType is audio', function() {
            var avType = {id:"AUDIO"}
            $scope.media = {avType: avType};
            expect(target.isViewable()).toEqual(false);
        });

        it('is viewable when AvType is video', function() {
            var avType = {id:"VIDEO"}
            $scope.media = {avType: avType};
            expect(target.isViewable()).toEqual(true);
        });

        it('is editable when mayWrite is false and type is not broadcast', function() {
            $scope.prediction ={mayWrite: true};
            var type = {id: "CLIP"};
            $scope.media = {type: type};
            expect(target.isEditable($scope.prediction)).toEqual(true);
        });

        it('is editable when type is broadcast', function() {
            $scope.prediction ={mayWrite: true};
            var type = {id: "BROADCAST"};
            $scope.media = {type: type};
            expect(target.isEditable($scope.prediction)).toEqual(false);
        });
    });

});


