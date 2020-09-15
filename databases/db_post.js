var db_connect = require('./connect'),
    CONFIG = require('../utils/constants'),
    db_user = require('../databases/db_user'),
    async = require('async');

/**
   * Creating new posts
   * @param String title 
   * @param String content
   * @param String image
   * @param String category
   * @param String id
   **/
  function create_posts(posts, callback) {
    try {
        console.log(posts);
        db_connect.query(`INSERT INTO posts (id, image, title, author, category, content, date, expiry_date) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
                        [posts.id, posts.image,posts.title,posts.author, posts.category, posts.content, posts.date, posts.expiryDate], 
                        function (err, res) {
            if (err)
                return  callback(err, null);
           
            if(res.rowCount < 1)
                return callback(null, CONFIG.POST_CREATE_FAILED);
            return callback(null, CONFIG.POST_CREATED_SUCCESSFULLY);
        });
    }
    catch (e) {
        return e;
    }
}   


/**
    * Fetching All posts
    * 
    */
async function fetch_all_posts(callback){
    try {
        return db_connect.query(`SELECT posts.id , posts.image, posts.title, posts.content, posts.date, 
		                        categories.name category,users.name, users.avatar, users.uid, users.username
                            FROM ((posts INNER  JOIN categories ON posts.category=categories.id) INNER JOIN users ON 
                            posts.author = users.uid) ORDER BY date LIMIT 20`, function (err, res) {
            if (err)
                return callback(err, null);
            //Adding results to an array
            var result = {};
            var response = [];
            res.rows.forEach((row) => {
                response.push(toJsonPost(row, result));
                result = {};
            });
            //Displaying the array in json format 
            return callback(null, response);
        });      
    } catch (error) {
        return error;
    }
}


/**
 * get a single post
 * Fetching 
 * @param String  id of the post
 */
async function fetch_post(id, callback){
    try {
        return db_connect.query(`SELECT posts.id , posts.image, posts.title, posts.content, posts.date, 
                                categories.name category,users.name, users.avatar, users.uid, users.username
                                FROM ((posts INNER  JOIN categories ON posts.category=categories.id) INNER JOIN users ON 
                                posts.author = users.uid) WHERE posts.id =$1`, [id], function (err, res) {

            if (err)
                return callback(err, null);
            //Adding results to an array
            var result={};
            res.rows.forEach((row) => toJsonPost(row,result));
            return callback(null, result);
        });
    } catch (error) {
        throw error;
    }
}

//get post categories
//by id
async function get_category_by_id(category_id, callback){
    try {
       return db_connect.query('SELECT name FROM categories WHERE id = ($1)',[category_id], function(err, res){
            if (err) return err;
            res.rows.forEach((row)=>name = row.name);
         
            return callback(name);
        });
    } catch (error) {
        throw error;
    }
}

//get all post by category
//category id
async function fetch_posts_by_category_id(category_id, callback){
    try {
        db_connect.query(`SELECT posts.id , posts.image, posts.title, posts.content, posts.date, 
                            categories.name category,users.name, users.avatar, users.uid, users.username
                            FROM ((posts INNER  JOIN categories ON posts.category=categories.id) INNER JOIN users ON 
                            posts.author = users.uid) WHERE posts.category =$1`,[category_id], function (err, res){
            if (err) return callback(err, null);
            //Adding results to an array
            var result = {};
            var response = [];
            res.rows.forEach((row) => {
                response.push(toJsonPost(row, result));
                result = {};
            });
            //Displaying the array in json format 
            return callback(null, response);
        });
    } catch (error) {
        throw error;
    }
}

//get all post by an author
//user uid
async function fetch_post_by_user_uid(author_uid, callback){
    try {
        db_connect.query(`SELECT posts.id , posts.image, posts.title, posts.content, posts.date, 
        categories.name category,users.name, users.avatar, users.uid, users.username
        FROM ((posts INNER  JOIN categories ON posts.category=categories.id) INNER JOIN users ON 
        posts.author = users.uid) WHERE posts.author =($1)`,[author_uid], function (err, res){
            if (err) return callback(err, null);
            //Adding results to an array
            var result = {};
            var response = [];
            res.rows.forEach((row) => {
                response.push(toJsonPost(row, result));
                result = {};
            });
            //Displaying the array in json format 
            return callback(null, response);
        });
    } catch (error) {
        throw error;
    }
}


/**
* Deleting a post
* @param String id of the post to delete
 */
function delete_post(id, callback) {
    try {
        return db_connect.query("DELETE FROM posts WHERE id = $1", [id], function (err, row) {
                // body...
            if (err)
                return callback(err, null);
            return callback(null, row.affectedRows > 0);
            });
        }
        catch (e) {
            return e;
    }
} 

//create a load of categories
function create_categories(categories, callback){
    try {
        db_connect.query('INSERT INTO categories (id, name, search_key) VALUES ($1, $2, $3)',
            [categories.id, categories.name, categories.searchKey], function (err, res){
                if (err) return callback(err, null);
                if(res.rowCount < 1) return callback(null, CONFIG.CATEGORIES_CREATE_FAILED);
                return callback(null, CONFIG.CATEGORIES_CREATED_SUCCESSFULLY);
            });
    } catch (error) {
        throw error;
    }
}

//fetch all categories
function fetch_all_categories(callback) {
    try {
        db_connect.query('SELECT * FROM categories', function (err, res){
            if (err) return callback(err, null);

            return callback(null, res.rows);
        });
    } catch (error) {
        throw error;
    }
}

//check if the category exist
/**
     * Checking for duplicate Category by name
     * @param String category name to check in db
     * @return boolean
     */
async function is_category_exists(category, callback) {
    var exist = false;
    return db_connect.query("SELECT * FROM categories WHERE name = $1",[category.name], function(err, res) {
        // body...
        if (err) return  callback(err,null);
        if(res.rowCount > 0) return  callback(null, !exist);
        
        return  callback(null, exist); 
    });    
}

//change to json
function fromJson(row, result){
    result["id"]            = row.id;
    result["title"]         = row.title;
    result["image"]         = row.image;
    result['category']      = get_category_by_id(row.category);
    result["content"]       = row.content;
    result['date']          = row.date;
    result['author']        = db_user.getUser(row.author, function (err, res){
                                if (err) return err;
                                return res;
                            });
    return result;
}


//to user and category
//change to json
function toJsonPost(row, result){
    result["id"]            = row.id;
    result["title"]         = row.title;
    result["image"]         = row.image;
    result['category']      = row.category;
    result["content"]       = row.content;
    result['date']          = row.date;
    result['author']        = {
                                "name":row.name,
                                "uid":row.uid,
                                "avatar":row.avatar
                            };
    return result;
}

module.exports = {
    createPosts : create_posts,
    getAllPosts : fetch_all_posts,
    getPost : fetch_post,
    getPostByCategory : fetch_posts_by_category_id,
    getPostByUserUid: fetch_post_by_user_uid,
    deletePost: delete_post,
    createCategories: create_categories,
    getAllCategories : fetch_all_categories,
    isCategoryExists: is_category_exists
};