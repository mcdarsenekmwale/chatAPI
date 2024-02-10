var express = require('express');
const postsRouter = require('./posts.route'),
  chatRoute = require('./chat.route'),
    groupRoute = require('./groups.route'),
    userRoute = require('./users.route');
const AuthenticationMiddleware = require('../../helper/middleware/authentication');
const AuthorizationMiddleware = require('../../helper/middleware/authorization');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


// Other endpoints for the API will be defined here
router.use(AuthenticationMiddleware.isAuthenticated,
    AuthorizationMiddleware.userHasValidAPIKey); // Authenticate all requests to this router
router.use(userRoute); // Authenticate all requests to this router
router.use(postsRouter);
router.use(chatRoute);
router.use(groupRoute);

module.exports = router;