var async		= require("async"),
    printJSON = require('../utils/response'),
    constants =  require('../utils/constants'),
    User    =   require('../models/user'),
    db_query = require('../databases/db_user');

const UserController = User;


	/**
	 * Listing single user
	 * method GET
	 * url /user/:id
	 */
UserController.get_user = function (req, res, next) {
        try {
            // fetch user
            db_query.getUser(req.params.id, function (err, result) {
                if (err)
                    next(err);
                // body...
                var message;
                if (result != null)
                    message = result;
                else
                    message = "over";
                printResponse(res, 200, message, next);
            });
        }
        catch (e) {
            return e;
        }
}

UserController.get_all_users = function (req, res, next) {
        try {
    	// fetch users
		var error = "";
		db_query.getAllUsers(
			function (err, result) {
				// body...
				if (err)
					next(err);
				if (result != null)  
					next = true;
				else {
					next = false;
					result = "not found";
				}

				printResponse(res, 200, result, next);
			});
        } catch (error) {
            throw error;
        }
}


//userdetails
UserController.save_user_details = function (req, res, next) {
	try {
        //check if user exists
        var users = new User(req.body);
		db_query.doesUserExist(users, function (error, data) {
			if (error)
                console.error(error);
			if (!data) {
				db_query.createUsers(users, function (err, response) {
                    var message = response;
                    console.info(response);
					if (err)
						console.error(err);
					if (response == constants.USER_CREATED_SUCCESSFULLY) {
						next = "success";
						message = "User added successfully";
					} else if (response == constants.USER_CREATE_FAILED) {
						next = "failed";
						message = "Oops! An error occurred while adding user  detail(s)";
					}
					// echo json response
					printResponse(res, 200, message, next);
				});
			}
		});
	}
	catch (e) {
		return e;
	}
}


UserController.remove_user = function (req, res, next) {
	try {
		db_query.deleteUser(req.params.id, function (err, result) {
			if (err)
				next(err);
			var message = !result?'User deleted successfully': "Failed to delete user record";
			next = 'Notification';
			printResponse(res, 200, message, next);
		});
	}
	catch (e) {
		return e;
	}
}


//update user details
UserController.update_user = function (req, res, next) {
	try {
		var users= new User(req.body);
		db_query.updateUser(req.params.id, users, function (err, result) {
			if (err)
				next(err);
			var message = result?"User updated successfully": "Failed to update user details";
			printResponse(res, 200, result, message);
		});
	}
	catch (e) {
		return e;
	}
}

module.exports = UserController;