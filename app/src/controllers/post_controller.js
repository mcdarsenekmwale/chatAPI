var async		= require("async"),
    {printResponse, printError}   = require('../utils/response'),
    constants   =  require('../utils/constants'),
    Post        =   require('../models/post'),
    Category    = require('../models/category'),
    PostService    = require('../services/posts.service');
const { error } = require("logrocket");
const StaticFunctions = require("../helper/static_functions");

class PostController {

    constructor() {
        this.postModel = new Post();
        this.categoryModel = new Category();
        this.postService = new PostService();
    }

    /**
    * Listing single post
    * method GET
    * url /post/:id
    */
    async get_post (req, res, next) {
        try {
            // fetch post
            let post = await PostService.prototype.getPost(req.params.id);
            if (post)
                printResponse(res, 200, {post}, next)
            
            return printResponse(res, 404, {
                message: "No post found"
            }, next);
        }
        catch (error) {
            const err = new Error(error);
			printError(res, err);
        }
    }


    //get a list of posts
    async get_all_posts(req, res, next) {
        try {
              let params = PostController.prototype.setDataRetrievalParams(req)
            // fetch posts
            let posts = await PostService.prototype.getAllPosts(params);
            if (posts) {
                posts = posts.sort((a, b) => (a[sortBy] > b[sortBy]) ? 1 : -1);
                printResponse(
                    res, 200, 
                    {
                        page: offset,
                        count : params.limit,
                        context: req.url,
                        'key tips': "Use limit to choose a specific amount of data, sortBy for sorting to a desired column and order for list order.For example: GET ?limit=3&order=ASC&sortBy=name",
                        sortBy: `Sorted by ${sortBy} ${order}`,
                        posts,
                        
                    }
                    , next)
            }

            return;
        
        }
        catch (error) {
            const err = new Error(error);
			printError(res, err);
        }
    }

    //retrieve posts
    //by category id
    async get_post_by_category   (req, res, next){
        try {
            let parmas = PostController.prototype.setDataRetrievalParams(req) = PostController.prototype.setDataRetrievalParams(req)
            let category = await PostService.prototype.getAllPostsByCategoryId(
                req.params.category,
                parmas
            );
            if (category)
                printResponse(res, 200, category, next)
            return;
        } catch (error) {
            const err = new Error(error);
			printError(res, err);
        }
    }

    async get_category(req, res, next) {
        try {
            let categoryId = req.params.id;
            if (!categoryId) throw new Error('No category id provided');

            let parmas = PostController.prototype.setDataRetrievalParams(req);
            let categories = await PostService.prototype.getCategoryById(
                categoryId,
                parmas
            );
            if (categories)
                printResponse(res, 200, {
                    categories
                }, next)
            return;
        } catch (error) {
            const err = new Error(error);
			printError(res, err);
        }
    }

    //set data retrieval defaults parameters
    setDataRetrievalParams(req) {
        let limit = req.query.limit || 10;
        let offset = req.query.offset || 0;
        let sortBy = req.query.sortBy || "date";
        let order = req.query.order || "DESC"; // ASC
        
        offset = offset == 0 ? 1 : offset;
        
        return {
            limit: parseInt(limit),
            offset: parseInt(offset),
            sortBy,
            order
        };
    }
    //retrieve posts
    //by author id
    async get_post_by_user   (req, res, next){
        try {

            let userId = req.params.userId;
            if (!userId) return printError(res, new Error('No user id provided'));
            
            let params = PostController.prototype.setDataRetrievalParams(req)
            let response = await PostService.prototype.getPostByUserId(
                userId, params
            );
            
            if (!response || !Array.isArray(response)) {
                 return printError(res, Error('No user found with the provided uid'));
            } else {
                printResponse(res, 200, {
                    message:'Successfully retrieved all posts from the specified user',
                    data:response
                },next)
            }
        } catch (error) {
            const err = new Error(error);
			printError(res, err);
        }
    }

