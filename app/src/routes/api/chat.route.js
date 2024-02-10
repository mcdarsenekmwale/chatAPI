var express = require('express');
let chat_controller = require('../../controllers/chat_controller');
let ChatRoomMiddleware = require('../../helper/middleware/chat_room.middleware');
let AuthorizationMiddleware = require('../../helper/middleware/authorization');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//chat room routes
router.get('/chat-rooms',
   AuthorizationMiddleware.validateAdminRole, //only admin can access this route
  chat_controller.prototype.getAllChatRooms);
router.get('/chat-rooms/:roomId',
  chat_controller.prototype.getChatRoom);
router.put('/chat-rooms/*',
    ChatRoomMiddleware.isChatRoomOwner,
  chat_controller.prototype.updateChatRoom);
router.get('/chat-rooms/user/:uid', chat_controller.prototype.getUserChatRooms);
router.get('/users/:uid/chat-rooms', chat_controller.prototype.getUserChatRooms);
router.post('/chat-rooms/create', chat_controller.prototype.saveChatRoomDetails);
router.delete('/chat-rooms/*',
  AuthorizationMiddleware.validateAdminRole,
  chat_controller.prototype.removeChatRoom
);

//get rooms user is owner of
router.get('/users/:uid/owner/chat-rooms', chat_controller.prototype.getChatRoomsByOwnerUid);
//get room owners
router.get('/chat-rooms/:roomId/owners', chat_controller.prototype.getChatRoomOwnersByRoomId);

//join chat room
router.post('/chat-rooms/:roomId/join', chat_controller.prototype.joinChatRoom);
//add member to chat room
router.post('/chat-rooms/:roomId/add-member', chat_controller.prototype.addChatRoomMembers);
//remove member from chat room
router.post('/chat-rooms/:roomId/remove-member',
  ChatRoomMiddleware.isChatRoomOwner,
  chat_controller.prototype.removeChatRoomMembers);
//leave chat room
router.post('/chat-rooms/:roomId/leave', chat_controller.prototype.leaveChatRoom);

//add owner to chat room
router.post('/chat-rooms/:roomId/add-owner',
  ChatRoomMiddleware.isChatRoomOwner,
  chat_controller.prototype.addChatRoomOwner);
//remove owner from chat room
router.post('/chat-rooms/:roomId/remove-owner',
  ChatRoomMiddleware.isChatRoomOwner,
  chat_controller.prototype.removeChatRoomOwner);


//chat- messages routes
router.get('/chat-rooms/recent-messages/user/:uid', chat_controller.prototype.getAllChatRoomsRecentMessagesByUserUid);

router.get('/chat-messages/:chat_id', chat_controller.prototype.getChatMessageByChatId);
router.get('/chat-messages/user/:uid', chat_controller.prototype.getChatMessageByUserUid);
router.post('/chat-messages/create', chat_controller.prototype.saveChatMessageDetails);


module.exports = router;
