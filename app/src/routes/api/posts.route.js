var express = require('express');
var router = express.Router();
var   post_controller = require('../../controllers/post_controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//category routes
router.get('/categories', post_controller.prototype.get_all_categories);
router.get('/category/:id', post_controller.prototype.get_category);
router.post('/categories/create', post_controller.prototype.load_categories);
//posts routes
router.get('/posts', post_controller.prototype.get_all_posts);
router.get('/posts/:id', post_controller.prototype.get_post);
router.get('/users/:userId/posts', post_controller.prototype.get_post_by_user);
router.get('/posts/category/:category', post_controller.prototype.get_post_by_category);
router.put('/posts/*', post_controller.prototype.update_this_post);
router.post('/posts/create', post_controller.prototype.save_post_details);
router.delete('/posts/delete/:id', post_controller.prototype.remove_post);


module.exports = router;