    //update post  by id
    async update_this_post   (req, res, next) {
        try {
            //static editor

            let postId = StaticFunctions.prototype.checkSetId(req.params[0]);
            if (!postId) return printError(res, new Error("No valid post ID was given"));
            let data = req.body.data || req.body || req.body.posts;
            if (!data) return printError(res, new Error("No data was sent in the request body"));
                 
            let isPostAvailable = await PostService.prototype.getPostById(postId);
              
            if (isPostAvailable) { 
                //updating user details
                let postData = Post.prototype.merge(data, isPostAvailable); //create a post object
                let result = await postData.update();
                if (result === "forbidden"){
                    return printResponse(res, 403, {message:"Forbidden! You are not allowed to edit this post."}, next);
                }else{
                   return printResponse(res, 200, {message:"success", data : result},next);
                }
            }
            else
                return printError(res, "The requested resource could not be found.")
        }catch(e){
           console.log(e);
           printError(res, e);
        }
    };

    //create a post
    async save_post_details   (req, res, next) {
        try {
            //check if user exists
			let posts = req.body.data || req.body || req.body.posts;
			//creating an array of user objects
			if (!Array.isArray(posts)) 
				posts = [posts];
            let result = { status: 400, message: "Bad Request! Invalid post details" };
			//saving all users
			for (let post of posts) {
                let postData = new Post(post); //create a post object
                let isPostAvailable = await PostService.prototype.isPostExists(postData.id);
                
                if (!isPostAvailable) {
                    let response = await postData.save();
                    if (response) {
                        if (posts[posts.length - 1].title == postData.title) {
                            result.status = 201;
                            result.message = `Posts created successfully!`;
                        }

                    }
                }
            }
            return printResponse(res, result.status, result, next);
        } catch (error) {
            const err = new Error(error);
			printError(res, err);
        }
    }

    //delete a particular post
    async remove_post   (req, res, next) {
        try {
            let postId = req.params.id;
			if (postId == null || postId == "") return next(new Error("Invalid post id"));

			//
			let response = await new Post({ id: postId }).delete();
			if (response) {
				return printResponse(res, 200, { message: `Post with an Id of ${postId} deleted successfully` });
			} else {
				return printResponse(res, 404, { message: `No such post found` }, next);
			}
          
        }
        catch (error) {
            const err = new Error(error);
			printError(res, err);
        }
    }

    //load categories
    async load_categories (req, res, next){
        try { 
            
            //check if category exists
			let categories = req.body.data ?? req.body ?? req.body.categories;
			//creating an array of object objects
			if (!Array.isArray(categories)) 
				categories = [categories];
            
			//saving all categories
			for (let category of categories) { 
				var newCategory = new Category({...category}); //create an category object
				const isFound = await  PostService.prototype.isCategoryExists (newCategory);
				if (!isFound) {
					let response = await PostService.prototype.createCategories(newCategory);
					if (response) {
						if (categories[categories.length - 1].name == newCategory.name)
							printResponse(res,
								201, {
								message: `${categories.length > 1? categories.length+" Categories" : ' Category'} created successfully!`
							}, next);
						continue;
					} else {
						printResponse(res, 503,{message:"Oops! An error occurred while adding categories detail(s)"}, next);
					}
				} else {
					if (categories[categories.length - 1].name == newCategory.name)
						printResponse(res, 409, {message: "Sorry, this category already existed."});
					continue;
				}			
			} 
                    // reading post params       
               
            
        } catch (error) {
            const err = new Error(error);
			printError(res, err);
        }
    }

    //retrieve all categories
    async get_all_categories   (req, res, next){
        try {
            let result = await PostService.prototype.getAllCategories();
            printResponse(res, 200, {result}, next);
        } catch (error) {
           const err = new Error(error);
			printError(res, err);
        }
    }

    
}



module.exports = PostController;