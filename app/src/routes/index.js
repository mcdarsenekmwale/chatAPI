var express = require('express'),
  endpoints = require('../utils/config').endpoints;
const authRoute = require('./auth.route');
   

var router = express.Router();

//auth routes
router.use(authRoute);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',
    {
      title: 'Chat API Documentation',
      apiEndpoints:endpoints
    });
});

router.get('/api/doc/*', (req, res, next) => {
  res.redirect('/');
})

module.exports = router;
