require('dotenv').config();
const express = require('express')
const mysql = require('mysql')
const { uuid } = require('uuidv4');
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')
const session = require('express-session')
const app = express()

app.use(express.static('public'))
app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Module dependencies 
var auth = require('./routes/auth')

app.use(session({
    secret: process.env.SECRET,
    genid: function(req) {
        return uuid()
    },
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60000 }
}))

app.locals.connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
})

app.locals.connection.connect((err) => {
    if (err) throw err;
});

// Routes 
app.get('/', auth.redirect, (req, res) => { res.render('login')})

app.route('/login')
    .get(auth.redirect, (req, res) => { res.render('login')})
    .post(auth.login)

app.route('/signup')
    .get(auth.redirect, (req, res) => { res.render('signup')})
    .post(auth.signup)

app.get('/dashboard', auth.isAuthenticated, (req, res) => {
    res.render('dashboard', {session: req.session, isAuthenticated: true})
})

app.get('/logout', auth.logout)
app.listen(8080)