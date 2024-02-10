var express = require('express');
var router = express.Router();
const UserController = require('../../controllers/user_controllers');
const AuthenticationMiddleware = require('../../helper/middleware/authentication');
const AuthorizationMiddleware = require('../../helper/middleware/authorization');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



//routes for users
router.get('/users',  UserController.prototype.get_all_users);
router.get('/users/:id',  UserController.prototype.get_user);
router.post('/users/create',
  AuthorizationMiddleware.validateAdminRole,
  UserController.prototype.save_user_details
);
router.delete('/users/delete/:id',
  AuthorizationMiddleware.validateAdminRole,
  UserController.prototype.remove_user
);
router.put('/users/update/:id',
  AuthorizationMiddleware.validAdminOrOwner,
  UserController.prototype.update_user
);


module.exports = router;
