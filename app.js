const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')

let MongoStore = require('connect-mongo')(session)
require('dotenv').config()
require('./lib/passport')

const indexRouter = require('./routes/index');

const app = express();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then((thing)=>console.log(`MongoDB connected`))
  .catch(err=>console.log('Oops! Mongo error', err))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    resave:true,
    saveUninitialized:true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: MONGO_URI = 'mongodb://localhost/EJSpass',
        mongooseConnection: mongoose.connection,
        autoReconnect: true
    }),
    cookie:{
        secure: false,
        maxAge: 6000000
    }
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next) => {
  res.locals.user = req.user
  res.locals.missingInfo = req.flash('missingInfo')
  res.locals.errors = req.flash('errorMessage')
  res.locals.success = req.flash('successMessage')
  next()
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('main/error');
});
// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
mongoose.set('useFindAndModify', false)

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
