const { v4: uuidv4 } = require('uuid');
const PostService = require('../services/posts.service');


//constructors
class Post {
  constructor(post) {
    this.title = post.title;
    this.link = post.link;
    this.upvotes = post.upvotes || 0;
    this.downvotes = post.downvotes || 0;
    this.date = post.date;
    this.expiryDate = post.expiryDate;
    this.author = post.author;
    this.category = post.category,
      this.content = post.content;
    this.id = this.getId(post.id);
    this.image = post.image;
    this.searchKey = post.searchKey;
    this.editor = post.editor;
  }

  getId(id) {
    try {
      if (id) return id;
      return uuidv4().toString();
    } catch (error) {
      throw new Error(error);
    }
  }

  //convert category to integer
  getCategory(category) {
    try {
      if (Number.isInteger(category)) return category;
      return Number.parseInt(category);
    } catch (error) {
      throw new Error(error);
    }
  }


  async save(){
    try {
      let res = await PostService.prototype.createPosts(this);
      if (res) return res;
      return false;
        
      } catch (error) {
        throw new Error(error);
      }
  }
  
   async update() {
     try {
       let isAuthorized = await PostService.prototype.isAuthorOfPost(this);

       console.info(isAuthorized)
      if (!isAuthorized)
             return "forbidden";
          const res = await PostService.prototype.updatePost(this);
          if (res) return res;
            return false;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    //delete

    async delete(){
        try {
            const res = await PostService.prototype.deletePost(this.id);
            if (res) return res;
            return false;
        } catch (err) {
            console.log("Error: ", err);
            throw new Error(err);
        }
  }
  
  //merge 
  merge(post, options) { 
    try {
          let _obj = new Post({
                ...post, 
			});
      for (const key in _obj) {
          if (_obj.hasOwnProperty(key) && _obj[key] === undefined) {
            _obj[key] = options[key];
          }
      }
      _obj.id = options.id;
			return _obj;
      
    } catch (error) {
      throw error;
    }
  }

  
  async get() {
    try {
      const res = await PostService.prototype.getPost(this.id);
      if (res)
        return res;
      return false;
    } catch (error) {
      throw new Error(error);
    }
  }


}

module.exports = Post;