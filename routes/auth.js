const bcrypt = require('bcrypt');
const saltRounds = 10;
const ERR_INVALID = 'Invalid username or password!'
const ERR_EMPTY = 'Some fields were left empty!'
const ERR_U_EXIST = 'User already exists!'
const ERR_GEN = 'Oops! There was an error!'
const passwordCheck = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9]{8,}$/

exports.signup = function(req, res) { 
    var queryString = `INSERT INTO User (username, email, password) VALUES (?,?,?)`;
    if (Boolean(req.body.username) && Boolean(req.body.email) && Boolean(req.body.password) && passwordCheck.exec(req.body.password)) { 
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            res.app.locals.connection.query(queryString, [req.body.username, req.body.email, hash], function(err, results) { 
                console.log(err)
                if (err && err.code == 'ER_DUP_ENTRY') {
                    res.render('signup', {errMessage: ERR_U_EXIST});
                } else if (err) {
                    res.render('signup', {errorMessage: ERR_GEN});
                } else {
                    req.session.user = req.body.username;
                    res.redirect('/dashboard')
                }
            })
        });
    } else {
        res.render('signup', {errorMessage: ERR_GEN});
    } 
}

exports.login = function(req, res) { 
    var queryString = `SELECT * FROM User WHERE username=? OR email=?`;
    if (Boolean(req.body.username) && Boolean(req.body.password)) { 
        res.app.locals.connection.query(queryString, [req.body.username, req.body.username], function(sqlErr, results) { 
            if (!sqlErr && results.length > 0) {
                bcrypt.compare(req.body.password, results[0].password, function(err, result) {
                    if (result) { 
                        req.session.user = results[0].username;
                        res.redirect('/dashboard')
                    } else {
                        res.render('login', {errMessage: ERR_INVALID})
                    }
                });
            } else { 
                res.render('login', {errMessage: ERR_INVALID})
            }
        })
    } else {
        res.render('login', {errMessage: ERR_EMPTY})
    }
}

exports.logout = function(req, res) {
    if (req.session && req.session.user) {
        req.session.destroy();
        res.redirect('login')
    }
}

exports.isAuthenticated = (req, res, next) => {
    if (req.session.user && req.sessionID) {
        next()
    } else {
        res.redirect('/')
    }    
};

exports.redirect = (req, res, next) => {
    if (req.sessionID && req.session.user) {
        res.redirect('/dashboard')
    } else {
        next()
    }    
};