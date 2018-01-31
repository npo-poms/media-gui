/**
 * Run through the serve NPM script
 */
var express = require( 'express' );
var debug = require('debug')('poms');

var app = express();
var port = process.env.PORT || 4000;

// Base dir
app.use( express.static( './build/work' ) );

// Mappings
app.use( '/node_modules', express.static( './node_modules' ) );
app.use( '/js', express.static( './src/js' ) );
app.use( '/views', express.static( './src/views' ) );
app.use( '/resources', express.static( './src/resources' ) );

app.listen( port, function () {

    debug( 'express server started on localhost:%d', port );
});