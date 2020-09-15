
//constructors
var post = function (post) {
  this.id = post.id;
  this.image = post.image;
  this.title = post.title;
  this.author = post.author;
  this.category = post.category,
  this.content = post.content;
  this.date = post.date;
  this.expiryDate = post.expiryDate;
};

module.exports = post;