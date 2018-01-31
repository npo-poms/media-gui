describe('SearchFormController', function() {

    var $scope,
        $filter,
        bulkUpdateService = {},
        listService = {},
        favoritesService = {},
        guiService = {},
        mediaService = {},
        searchService = {},
        searchFactory = {},
        deferredOptions,
        search = {
            form : {
                types : {
                    isRestrictedField : true,
                    value : [
                        {id : 'ID2', text : 'Type 2', dummy : 'to be replaced'}
                    ]
                },
                broadcasters : [
                    {id : 'ID2', text : 'Type 2', dummy : 'to be replaced'}
                ],
                sortDate : {},
                clearStartDateConstraint : function() {
                    return 'true';
                },
                clearStopDateConstraint : function() {
                    return 'true';
                },
                setDateConstraint : function(type, start, stop) {
                    return {type : type, start : start, stop : stop};
                },
                buildSummary : function() {
                    return 'Summary';
                },
                getQuery : function() {
                    return 'query';
                }
            }
        },
        target;

    beforeEach(module('poms.search.controllers', function($provide) {
    }));

    beforeEach(inject(function($q) {
        deferredOptions = $q.defer();

        listService.getMediaTypes = function() {
            return deferredOptions.promise;
        };
        listService.getAvTypes = function() {
            return deferredOptions.promise;
        };
        listService.getBroadcasters = function() {
            return deferredOptions.promise;
        };
        listService.getPortals = function() {
            return deferredOptions.promise;
        };
        listService.getChannels = function() {
            return deferredOptions.promise;
        };
        listService.getTags = function() {
            return deferredOptions.promise;
        };
        listService.getUsers = function() {
            return deferredOptions.promise;
        };
    }));

    beforeEach(inject(function(_$rootScope_, _$filter_, _$q_, $controller) {
        $filter = _$filter_;

        $scope = _$rootScope_.$new();
        $scope.search = search;


        target = $controller('SearchFormController', {
            '$scope' : $scope,
            '$q' : _$q_,
            '$filter' : _$filter_,
            'BulkUpdateService' : bulkUpdateService,
            'ListService' : listService,
            'FavoritesService' : favoritesService,
            'GuiService' : guiService,
            'MediaService' : mediaService,
            'SearchService' : searchService,
            'SearchFactory' : searchFactory
        });

        deferredOptions.resolve([
            {id : 'ID1', text : 'Type 1'},
            {id : 'ID2', text : 'Type 2'},
            {id : 'ID3', text : 'Type 3'}
        ]);

        _$rootScope_.$apply();
    }));

    describe("$scope", function() {

        it('should contain suggestions', function() {
            expect($scope.suggestions).toBeDefined();
            expect($scope.suggestions.length).toEqual(0);
        });

        it('should contain user suggestions', function() {
            expect($scope.userSuggestions).toBeDefined();
            expect($scope.userSuggestions.length).toEqual(0);
        });

        it('should define a date format', function() {
            expect($scope.dateFormat).toEqual('dd-MM-yyyy');
        });

        it('should define the drop down search dates', function() {
            expect($scope.searchDate).toEqual({
                'isOpen' : false,
                'start' : undefined,
                'stop' : undefined,
                'dateType' : 'sortDate'
            });
        });

        it('should contain the search form', function() {
            expect($scope.formData).toEqual(search.form);
        });

    });

    describe("$scope selects", function() {

        it('should contain the media type options', function() {
            expect($scope.mediaTypes.data.length).toEqual(3);
        });

        it('should contain the AV type options', function() {
            expect($scope.avTypes.data.length).toEqual(3);
        });

        it('should contain the broadcaster options', function() {
            expect($scope.broadcasters.data.length).toEqual(3);
        });

        it('should contain the portal options', function() {
            expect($scope.portals.data.length).toEqual(3);
        });

        it('should contain the channel options', function() {
            expect($scope.channels.data.length).toEqual(3);
        });

        it('should contain the properties filters', function() {
            expect($scope.properties).toBeDefined();
            expect($scope.properties.length).not.toEqual(0);
        });

        it('should replace the restricted preset form values with option instances', function() {
            expect(search.form.types.value).not.toContain({id : 'ID2', text : 'Type 2', dummy : 'to be replaced'});
            expect(search.form.types.value).toContain({id : 'ID2', text : 'Type 2'});
        });

        it('should replace the preset form values with option instances', function() {
            expect(search.form.broadcasters).not.toContain({id : 'ID2', text : 'Type 2', dummy : 'to be replaced'});
            expect(search.form.broadcasters).toContain({id : 'ID2', text : 'Type 2'});
        });

    });

    describe("submit", function() {

        it('should set a query summary', function() {
            spyOn($scope.search.form, 'buildSummary');

            target.submit();

            expect($scope.search.form.buildSummary).toHaveBeenCalled();
        });

        it('should update the query', function() {
            target.submit();

            expect($scope.query).toEqual('query');
        });

    });

    it('should clear the form start date of given type', function() {
        spyOn($scope.search.form, 'clearStartDateConstraint');

        target.clearStartDateConstraint('sortDate');

        expect($scope.search.form.clearStartDateConstraint).toHaveBeenCalledWith('sortDate');
    });

    it('should clear the form stop date of given type', function() {
        spyOn($scope.search.form, 'clearStopDateConstraint');

        target.clearStopDateConstraint('sortDate');

        expect($scope.search.form.clearStopDateConstraint).toHaveBeenCalledWith('sortDate');
    });

    it('should set the date constraint for given type', function() {
        spyOn($scope.search.form, 'setDateConstraint');

        $scope.searchDate = {
            'isOpen' : false,
            'start' : new Date(10),
            'stop' : new Date(100),
            'dateType' : 'sortDate'
        };

        target.dateSelected();

        expect($scope.search.form.setDateConstraint).toHaveBeenCalledWith('sortDate', $scope.searchDate.start, $scope.searchDate.stop);
    });

    it('should call the tag suggestions', function() {
        spyOn(listService, 'getTags');

        target.getTags('input');

        expect(listService.getTags).toHaveBeenCalledWith('input');
    });

    it('should call the user suggestions', function() {
        spyOn(listService, 'getUsers');

        $scope.searchUser = {};
        $scope.searchUser.text = 'input';

        target.getUsers();

        expect(listService.getUsers).toHaveBeenCalledWith('input');
    });
});
