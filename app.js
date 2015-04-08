var path = require( 'path' );
var swig = require( 'swig' );
var express = require( 'express' );
var flash = require( 'connect-flash' );
var cookie = require( 'cookie-parser' );
var favicon = require( 'serve-favicon' );
var bodyParser = require( 'body-parser' );
var session = require( 'express-session' );
var validator = require( 'express-validator' );
var methodOverride = require( 'method-override' );

var app = express();
app.set( 'views', path.join( 'views' ) );
app.set( 'view engine', 'html' );
app.engine( 'html', swig.renderFile );
app.set( 'port', 3000 );

/*Middleware*/
app.use( favicon( path.join( 'public', 'favicon.ico' ) ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( cookie() );
app.use( session( { resave: false, saveUninitialized: false, secret: 'SD#$dfsdS%^sfaSCVBAS%$W$' } ) );
app.use( flash() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {extended: true} ) );
app.use( validator() );

app.use( function(req, res, nxt) {
    res.locals.suc_msg = req.flash('suc_msg');
    res.locals.err_msg = req.flash('err_msg');
    res.locals.req = req;
    nxt();
});

app.use( methodOverride( function(req, res) {
    var method = null;
    if ( req.query._method ) {
        method = req.query._method;
        return method;
    }
    if ( req.body && typeof req.body === 'object' && '_method' in req.body ) {
        method = req.body._method;
        delete req.body._method;
        return method
    }
}, { methods:['POST','GET'] } ) );

app.use( '/', require( './routes/home' ) );

/*Error middleware need to be declare after router declaration*/
app.use(function(err, req, res, nxt) {
    res.status( err.status || 500 );
    res.render( 'error', { error: err } );
});

var server = app.listen( app.get( 'port' ), function() {
    console.log( 'Server running at http://localhost:%s', server.address().port );
});