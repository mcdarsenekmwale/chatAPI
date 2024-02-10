var express = require('express');
var router = express.Router();
var AuthController = require('../authentication/auth_controller');
var AuthenticationMiddleware = require('../helper/middleware/authentication');

//login user with username and password
router.post('/auth/login', AuthController.prototype.loginUser);

//logout the current logged in user

router.post('/auth/logout', AuthController.prototype.logoutUser);

//register new user with username, email, password
router.post('/auth/register', AuthController.prototype.addNewUser);

//retrieve refresh token
router.post('/auth/refresh-token', AuthenticationMiddleware.refreshTokenExists, AuthController.prototype.refreshToken);

module.exports = router;