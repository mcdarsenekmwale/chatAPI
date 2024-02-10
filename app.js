require('dotenv').config();
var createError = require('http-errors'),
    express       = require('express'),
    path          = require('path'),
    cookieParser  = require('cookie-parser'),
    logger        = require('morgan'),
    // watch         = require('node-watch'),
    indexRouter   = require('./app/src/routes/index'),
    LogRocket     = require('logrocket'),
    apiRouter   = require('./app/src/routes/api/api.route'),
  livereload = require('livereload'),
  connectLiveReload = require('connect-livereload'),
  AuthorizationMiddleware = require('./app/src/helper/middleware/authorization')

        
LogRocket.init('xluiui/smash_app');
// watch('/', { recursive: true }, function(evt, name) {
//   console.log('%s changed.', name);
// });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app/public')));


// Live Reload configuration
const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});


app.use(connectLiveReload())

app.use('/', indexRouter);
app.use('/api/v1', AuthorizationMiddleware.requestHasValidAPIKey, apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
