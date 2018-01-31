
if (typeof(window.mediaSelectorDomain) === 'undefined' && console) {
    console.log("No mediaSelectorDomain defined. This file cannot be called directly!");

}
var media = {

    select: function ( callback, options ) {

        var popup;
        var iframe;
        var domain = window.mediaSelectorDomain;
        var query = '';

        if ( options ) {
            for ( var i in options ) {
                var value = options[ i ];
                if ( value !== '' ) {
                    query += ( query.length ? '&' : '?') + i + '=' + value;
                }
            }
        }
        function handleMessage ( e ) {

            if ( e.origin === domain ) {
                callback( e.data );
                if ( popup ) {
                    popup.close();
                }
                if ( iframe ) {
                    iframe.parentNode.removeChild( iframe );
                }
            }
        }

        if ( window.addEventListener ) {
            window.addEventListener( 'message', handleMessage, false );
        } else if ( window.attachEvent ) {
            window.attachEvent( 'message', handleMessage, false );
        }

        if ( document.all ) {
            // some hackery to help IE, because in IE you may not post to other window, only from an iframe.
            iframe = document.createElement( 'iframe' );
            iframe.setAttribute( 'style', 'position:absolute;display:none' );
            iframe = document.body.appendChild( iframe );
            iframe.src = domain + '/CMSSelector/IE.html' + query;
        } else {
            popup = window.open( domain + '/CMSSelector/' + query, '', 'width=1024,height=800,titlebar=no,toolbar=no,statusbar=no,directories=no,location=no' );
        }

    }
};

