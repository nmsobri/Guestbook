var mysql = require( 'mysql' );
var pagination = require( 'pagination' );
var express = require( 'express' );
var router = express.Router();
var paginationView = require('./../modules/pagination.view');

var mysqlPool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'guestbook'
});


router.get( '/', function( req, res, nxt ) {
    mysqlPool.getConnection(function(err, conn) {
        if(err) return nxt(err);
        conn.query( 'SELECT COUNT(*) AS total FROM guestbook', function( err, result ) {
            conn.release();
            if (err) return nxt(err);
            var page = req.query.page || 1;
            var total = result[0].total;
            var perPage = 5;

            var paginator = new pagination.TemplatePaginator({
                prelink:'/', current: page, rowsPerPage: perPage,
                totalResult: total, slashSeparator: false,
                template: paginationView
            });

            mysqlPool.getConnection(function(err, conn) {
                if(err) return nxt(err);
                conn.query( 'SELECT * FROM guestbook LIMIT ?, ?',[ (page -1) * perPage, perPage], function( err, result ) {
                    conn.release();
                    if (err) return nxt(err);
                    res.render("index", {signs:result, paginator:paginator, home : 'active'})
                });
            });

        });
    });
});


router.post( '/', function(req, res, nxt) {
    req.assert('name', 'Name is required').notEmpty();
    req.assert('email', 'Valid email required').notEmpty().isEmail();
    req.assert('message', 'Message is required').notEmpty();
    var errors = req.validationErrors(true);

    if (errors) {
        return mysqlPool.getConnection(function(err, conn) {
            if(err) return nxt(err);
            conn.query( 'SELECT COUNT(*) AS total FROM guestbook', function( err, result ) {
                conn.release();
                if(err) return nxt(err);
                var page = req.query.page || 1;
                var total = result[0].total;
                var perPage = 5;

                var paginator = new pagination.TemplatePaginator({
                    prelink:'/', current: page, rowsPerPage: perPage,
                    totalResult: total, slashSeparator: false,
                    template: paginationView
                });

                mysqlPool.getConnection(function(err, conn) {
                    if(err) return nxt(err);
                    conn.query( 'SELECT * FROM guestbook LIMIT ?, ?',[ (page -1) * perPage, perPage], function( err, result ) {
                        conn.release();
                        if(err) return nxt(err);
                        res.render("index", {signs:result, paginator:paginator, errors:errors || {}, home: 'active'})
                    });
                });

            });
        });
    }

    return mysqlPool.getConnection(function(err, conn) {
        if(err) return nxt(err);
        conn.query( 'INSERT INTO guestbook ( name, email, message ) VALUES ( ?, ?, ? )',
            [ req.body.name, req.body.email, req.body.message ],
            function( err, result ) {
                conn.release();
                if(err) return nxt(err);
                req.flash( 'suc_msg', 'Successfully signed guestbook' );
                res.redirect( '/' );
            });
    });
});


router.get('/edit/:id', function(req, res,  nxt) {
    mysqlPool.getConnection(function(err, conn) {
        if(err) return nxt(err);
        conn.query( 'SELECT * FROM guestbook WHERE id = ?',[req.params.id], function( err, result ) {
            conn.release();
            if(err) return nxt(err);
            res.render('edit', {sign:result, home: 'active'});
        });
    });
});


router.put('/edit/:id', function(req, res, nxt) {
    req.assert('name', 'Name is required').notEmpty();
    req.assert('email', 'Valid email required').notEmpty().isEmail();
    req.assert('message', 'Message is required').notEmpty();
    var errors = req.validationErrors(true);

    if(errors) {
        return res.render('edit', {errors: errors || {}, home: 'active'});
    }

    return mysqlPool.getConnection(function(err, conn) {
        if(err) return nxt(err);
        conn.query( 'UPDATE guestbook set name = ?, email = ?, message = ? WHERE id = ?',
            [ req.body.name, req.body.email, req.body.message, req.params.id ],
            function( err, result ) {
                conn.release();
                if(err) return nxt(err);
                req.flash( 'suc_msg', 'Successfully update guestbook sign' );
                res.redirect('/edit/'+req.params.id);
        });
    });
});


router.delete('/delete/:id', function(req, res, nxt) {
    return mysqlPool.getConnection(function(err, conn) {
        if(err) return nxt(err);
        conn.query( 'DELETE FROM guestbook WHERE id = ?',[ req.params.id ], function( err, result ) {
            conn.release();
            if(err) return nxt(err);
            req.flash( 'suc_msg', 'Successfully delete guestbook sign' );
            res.redirect('/');
        });
    });
});


router.get('/about', function(req, res, nxt){
    res.render('about', { about: 'active'});
});


router.get('/contact', function(req, res, nxt) {
   res.render('contact', { contact: 'active'});
});

module.exports = router;