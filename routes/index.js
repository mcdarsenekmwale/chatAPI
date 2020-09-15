var express = require('express'),
    post_controller = require('../controllers/post_controller'),
    chat_controller = require('../controllers/chat_controller'),
    user_controller = require('../controllers/user_controllers');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//routes for users
router.get('/api/users', user_controller.get_all_users);
router.get('/api/user/:id', user_controller.get_user);
router.post('/api/user/store', user_controller.save_user_details);
router.delete('/api/user/delete/:id', user_controller.remove_user);
router.put('/api/user/put/:id', user_controller.update_user);

//chat room routes
router.get('/api/chat-room', chat_controller.getAllChatRooms);
router.get('/api/chat-room/:id', chat_controller.getChatRoom);
router.get('/api/chat-room/user/:uid', chat_controller.getUserChatRooms);
router.post('/api/chat-room/store', chat_controller.saveChatRoomDetails);
router.delete('/api/chat-room/delete/:id', chat_controller.removeChatRoom);
router.get('/api/chat-room/recent-messages/user/:uid', chat_controller.getAllChatRoomsRecentMessagesByUserUid);

//chat- messages routes
router.get('/api/chat-messages/:chat_id', chat_controller.getChatMessageByChatId);
router.get('/api/chat-messages/user/:uid', chat_controller.getChatMessageByUserUid);
router.post('/api/chat-messages/store', chat_controller.saveChatMessageDetails);

//category routes
router.get('/api/categories', post_controller.get_all_categories);
router.post('/api/categories/store', post_controller.load_categories);
//posts routes
router.get('/api/posts', post_controller.get_all_posts);
router.get('/api/posts/:id', post_controller.get_post);
router.get('/api/posts/user/:user_uid', post_controller.get_post_by_user);
router.get('/api/posts/category/:category', post_controller.get_post_by_category);
router.post('/api/posts/store', post_controller.save_post_details);
router.delete('/api/posts/delete/:id', post_controller.remove_post);

module.exports = router;
