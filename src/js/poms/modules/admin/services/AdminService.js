angular.module( 'poms.admin.services' ).factory( 'AdminService', [
    '$q',
    '$http',
    'appConfig',
    function ( $q, $http, appConfig ) {
        var baseUrl = appConfig.apihost + '/gui/admin';

        function get ( path, config ) {
            var deferred = $q.defer();

            $http.get( baseUrl + path, config )
                .success( function ( data ) {
                    deferred.resolve( data );
                }.bind( this ) )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        }

        function post ( path, body, config ) {

            var deferred = $q.defer();

            $http.post( baseUrl + path, body, config )
                .success( function ( data ) {
                    deferred.resolve( data );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        }

        function del ( path, id ) {

            var deferred = $q.defer(),
                url = baseUrl + path + '/' + id;

            $http.delete( url )
                .success( function ( media ) {
                    deferred.resolve( media );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        }

        function AdminService () {
        }

        AdminService.prototype = {

            getBroadcasters: function () {
                return get( '/broadcasters' );
            },

            getDestinations: function () {
                return get( '/destinations' );
            },

            index: function () {
                return get( '/index' );
            },

            removeBroadcaster: function ( broadcaster ) {
                return del( '/broadcasters', broadcaster.id );
            },

            saveBroadcaster: function ( broadcaster ) {
                return post( '/broadcasters', broadcaster );
            },

            republish: function ( form, offset, max ) {
                var config = {};
                if ( offset || max ) {
                    if ( offset ) {
                        config.params = {offset: offset};
                    }
                    if ( max ) {
                        config.params = config.params || {};
                        config.params.max = max;
                    }
                }
                return post( '/republish', form, config );
            }
        };

        return new AdminService();
    }
] );
