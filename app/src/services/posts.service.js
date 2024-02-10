var db_connect = require('./connect'),
    CONFIG = require('../utils/constants'),
    userService = require('./user.service'),
    async = require('async');

class PostService{

    constructor() {
            this.userService = new userService();
    }
    
        /**
         * Fetching All posts
         * 
         */

        /**
     * Creating new posts
     * @param String title 
     * @param String content
     * @param String image
     * @param String category
     * @param String id
     **/
    async createPosts(posts) {
        try {
           
            let fDate = d => new Date(d);

            
           
           let response = await db_connect.query(`INSERT INTO posts (post_id, image, title, author, category, content, date, expiry_date) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
               [posts.id, posts.image, posts.title, posts.author, posts.category, posts.content,fDate(posts.date), fDate(posts.expiryDate)]);
            
            if (response.rowCount < 0) 
                return CONFIG.POST_CREATE_FAILED;
            return CONFIG.POST_CREATED_SUCCESSFULLY;
        }
        catch (e) {
            console.info(e)
            throw new Error(e);
        }
    }   

    //check if the post by id exists
    async isPostExists(id) {
        try {
            let query = `SELECT * FROM posts WHERE post_id=$1;`;
            let result = await db_connect.query(query, [id]);
            return result.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    //get the post data from database using its ID
    async getPostById(id) {
      try {
            const query = 'SELECT * FROM posts WHERE post_id = $1';
          const results = await db_connect.query(query, [id]);
          let r = results.rows[0];
          if (!r) return;
          return {
                id: r.post_id,
                title: r.title,
                image: r.image,
                category: r.category,
                content: r.content,
                date: r.date,
                author: r.author,
                expiryDate: r.expiry_date
            };
      } catch (error) {
        throw error;
      }
    }


    //change to json
    fromJson(row, result){
        result["id"]            = row.post_id;
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


    /**
        * Fetching All posts
        * 
        */
    async getAllPosts({ limit= 10, sortBy, order , offset} ){
        try {
             const _offset = (offset - 1) * limit;
            const query = `SELECT p.post_id , p.image, p.title, p.content, p.date, 
                                    c.name category,u.name, u.avatar, u.uid, u.username
                                FROM ((posts p INNER  JOIN categories c ON p.category=c.id) INNER JOIN users u ON 
                                p.author = u.uid) ORDER BY ${sortBy} ${order} OFFSET ${_offset} LIMIT ${limit}`;
            const response = await db_connect.query(query);

            //Displaying the array in json format 
            if (response.rowCount > 0) 
                return response.rows.map(
                    v => this.toJsonPost(v, {})
                );
            return;
                
        } catch (error) {
            throw new Error(error);
        }
    }


    /**
     * get a single post
     * Fetching 
     * @param String  id of the post
     */
    async getPost(id){
        try {
            let response = await db_connect.query(`SELECT p.post_id , p.image, p.title, p.content, p.date, 
                                    c.name category,u.name, u.avatar, u.uid, u.username
                                    FROM ((posts p INNER  JOIN categories c ON p.category=c.id) INNER JOIN users u ON 
                                    p.author = u.uid) WHERE p.post_id =$1`, [id]);
            if (response.rowCount > 0) 
                return response.rows.map(v => this.toJsonPost(v, {}))[0];
            return;

        } catch (error) {
            throw new Error(error);
        }
    }

    //get post categories
    //by id
    async getCategoryById(category_id, params){
        try {
            let query = `SELECT name FROM categories WHERE id = ($1)`
            let response = await db_connect.query(query, [category_id],);
            if (response.rowCount > 0)
                return response.rows.map(v => v);
            return;
        } catch (error) {
            throw error;
        }
    }

    //get all post by category
    //category id
    async getAllPostsByCategoryId(category_id){
        try {
            let response = await db_connect.query(`SELECT p.post_id , p.image, p.title, p.content, p.date, 
                                c.name category,u.name, u.avatar, u.uid, u.username
                                FROM ((posts as p INNER  JOIN categories as c ON p.category=c.id) INNER JOIN users as u ON 
                                p.author = u.uid) WHERE p.category =$1`, [category_id]);
            
            if (response.rowCount > 0)
                return response.rows.map((v) => this.toJsonPost(v, {}));
            return ;
        } catch (error) {
            throw error;
        }
    }

    //get all post by an author
    //user uid
    async getPostByUserId(author_uid, params={limit:20, offset:0} ){
        try {
            console.info(params);
            let response = await db_connect.query(`SELECT p.post_id , p.image, p.title, p.content, p.date, 
            c.name category,u.name, u.avatar, u.uid, u.username
            FROM ((posts as p INNER  JOIN categories as c ON p.category=c.id) INNER JOIN users as u ON 
            p.author = u.uid) WHERE p.author =($1)`, [author_uid],);
            
            if (response.rowCount > 0)
                return this.formatResponseToArray(response.rows).sort((a, b)=>b.date-a.date);
            return ;
        } catch (error) {
            throw error;
        }
    }

    //check if author is the one editting post
    async isAuthorOfPost(post) {
        try {
            let response = await db_connect.query(`SELECT * FROM posts WHERE post_id=($1) AND author =($2)`,
                [post.id, post.editor],);
            return response.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    formatResponseToArray(rows) {
        return rows.map((row) => this.toJsonPost(row, {}));
    }

    async updatePost(update) {
        try {
            let response = await db_connect.query("UPDATE posts SET image = $1, title = $2, category = $3, content = $4, date = $5, expiry_date = $6 WHERE post_id = $7",
                [update.image, update.title, update.category, update.content, update.date, update.expiryDate, update.id]);
            
            console.info(response)
            
            return (response.rowCount > 0)
              ? CONFIG.POST_UPDATED_SUCCESSFULLY : CONFIG.POST_NOT_FOUND;
        } catch (error) {
            throw error;
        }
    }


    /**
    * Deleting a post
    * @param String id of the post to delete
    */
    async deletePost(id) {
        try {
            let response = await db_connect.query("DELETE FROM posts WHERE post_id = $1", [id]);
            return response.rowCount > 0
                ? CONFIG.POST_DELETED_SUCCESSFULLY : CONFIG.POST_NOT_FOUND;
            }
            catch (e) {
                throw new Error(e);
        }
    } 

    //create a load of categories
    async createCategories(categories){
        try {
            let response = await db_connect.query('INSERT INTO categories (id, name, search_key) VALUES ($1, $2, $3)',
                [categories.id, categories.name, categories.searchKey]);
            return (response.rowCount > 0)
                ? CONFIG.CATEGORIES_CREATED_SUCCESSFULLY: CONFIG.CATEGORIES_CREATE_FAILED;
        } catch (error) {
            console.info(error);
            throw error;
        }
    }

    //fetch all categories
    async getAllCategories(callback) {
        try {
            let response = await db_connect.query('SELECT * FROM categories');
            if (response.rowCount > 0)
                return response.rows;
            return;
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
    async isCategoryExists(category) {
        try {
            let response = await db_connect.query("SELECT * FROM categories WHERE name = $1", [category.name]);
                
            return response.rowCount;

        } catch (error) {
            throw new Error(error);
        } 
    }

    

    //to user and category
    //change to json
    toJsonPost(row, result){
        result["id"]            = row.post_id;
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

}

module.exports = PostService;