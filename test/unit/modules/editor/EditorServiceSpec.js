describe('EditorService', function() {

    var $rootScope, mockBackend, target;

    beforeEach(module('poms.editor.services', function($provide) {
        $provide.value('$modal', {});
        $provide.value('appConfig', {'apihost' : 'api'});
        $provide.value('PomsEvents', {'error' : 'error'});
        $provide.value('localStorageService', {
            "set": function(key, val) {

            },
            "get": function(key) {
                return null;
            }
        });
    }));

    beforeEach(inject(function(_$httpBackend_, _$rootScope_, _appConfig_, _EditorService_) {
        $rootScope = _$rootScope_;
        mockBackend = _$httpBackend_;
        target = _EditorService_;
        target.init();
    }));

    afterEach(function() {
        mockBackend.verifyNoOutstandingExpectation();
        mockBackend.verifyNoOutstandingRequest();
    });

    describe('Current editor has roles', function() {

        it('should return false on a non existing role', function() {
            var data = {"id" : "1", "roles" : ['EXTERNAL']};
            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();
            expect(target.currentEditorHasRoles(['FANTASY_ROLE'])).toBeFalsy();
        });

        it('should return false when the editor is not loaded', function() {
            var data = {"id" : "1", "roles" : ['EXTERNAL']};
            mockBackend.expectGET('api/gui/editor').respond(data);

            expect(target.currentEditorHasRoles(['EXTERNAL'])).toBeFalsy();

            mockBackend.flush();
        });

        it('should return true on role: \'EXTERNAL\'', function() {
            var data = {"id" : "1", "roles" : ['EXTERNAL']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['EXTERNAL'])).toBeTruthy();
        });

        it('should return true on role: \'SUPPORT\'', function() {
            var data = {"id" : "1", "roles" : ['SUPPORT']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['SUPPORT'])).toBeTruthy();
        });

        it('should return true on role: \'USER\'', function() {
            var data = {"id" : "1", "roles" : ['USER']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['USER'])).toBeTruthy();
        });

        it('should return true on role: \'SUPERUSER\'', function() {
            var data = {"id" : "1", "roles" : ['SUPERUSER']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['SUPERUSER'])).toBeTruthy();
        });

        it('should return true on role: \'ADMIN\'', function() {
            var data = {"id" : "1", "roles" : ['ADMIN']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['ADMIN'])).toBeTruthy();
        });

        it('should return true on role: \'SUPERADMIN\'', function() {
            var data = {"id" : "1", "roles" : ['SUPERADMIN']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['SUPERADMIN'])).toBeTruthy();
        });

        it('should return true on role: \'UPLOAD\'', function() {
            var data = {"id" : "1", "roles" : ['UPLOAD']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['UPLOAD'])).toBeTruthy();
        });

        it('should return true on role: \'ENCODER\'', function() {
            var data = {"id" : "1", "roles" : ['ENCODER']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['ENCODER'])).toBeTruthy();
        });

        it('should return true when only one role matches', function() {
            var data = {"id" : "1", "roles" : ['USER']};

            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['USER', 'ADMIN'])).toBeTruthy();
        });

        it('should return false when user has no roles', function() {
            var data = {"id" : "1", "roles" : []};
            console.log("Roles");
            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(target.currentEditorHasRoles(['USER', 'ADMIN'])).toBeFalsy();
        });

        it('should return exception when checking on empty roles', function() {
            var data = {"id" : "1", "roles" : ['USER']};
            console.log("Roles");
            mockBackend.expectGET('api/gui/editor').respond(data);
            mockBackend.flush();

            expect(function () {target.currentEditorHasRoles([]) })
              .toThrow(new Error("We expect to check permission on at least one role"));
        });
    });

    describe('Get allowed broadcasters', function() {
        it('should return one allowed broadcaster', function() {
            var data = [
                {'id' : '3VOOR12', 'value' : '3voor12'}
            ];

            mockBackend.whenGET('api/gui/editor').respond({"id" : "1"});
            mockBackend.expectGET('api/gui/editor/broadcasters').respond(data);

            var result = null;

            var promise = target.getAllowedBroadcasters();

            promise.then(function(broadcasters) {
                        result = broadcasters;
                    });

            mockBackend.flush();

            expect(result).toEqual(data);
        });
    });

    describe('Get allowed portals', function() {
        it('should return one allowed portal', function() {
            var data = [
                {'id' : '3VOOR12', 'value' : '3voor12'}
            ];

            mockBackend.whenGET('api/gui/editor').respond({"id" : "1"});
            mockBackend.expectGET('api/gui/editor/portals').respond(data);

            var result = null;

            var promise = target.getAllowedPortals();

            promise.then(function(portals) {
                        result = portals;
                    });

            mockBackend.flush();
            expect(result).toEqual(data);
        });
    });
})
;
