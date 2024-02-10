var async		= require("async"),
    {printResponse, printError, ResponseUtil} = require('../utils/response'),
    constants =  require('../utils/constants'),
    User    =   require('../models/user'),
     UserService = require('../services/user.service');

class UserController {

	constructor() { 
		this.UserModel = new User()
		this.userService = new UserService();
	}
	
		/**
	 * Listing single user
	 * method GET
	 * url /user/:id
	 */
	async get_user(req, res, next) {
		try {
			let userId = req.params.id;
			if (userId == null || userId == "") return next(new Error("Invalid user id"));
				// fetch user
			const user = await  UserService.prototype.getUser(userId);
			if(user)
				printResponse(res, 200, {user}, next);
				
		}
		catch (error) {
			const err = new Error(error);
            printError (res, err);
		}
	}

	// get all users
	async get_all_users  (req, res, next) {
		try {
				let limit = req.query.limit || 10;
				let offset = req.query.offset || 0;
				let sortBy = req.query.sortBy || "created_on";
			let order = req.query.order || "DESC"; // ASC
		
			offset = offset == 0? 1 : offset;
			// fetch users
			let {users, total} = await  UserService.prototype.getAllUsers(limit, offset, sortBy, order);

			if (users)
			{	
				users.sort((a, b) => (a[sortBy] > b[sortBy]) ? 1 : -1);
				let data = {
					page:  offset,
					count: total,
					context: req.url,
					nextDataLink: req.url.toString().replace(/offset=\d+/, `offset=${(Number(offset)+1)}`),
					previousDataLink: req.url.toString().replace(/offset=\d+/,`offset=${Math.max(0,Number(offset)-1)}`) ,
					'key tips': "Use limit to choose a specific amount of data, sortBy for sorting to a desired column and order for list order.For example: GET ?limit=3&order=ASC&sortBy=name",
					sortBy: `Sorted by ${sortBy} ${order}`,
					users: users
				};
				if (!data.count)
					delete data.nextDataLink;
				if (Number(offset) - 1 < 0)
					delete data.previousDataLink;
				printResponse(res, 200, data, next);	
			}
			
			return;
			
		} catch (error) {
			const err = new Error(error);
			printError(res, err);
		}
	}


	//userdetails
	async save_user_details  (req, res, next) {
		try {
			//check if user exists
			let users = req.body.data || req.body || req.body.users;
			//creating an array of user objects
			if (!Array.isArray(users)) 
				users = [users];
            
			//saving all users
			for (let user of users) {
				let userData = new User(user);
				const isFound = await  UserService.prototype.doesUserExist(userData);
				if (!isFound) {
					let response = await userData.save();
					if (response) {
						if (users[users.length - 1].email == userData.email)
							printResponse(res,
								201, {
								message: `${users.length > 1? users.length+" Users" : ' User'} created successfully!`
							}, next);
						continue;
					} else {
						printResponse(res, 503,{message:"Failed to create the user!"}, next);
					}
				} else {
					if (users[users.length - 1].email == userData.email)
						printResponse(res, 409, "User already exist.");
					continue;
				}			
			}
			
		}
		catch (error) {
			const err = new Error(error);
			printError(res, err);
			// throw new Error(error);
		}
	}


	async remove_user  (req, res, next) {
		try {
			let userId = req.params.id;
			if (userId == null || userId == "") return next(new Error("Invalid user id"));

			//
			let response = await new User({ uid: userId }).delete();
			if (response) {
				return printResponse(res, 200, { message: `User has been deleted.` });
			} else {
				throw new Error(`Unable to delete the user with ID ${userId}`);
			}
		}
		catch (error) {
			const err = new Error(error);
			printError(res, err);
		}
	}


	//update user details
	async update_user (req, res, next) {
		try {
			let object = req.body;
			let userId = req.params.id;
			if (userId == null || userId == "") return next(new Error("Invalid user id"));
			if (object == null || object == "") return next(new Error("Invalid user details"));
			if (Object.keys(object).length == 0) return next(new Error("Invalid user details"));


			let userData = await new User({ uid: userId }).fetch();
			if (!userData) return next(new Error("Invalid user id"));

			//updating user details
			let updatedData = User.prototype.assign(userData, object);
			let response = await updatedData.update();
			if (response)
				return printResponse(res, 200, {
					message: `User details has been updated.`,
					user: (updatedData.omit("password"))
				});
			return ResponseUtil.notFoundResponse(res, new Error(`Unable to update the user with ID ${userId}`));
		
		}
		catch (error) {
			const err = new Error(error);
			printError(res, err);
		}
	}
}




module.exports = UserController;