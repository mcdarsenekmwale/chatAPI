var async		= require("async"),
    printJSON   = require('../utils/response'),
    constants   =  require('../utils/constants'),
    Post        =   require('../models/post'),
    Category    = require('../models/category'),
    db_query    = require('../databases/db_post');

const PostController = Post;

/**
* Listing single post
* method GET
* url /post/:id
*/
PostController.get_post = function (req, res, next) {
    try {
        // fetch post
        db_query.getPost(req.params.id, function (err, result) {
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


//get a list of posts
PostController.get_all_posts = function (req, res, next) {
    try {
    // fetch posts
    var error = "";
    db_query.getAllPosts(function (err, result) {
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

//retrieve posts
//by category id
PostController.get_post_by_category = function (req, res, next){
    try {
        db_query.getPostByCategory(req.params.category, function (err, result){
            if (err) next(err);
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

//retrieve posts
//by author id
PostController.get_post_by_user = function (req, res, next){
    try {
        db_query.getPostByUserUid(req.params.user_uid, function (err, result){
            if (err) next(err);
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


//create a post
PostController.save_post_details = function (req, res, next) {
    try {
        var post = new Post(req.body); //create a post object
        //create a post
        db_query.createPosts(post, function (err, response) {
            var message = response;
        
            if (err)
                next(err);
            if (response == constants.POST_CREATED_SUCCESSFULLY) {
                next = "success";
                message = "Post added successfully";
            } else if (response == constants.POST_CREATED_FAILED) {
                next = "failed";
                message = "Oops! An error occurred while adding post detail(s)";
            }
            // echo json response
             printResponse(res, 200, message, next);
        });
    } catch (error) {
        throw error;
    }
}

//delete a particular post
PostController.remove_post = function (req, res, next) {
	try {
		db_query.deletePost(req.params.id, function (err, result) {
			if (err)
				next(err);
			var message = !result?'Posy deleted successfully': "Failed to delete post record";
			next = 'Notification';
			printResponse(res, 200, message, next);
		});
	}
	catch (e) {
		return e;
	}
}

//load categories
PostController.load_categories= function(req, res, next){
    try { 
        var message;  
                // reading post params       
            var category = new Category(req.body); //create an category object
            db_query.isCategoryExists(category, function (err, data){
                if (err) next(err);
                if (!data) {
                    db_query.createCategories(category, function (err, response){
                        message = response;
                        if (err)
                            console.error(err);
                        if (response == constants.CATEGORIES_CREATED_SUCCESSFULLY) {
                            next = "success";
                            message = "categories added successfully";
                        } else if (response == constants.CATEGORIES_CREATE_FAILED) {
                            next = "failed";
                            message = "Oops! An error occurred while adding categories detail(s)";
                        }
                    });
                }
                else{
                     // product with same name already existed in the db
		            next = "failed";
		            message = "Sorry, this category already existed";
                }
                 // echo json response
                 printResponse(res, 200, message, next);
            });
        
        
    } catch (error) {
        throw error;
    }
}

//retrieve all categories
PostController.get_all_categories = function (req, res, next){
    try {
        db_query.getAllCategories(function (err, response){
            if (err) next(err);

            printResponse(res, 200, response, next);
        });
    } catch (error) {
        throw error;
    }
}

module.exports = PostController;