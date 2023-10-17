/**
 * Run through the serve NPM script
 */
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync( process.env.SERVER_KEY_PATH, 'utf8');
var certificate = fs.readFileSync( process.env.SERVER_CRT_PATH, 'utf8');

var credentials = {key: privateKey, cert: certificate};

var express = require( 'express' );
var debug = require('debug')('poms');

var app = express();
// var port = process.env.PORT || 4000;

// Base dir
app.use( express.static( './build/work' ) );

// Mappings
app.use( '/node_modules', express.static( './node_modules' ) );
app.use( '/js', express.static( './src/js' ) );
app.use( '/views', express.static( './src/views' ) );
app.use( '/resources', express.static( './src/resources' ) );
app.use( '/build', express.static( './build' ) );

// app.listen( port, function () {
//     debug( 'express server started on localhost:%d', port );
// });

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


httpsServer.listen(8448, function(){
    debug( 'express server started on localhost:%d', 8448 );
});
