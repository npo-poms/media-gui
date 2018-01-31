//https://toddmotto.com/factory-versus-service

function ScreenService($q, $http, appConfig) {
    var s = this;
    s.baseUrl = appConfig.apihost + '/gui/screens/';

    s.load = function(sid) {
        return get( sid );
    };

    s.loadAll = function() {
        return get('');
    };

    s.hasReadPermission = function() {
        return true;
    };

    s.hasWritePermission = function() {
        return true;
    };

    s.hasRemovePermission = function() {
        return true;
    };

    s.create = function(screen) {
        return post( '', screen );
    };

    s.remove = function(screen) {
        return del( screen.sid );
    };

    s.setTitle = function( screen, text ) {
        return post( screen.sid + '/title', {'text': text} );
    };

    s.setDescription = function( screen, text ) {
        return post( screen.sid + '/description', {'text': text} );
    };

    s.setUrl = function( screen, text ) {
        return s.post( screen.sid + '/url', {'text': text} );
    };

    s.getImages = function( screen ) {
        return s.get( screen.sid + '/images' );
    };

    s.saveImage = function( screen, image ) {
        return s.post( screen.sid + '/images', image );
    };

    s.moveImage = function( screen, from, to ) {
        return s.put( screen.sid + '/images', {from: from, to: to} );
    };

    s.removeImage = function( screen, image ) {
        return s.del( screen.sid + '/images/' + image.id );
    };

    s.addScreenOf = function ( screen, screenOf ) {
        return s.post( screen.sid + '/screenOf', screenOf );
    };

    s.getScreenOf = function ( screen ) {
        return s.get( screen.sid + '/screenOf' );
    };

    s.moveScreenOf = function ( screen, from, to ) {
        return s.put( screen.sid + '/screenOf', {from: from, to: to} );
    };

    s.removeScreenOf = function ( screen, screenOf ) {
        return s.del( screen.sid + '/screenOf/' + screenOf.id );
    };

    s.get = function( path, config ) {

        var deferred = $q.defer(),
            url = baseUrl + path;

        $http.get( url, config )
            .success( function ( result ) {
                deferred.resolve( result );
            } )
            .error( function ( error ) {
                deferred.reject( error );
            } );

        return deferred.promise;
    };

    s.post = function( path, body ) {

        var deferred = $q.defer(),
            url = baseUrl + path;

        $http.post( url, body )
            .success( function ( screen ) {
                deferred.resolve( screen );
            } )
            .error( function ( error ) {
                deferred.reject( error );
            } );

        return deferred.promise;
    };

    s.del = function( path ) {

        var deferred = $q.defer(),
            url = baseUrl + path;

        $http.delete( url )
            .success( function ( screen ) {
                deferred.resolve( screen );
            } )
            .error( function ( error ) {
                deferred.reject( error );
            } );

        return deferred.promise;
    };
}

angular.module( 'poms.screen.services' ).service( 'ScreenService', [
    '$q',
    '$http',
    'appConfig',
    ScreenService] );
