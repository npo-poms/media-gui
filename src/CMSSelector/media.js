if (typeof (window.poms_domain) === 'undefined' ) { // would have been filled by media.js.jspx if running on actual deployment
    window.poms_domain = document.currentScript ? new URL(document.currentScript.src).origin : '';
    console && console.log("No window.poms_domain, taking it ", window.poms_domain);
}


const nl_vpro_media_CMSSelector = {
    popupFeatures: 'width=1024,height=800,titlebar=no,toolbar=no,statusbar=no,directories=no,location=no',
    select: function ( callback, options ) {
        const domain = window.poms_domain;
        let popup;
        let iframe;

        let query = '';

        if ( options ) {
            for (let i in options ) {
                let value = options[ i ];
                if (value !== undefined &&  value !== '' ) {
                    query += ( query.length ? '&' : '?') + i + '=' + value;
                }
            }
        }
        function handleMessage ( e ) {

            if ( e.origin === domain || domain === '') {
                callback( e.data );
                if ( popup ) {
                    popup.close();
                }
                if ( iframe ) {
                    iframe.parentNode.removeChild( iframe );
                }
            } else {
                console && console.log("Ignoring since", e.origin, "!=", domain)
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
            popup = window.open( domain + '/CMSSelector/' + query, '', media.popupFeatures);
        }

    }
};

const media = nl_vpro_media_CMSSelector;